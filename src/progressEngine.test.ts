import { describe, expect, it } from 'vitest';
import { getDayPlan } from './data/curriculum';
import { emptyPracticalCaseAnswer, PRACTICAL_CASE } from './data/practicalCase';
import {
  allVideosWatched,
  canEditDay,
  canTakeCertificationPractical,
  canTakeCertificationTheory,
  canTakeCheckpoint,
  canTakeQuiz,
  getActiveItem,
  getCertificationPool,
  getCheckpointPool,
  isCheckpointCompleted,
  isDayUnlocked,
  isProgramCompleted,
  scoreQuiz,
  setVideoWatched,
  submitCertificationTheory,
  submitCheckpoint,
  submitDayQuiz,
  submitPracticalCase,
} from './progressEngine';
import { createInitialProgress } from './storage';
import type { PracticalCaseAnswer, ProgressState } from './types';
import { CERTIFICATION_QUESTION_COUNT, CHECKPOINT_QUESTION_COUNT } from './types';

function watchAllVideos(state: ProgressState, day: number): ProgressState {
  const plan = getDayPlan(day);
  if (!plan) throw new Error(`no plan for day ${day}`);
  let next = state;
  for (const v of plan.videos) {
    next = setVideoWatched(next, day, v.id, true);
  }
  return next;
}

/** Watches all videos and passes day `day` with a perfect score. */
function passDay(state: ProgressState, day: number): ProgressState {
  const plan = getDayPlan(day);
  if (!plan) throw new Error(`no plan for day ${day}`);
  const watched = watchAllVideos(state, day);
  const answers = plan.quiz.map((q) => q.correctIndex);
  const { state: next, result } = submitDayQuiz(watched, day, plan.quiz, answers);
  if (!result.passed) throw new Error(`expected day ${day} to pass`);
  return next;
}

function passCheckpoint(state: ProgressState, anchorDay: number): ProgressState {
  const questions = getCheckpointPool(anchorDay).slice(0, CHECKPOINT_QUESTION_COUNT);
  const answers = questions.map((q) => q.correctIndex);
  const { state: next, result } = submitCheckpoint(state, anchorDay, questions, answers);
  if (!result.passed) throw new Error(`expected checkpoint ${anchorDay} to pass`);
  return next;
}

/** Drives progress from day 1 all the way through day `throughDay`, passing every gate along the way. */
function progressThroughDay(throughDay: number): ProgressState {
  let state = createInitialProgress();
  for (let day = 1; day <= throughDay; day += 1) {
    state = passDay(state, day);
    if (day % 5 === 0 && day < 20) {
      state = passCheckpoint(state, day);
    }
  }
  return state;
}

describe('scoreQuiz', () => {
  it('scores a perfect attempt as passed with no review videos', () => {
    const plan = getDayPlan(1)!;
    const answers = plan.quiz.map((q) => q.correctIndex);
    const result = scoreQuiz(plan.quiz, answers);
    expect(result.scorePercent).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.reviewVideoIds).toHaveLength(0);
    expect(result.weakDays).toHaveLength(0);
  });

  it('fails an attempt below 80% and reports review videos/weak days', () => {
    const plan = getDayPlan(1)!;
    // Answer everything wrong by picking a different option than correct.
    const answers = plan.quiz.map((q) => (q.correctIndex === 0 ? 1 : 0));
    const result = scoreQuiz(plan.quiz, answers);
    expect(result.correctCount).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.reviewVideoIds.length).toBeGreaterThan(0);
    expect(result.weakDays).toEqual([1]);
  });

  it('passes at exactly the 80% threshold', () => {
    const plan = getDayPlan(1)!; // 10 questions
    const answers = plan.quiz.map((q, i) => (i < 8 ? q.correctIndex : q.correctIndex === 0 ? 1 : 0));
    const result = scoreQuiz(plan.quiz, answers);
    expect(result.scorePercent).toBe(80);
    expect(result.passed).toBe(true);
  });
});

describe('daily quiz submission', () => {
  it('passing a day marks it complete and unlocks the next non-anchor day', () => {
    const state = passDay(createInitialProgress(), 1);
    expect(state.days[1].completed).toBe(true);
    expect(state.unlockedDay).toBe(2);
    expect(canEditDay(state, 2)).toBe(true);
    expect(canEditDay(state, 1)).toBe(false);
  });

  it('failing a day unmarks the videos tied to wrong answers and re-locks the quiz', () => {
    const plan = getDayPlan(1)!;
    const watched = watchAllVideos(createInitialProgress(), 1);
    expect(canTakeQuiz(watched, 1)).toBe(true);

    const wrongAnswers = plan.quiz.map((q) => (q.correctIndex === 0 ? 1 : 0));
    const { state, result } = submitDayQuiz(watched, 1, plan.quiz, wrongAnswers);

    expect(result.passed).toBe(false);
    expect(state.days[1].completed).toBe(false);
    expect(state.unlockedDay).toBe(1);
    expect(allVideosWatched(state, 1)).toBe(false);
    expect(canTakeQuiz(state, 1)).toBe(false);
    // The specific review videos should now be unwatched.
    for (const videoId of result.reviewVideoIds) {
      expect(state.days[1].watchedVideoIds).not.toContain(videoId);
    }
  });

  it('passing a checkpoint-anchor day (5) does not unlock day 6 directly', () => {
    let state = createInitialProgress();
    for (let day = 1; day <= 5; day += 1) {
      state = passDay(state, day);
    }
    expect(state.unlockedDay).toBe(5);
    expect(isDayUnlocked(state, 6)).toBe(false);
    expect(getActiveItem(state)).toEqual({ type: 'checkpoint', anchorDay: 5 });
  });
});

