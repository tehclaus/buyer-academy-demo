import { getDayPlan } from './data/curriculum';
import { PASS_THRESHOLD_PERCENT, TOTAL_DAYS } from './types';
import type { DayProgress, ProgressState, QuizAttempt } from './types';

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

export function isDayUnlocked(state: ProgressState, day: number): boolean {
  return day <= state.unlockedDay;
}

export function isDayCompleted(state: ProgressState, day: number): boolean {
  return Boolean(state.days[day]?.completed);
}

/** The day the learner is currently working through (editable). */
export function getActiveDay(state: ProgressState): number {
  return state.unlockedDay;
}

export function isProgramCompleted(state: ProgressState): boolean {
  return state.unlockedDay >= TOTAL_DAYS && isDayCompleted(state, TOTAL_DAYS);
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
  return day === getActiveDay(state) && !isDayCompleted(state, day) && allVideosWatched(state, day);
}

export function canEditDay(state: ProgressState, day: number): boolean {
  return day === getActiveDay(state) && !isDayCompleted(state, day);
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

export interface QuizResult {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  reviewVideoIds: string[];
}

export function submitQuizAnswers(
  state: ProgressState,
  day: number,
  answers: number[],
): { state: ProgressState; result: QuizResult } {
  const plan = getDayPlan(day);
  if (!plan) throw new Error(`Unknown day ${day}`);

  const reviewVideoIds: string[] = [];
  let correctCount = 0;
  plan.quiz.forEach((q, i) => {
    if (answers[i] === q.correctIndex) {
      correctCount += 1;
    } else {
      reviewVideoIds.push(q.reviewVideoId);
    }
  });

  const totalQuestions = plan.quiz.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= PASS_THRESHOLD_PERCENT;
  const now = new Date().toISOString();

  const attempt: QuizAttempt = {
    timestamp: now,
    answers,
    correctCount,
    scorePercent,
    passed,
  };

  const progress = getDayProgress(state, day);
  const attempts = [...progress.attempts, attempt];

  let watchedVideoIds = progress.watchedVideoIds;
  if (!passed) {
    const toReview = new Set(reviewVideoIds);
    watchedVideoIds = watchedVideoIds.filter((id) => !toReview.has(id));
  }

  const updatedDay: DayProgress = {
    ...progress,
    attempts,
    watchedVideoIds,
    completed: passed,
    completedAt: passed ? now : progress.completedAt,
  };

  const nextUnlockedDay = passed ? Math.min(day + 1, TOTAL_DAYS) : state.unlockedDay;

  const newState: ProgressState = {
    ...state,
    unlockedDay: Math.max(state.unlockedDay, nextUnlockedDay),
    days: { ...state.days, [day]: updatedDay },
  };

  return {
    state: newState,
    result: { scorePercent, correctCount, totalQuestions, passed, reviewVideoIds },
  };
}

export interface StatusSummary {
  employeeName: string;
  currentDay: number;
  totalDays: number;
  daysCompleted: number;
  videosWatched: number;
  totalVideos: number;
  averageScorePercent: number | null;
  attemptsOnCurrentDay: number;
  needsAttention: boolean;
  programCompleted: boolean;
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

  const activeDay = getActiveDay(state);
  const attemptsOnCurrentDay = state.days[activeDay]?.attempts.length ?? 0;
  const programCompleted = isProgramCompleted(state);

  return {
    employeeName: state.employeeName,
    currentDay: activeDay,
    totalDays: TOTAL_DAYS,
    daysCompleted,
    videosWatched,
    totalVideos,
    averageScorePercent: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    attemptsOnCurrentDay,
    needsAttention: !programCompleted && attemptsOnCurrentDay >= 2,
    programCompleted,
  };
}
