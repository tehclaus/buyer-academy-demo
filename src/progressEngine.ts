import { gradePracticalCase } from './data/practicalCase';
import { getAllQuizQuestions, getDayPlan, getQuestionPoolForDayRange } from './data/curriculum';
import {
  CERTIFICATION_DAY,
  CHECKPOINT_ANCHOR_DAYS,
  CHECKPOINT_SPAN_DAYS,
  PASS_THRESHOLD_PERCENT,
  TOTAL_DAYS,
  isCheckpointAnchorDay,
} from './types';
import type {
  CertificationProgress,
  CheckpointProgress,
  DayProgress,
  PracticalCaseAnswer,
  PracticalCaseResult,
  ProgressState,
  QuizAttempt,
  QuizQuestion,
} from './types';

export function getDayProgress(state: ProgressState, day: number): DayProgress {
  return (
    state.days[day] ?? {
      day,
      watchedVideoIds: [],
      attempts: [],
      completed: false,
    }
  );
}

export function getCheckpointProgress(state: ProgressState, anchorDay: number): CheckpointProgress {
  return state.checkpoints[anchorDay] ?? { anchorDay, attempts: [], completed: false };
}

export function isDayUnlocked(state: ProgressState, day: number): boolean {
  return day <= state.unlockedDay;
}

export function isDayCompleted(state: ProgressState, day: number): boolean {
  return Boolean(state.days[day]?.completed);
}

export function isCheckpointCompleted(state: ProgressState, anchorDay: number): boolean {
  return Boolean(state.checkpoints[anchorDay]?.completed);
}

export function isProgramCompleted(state: ProgressState): boolean {
  return state.certification.completed;
}

/** What the learner should be doing right now: a day's content, a pending checkpoint, the final certification, or nothing (done). */
export type ActiveItem =
  | { type: 'day'; day: number }
  | { type: 'checkpoint'; anchorDay: number }
  | { type: 'certification' }
  | { type: 'done' };

export function getActiveItem(state: ProgressState): ActiveItem {
  for (const anchorDay of CHECKPOINT_ANCHOR_DAYS) {
    if (isDayCompleted(state, anchorDay) && !isCheckpointCompleted(state, anchorDay)) {
      return { type: 'checkpoint', anchorDay };
    }
  }
  if (isDayCompleted(state, CERTIFICATION_DAY)) {
    return state.certification.completed ? { type: 'done' } : { type: 'certification' };
  }
  return { type: 'day', day: state.unlockedDay };
}

export function canEditDay(state: ProgressState, day: number): boolean {
  const active = getActiveItem(state);
  return active.type === 'day' && active.day === day;
}

export function isVideoWatched(state: ProgressState, day: number, videoId: string): boolean {
  return getDayProgress(state, day).watchedVideoIds.includes(videoId);
}

export function allVideosWatched(state: ProgressState, day: number): boolean {
  const plan = getDayPlan(day);
  if (!plan) return false;
  const progress = getDayProgress(state, day);
  return plan.videos.every((v) => progress.watchedVideoIds.includes(v.id));
}

export function canTakeQuiz(state: ProgressState, day: number): boolean {
  return canEditDay(state, day) && !isDayCompleted(state, day) && allVideosWatched(state, day);
}

export function setVideoWatched(
  state: ProgressState,
  day: number,
  videoId: string,
  watched: boolean,
): ProgressState {
  if (!canEditDay(state, day)) return state;

  const progress = getDayProgress(state, day);
  const set = new Set(progress.watchedVideoIds);
  if (watched) {
    set.add(videoId);
  } else {
    set.delete(videoId);
  }

  const updatedDay: DayProgress = { ...progress, watchedVideoIds: Array.from(set) };
  return { ...state, days: { ...state.days, [day]: updatedDay } };
}

// ---------- Checkpoints ----------

/** [startDay, endDay] inclusive range of days a checkpoint covers. */
export function getCheckpointDayRange(anchorDay: number): [number, number] {
  return [anchorDay - CHECKPOINT_SPAN_DAYS + 1, anchorDay];
}

/** The pool checkpoint questions are sampled from — reuses the daily question bank, no separate question set. */
export function getCheckpointPool(anchorDay: number): QuizQuestion[] {
  const [start, end] = getCheckpointDayRange(anchorDay);
  return getQuestionPoolForDayRange(start, end);
}