describe('weekly checkpoints', () => {
  it('locks day 6 until the day-5 checkpoint is passed, then unlocks it', () => {
    let state = createInitialProgress();
    for (let day = 1; day <= 5; day += 1) state = passDay(state, day);

    expect(canTakeCheckpoint(state, 5)).toBe(true);
    expect(canEditDay(state, 6)).toBe(false);

    state = passCheckpoint(state, 5);

    expect(isCheckpointCompleted(state, 5)).toBe(true);
    expect(state.unlockedDay).toBe(6);
    expect(canEditDay(state, 6)).toBe(true);
    expect(getActiveItem(state)).toEqual({ type: 'day', day: 6 });
  });

  it('a failed checkpoint identifies weak topics and allows retry without unlocking the next day', () => {
    let state = createInitialProgress();
    for (let day = 1; day <= 5; day += 1) state = passDay(state, day);

    const pool = getCheckpointPool(5).slice(0, CHECKPOINT_QUESTION_COUNT);
    const wrongAnswers = pool.map((q) => (q.correctIndex === 0 ? 1 : 0));
    const { state: afterFail, result } = submitCheckpoint(state, 5, pool, wrongAnswers);

    expect(result.passed).toBe(false);
    expect(result.weakDays.length).toBeGreaterThan(0);
    expect(afterFail.checkpoints[5].completed).toBe(false);
    expect(afterFail.unlockedDay).toBe(5);
    expect(canTakeCheckpoint(afterFail, 5)).toBe(true);

    // Retry with correct answers succeeds.
    const retryPool = getCheckpointPool(5).slice(0, CHECKPOINT_QUESTION_COUNT);
    const correctAnswers = retryPool.map((q) => q.correctIndex);
    const { state: afterPass, result: retryResult } = submitCheckpoint(afterFail, 5, retryPool, correctAnswers);
    expect(retryResult.passed).toBe(true);
    expect(afterPass.unlockedDay).toBe(6);
  });

  it('the checkpoint question pool is reused from daily questions, not a separate bank', () => {
    const pool = getCheckpointPool(10);
    const days = new Set(pool.map((q) => q.sourceDay));
    expect(days).toEqual(new Set([6, 7, 8, 9, 10]));
  });
});

describe('final certification', () => {
  it('requires both theory and the practical case to complete the program', () => {
    let state = progressThroughDay(20);
    expect(getActiveItem(state)).toEqual({ type: 'certification' });
    expect(isProgramCompleted(state)).toBe(false);

    const theoryQuestions = getCertificationPool().slice(0, CERTIFICATION_QUESTION_COUNT);
    const theoryAnswers = theoryQuestions.map((q) => q.correctIndex);
    const theoryOutcome = submitCertificationTheory(state, theoryQuestions, theoryAnswers);
    state = theoryOutcome.state;
    expect(theoryOutcome.result.passed).toBe(true);
    expect(state.certification.theoryPassed).toBe(true);
    expect(isProgramCompleted(state)).toBe(false); // practical still missing
    expect(canTakeCertificationTheory(state)).toBe(false);
    expect(canTakeCertificationPractical(state)).toBe(true);

    const correctAnswer: PracticalCaseAnswer = {
      ...emptyPracticalCaseAnswer(),
      ctrPercent: PRACTICAL_CASE.expected.ctrPercent,
      crPercent: PRACTICAL_CASE.expected.crPercent,
      cpaRub: PRACTICAL_CASE.expected.cpaRub,
      roiPercent: PRACTICAL_CASE.expected.roiPercent,
      problemIndex: PRACTICAL_CASE.correctProblemIndex,
      actionIndices: PRACTICAL_CASE.correctActionIndices,
    };
    const practicalOutcome = submitPracticalCase(state, correctAnswer);
    state = practicalOutcome.state;

    expect(practicalOutcome.result.passed).toBe(true);
    expect(state.certification.completed).toBe(true);
    expect(isProgramCompleted(state)).toBe(true);
    expect(getActiveItem(state)).toEqual({ type: 'done' });
  });

  it('failing the theory quiz keeps certification incomplete and reports weak days', () => {
    const state = progressThroughDay(20);
    const questions = getCertificationPool().slice(0, CERTIFICATION_QUESTION_COUNT);
    const wrongAnswers = questions.map((q) => (q.correctIndex === 0 ? 1 : 0));
    const { state: after, result } = submitCertificationTheory(state, questions, wrongAnswers);

    expect(result.passed).toBe(false);
    expect(result.weakDays.length).toBeGreaterThan(0);
    expect(after.certification.theoryPassed).toBe(false);
    expect(after.certification.completed).toBe(false);
    expect(canTakeCertificationTheory(after)).toBe(true);
  });

  it('the certification pool spans the full 20-day course', () => {
    const pool = getCertificationPool();
    const days = new Set(pool.map((q) => q.sourceDay));
    expect(days.size).toBe(20);
  });
});