export function canTakeCheckpoint(state: ProgressState, anchorDay: number): boolean {
  const active = getActiveItem(state);
  return active.type === 'checkpoint' && active.anchorDay === anchorDay;
}

// ---------- Certification ----------

/** The pool the day-20 certification theory section samples from — the full 200-question course bank. */
export function getCertificationPool(): QuizQuestion[] {
  return getAllQuizQuestions();
}

export function canTakeCertificationTheory(state: ProgressState): boolean {
  const active = getActiveItem(state);
  return active.type === 'certification' && !state.certification.theoryPassed;
}

export function canTakeCertificationPractical(state: ProgressState): boolean {
  const active = getActiveItem(state);
  return active.type === 'certification' && state.certification.theoryPassed && !state.certification.practicalPassed;
}

// ---------- Scoring ----------

export interface QuizResult {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  /** Unique video ids to review, derived from incorrectly answered questions. */
  reviewVideoIds: string[];
  /** Unique source days of incorrectly answered questions — the "weak topics" for this attempt. */
  weakDays: number[];
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: number[],
  passThresholdPercent: number = PASS_THRESHOLD_PERCENT,
): QuizResult {
  const reviewVideoIds = new Set<string>();
  const weakDays = new Set<number>();
  let correctCount = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) {
      correctCount += 1;
    } else {
      reviewVideoIds.add(q.reviewVideoId);
      weakDays.add(q.sourceDay);
    }
  });

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = scorePercent >= passThresholdPercent;

  return {
    scorePercent,
    correctCount,
    totalQuestions,
    passed,
    reviewVideoIds: Array.from(reviewVideoIds),
    weakDays: Array.from(weakDays).sort((a, b) => a - b),
  };
}

function toAttempt(result: QuizResult, answers: number[], timestamp: string): QuizAttempt {
  return {
    timestamp,
    answers,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    scorePercent: result.scorePercent,
    passed: result.passed,
  };
}

/** Submit a regular daily quiz (10 questions). `questions` must be the exact (possibly shuffled) set shown to the learner. */
export function submitDayQuiz(
  state: ProgressState,
  day: number,
  questions: QuizQuestion[],
  answers: number[],
): { state: ProgressState; result: QuizResult } {
  const result = scoreQuiz(questions, answers);
  const now = new Date().toISOString();
  const attempt = toAttempt(result, answers, now);

  const progress = getDayProgress(state, day);
  const attempts = [...progress.attempts, attempt];

  let watchedVideoIds = progress.watchedVideoIds;
  if (!result.passed) {
    const toReview = new Set(result.reviewVideoIds);
    watchedVideoIds = watchedVideoIds.filter((id) => !toReview.has(id));
  }

  const updatedDay: DayProgress = {
    ...progress,
    attempts,
    watchedVideoIds,
    completed: result.passed,
    completedAt: result.passed ? now : progress.completedAt,
  };

  let unlockedDay = state.unlockedDay;
  if (result.passed && day < TOTAL_DAYS && !isCheckpointAnchorDay(day)) {
    unlockedDay = Math.max(unlockedDay, Math.min(day + 1, TOTAL_DAYS));
  }
  // If `day` is a checkpoint anchor (5/10/15) or the final day (20), unlockedDay
  // intentionally does not advance — getActiveItem() routes to the checkpoint
  // or certification instead until it is passed.

  const newState: ProgressState = { ...state, unlockedDay, days: { ...state.days, [day]: updatedDay } };
  return { state: newState, result };
}

/** Submit a weekly checkpoint (25 questions sampled from the preceding 5 days). */
export function submitCheckpoint(
  state: ProgressState,
  anchorDay: number,
  questions: QuizQuestion[],
  answers: number[],
): { state: ProgressState; result: QuizResult } {
  const result = scoreQuiz(questions, answers);
  const now = new Date().toISOString();
  const attempt = toAttempt(result, answers, now);

  const progress = getCheckpointProgress(state, anchorDay);
  const attempts = [...progress.attempts, attempt];
  const passedNow = result.passed || progress.completed;

  const updatedCheckpoint: CheckpointProgress = {
    ...progress,
    attempts,
    completed: passedNow,
    completedAt: result.passed ? now : progress.completedAt,
  };

  let unlockedDay = state.unlockedDay;
  if (result.passed) {
    unlockedDay = Math.max(unlockedDay, Math.min(anchorDay + 1, TOTAL_DAYS));
  }

  const newState: ProgressState = {
    ...state,
    unlockedDay,
    checkpoints: { ...state.checkpoints, [anchorDay]: updatedCheckpoint },
  };
  return { state: newState, result };
}

/** Submit the day-20 certification theory section (40 questions sampled from the full course). */
export function submitCertificationTheory(
  state: ProgressState,
  questions: QuizQuestion[],
  answers: number[],
): { state: ProgressState; result: QuizResult } {
  const result = scoreQuiz(questions, answers);
  const now = new Date().toISOString();
  const attempt = toAttempt(result, answers, now);

  const theoryAttempts = [...state.certification.theoryAttempts, attempt];
  const theoryPassed = result.passed || state.certification.theoryPassed;
  const completed = theoryPassed && state.certification.practicalPassed;

  const updatedCertification: CertificationProgress = {
    ...state.certification,
    theoryAttempts,
    theoryPassed,
    completed,
    completedAt: completed ? now : state.certification.completedAt,
  };

  return { state: { ...state, certification: updatedCertification }, result };
}

/** Submit the practical campaign case. Both this and the theory quiz must pass to finish the program. */
export function submitPracticalCase(
  state: ProgressState,
  answer: PracticalCaseAnswer,
): { state: ProgressState; result: PracticalCaseResult } {
  const result = gradePracticalCase(answer);
  const now = new Date().toISOString();

  const practicalAttempts = [...state.certification.practicalAttempts, { timestamp: now, answer, result }];
  const practicalPassed = result.passed || state.certification.practicalPassed;
  const completed = state.certification.theoryPassed && practicalPassed;

  const updatedCertification: CertificationProgress = {
    ...state.certification,
    practicalAttempts,
    practicalPassed,
    completed,
    completedAt: completed ? now : state.certification.completedAt,
  };

  return { state: { ...state, certification: updatedCertification }, result };
}

// ---------- Status summary ----------

export interface StatusSummary {
  employeeName: string;
  activeItem: ActiveItem;
  totalDays: number;
  daysCompleted: number;
  videosWatched: number;
  totalVideos: number;
  averageScorePercent: number | null;
  attemptsOnCurrentItem: number;
  needsAttention: boolean;
  programCompleted: boolean;
}

function attemptsForActiveItem(state: ProgressState, active: ActiveItem): number {
  if (active.type === 'day') return state.days[active.day]?.attempts.length ?? 0;
  if (active.type === 'checkpoint') return state.checkpoints[active.anchorDay]?.attempts.length ?? 0;
  if (active.type === 'certification') {
    return state.certification.theoryPassed
      ? state.certification.practicalAttempts.length
      : state.certification.theoryAttempts.length;
  }
  return 0;
}

export function computeStatusSummary(state: ProgressState): StatusSummary {
  let daysCompleted = 0;
  let videosWatched = 0;
  let totalVideos = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (let day = 1; day <= TOTAL_DAYS; day += 1) {
    const plan = getDayPlan(day);
    if (!plan) continue;
    totalVideos += plan.videos.length;

    const progress = state.days[day];
    if (!progress) continue;

    videosWatched += progress.watchedVideoIds.length;
    if (progress.completed) {
      daysCompleted += 1;
      const passedAttempt = [...progress.attempts].reverse().find((a) => a.passed);
      if (passedAttempt) {
        scoreSum += passedAttempt.scorePercent;
        scoreCount += 1;
      }
    }
  }

  const activeItem = getActiveItem(state);
  const attemptsOnCurrentItem = attemptsForActiveItem(state, activeItem);
  const programCompleted = isProgramCompleted(state);

  return {
    employeeName: state.employeeName,
    activeItem,
    totalDays: TOTAL_DAYS,
    daysCompleted,
    videosWatched,
    totalVideos,
    averageScorePercent: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    attemptsOnCurrentItem,
    needsAttention: !programCompleted && attemptsOnCurrentItem >= 2,
    programCompleted,
  };
}
