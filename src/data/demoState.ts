import { getDayPlan } from './curriculum';
import { DEMO_EMPLOYEE_NAME } from '../storage';
import type { CheckpointProgress, DayProgress, ProgressState, QuizAttempt } from '../types';

const DEMO_ANCHOR_DAY = 8;
const DEMO_CHECKPOINT_DAY = 5;
const DEMO_CHECKPOINT_QUESTION_COUNT = 25;
const DEMO_START_OFFSET_DAYS = 12;

function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function buildPassedDayAttempt(day: number, whenDaysAgo: number): QuizAttempt {
  const plan = getDayPlan(day);
  if (!plan) throw new Error(`Unknown day ${day} in demo state`);
  const answers = plan.quiz.map((q) => q.correctIndex);
  return {
    timestamp: daysAgoIso(whenDaysAgo),
    answers,
    correctCount: plan.quiz.length,
    totalQuestions: plan.quiz.length,
    scorePercent: 100,
    passed: true,
  };
}

/** A synthetic passed attempt for the checkpoint after day 5 — the actual questions shown are randomly sampled/shuffled per attempt, so only the historical record (score, pass/fail) is reconstructed here. */
function buildPassedCheckpointAttempt(whenDaysAgo: number): QuizAttempt {
  return {
    timestamp: daysAgoIso(whenDaysAgo),
    answers: new Array(DEMO_CHECKPOINT_QUESTION_COUNT).fill(0),
    correctCount: DEMO_CHECKPOINT_QUESTION_COUNT,
    totalQuestions: DEMO_CHECKPOINT_QUESTION_COUNT,
    scorePercent: 100,
    passed: true,
  };
}

/**
 * Demo scenario for interviewers: days 1-7 are already completed (including
 * the checkpoint required after day 5), and day 8 (pixels / click IDs /
 * postbacks / attribution) is in progress with 4 of its 5 videos already
 * watched. Completing the last video and passing the 10-question day-8 quiz
 * unlocks day 9 — the whole flow takes about three minutes.
 */
export function buildDemoProgress(): ProgressState {
  const days: Record<number, DayProgress> = {};

  for (let day = 1; day <= 7; day += 1) {
    const plan = getDayPlan(day);
    if (!plan) continue;
    const whenDaysAgo = DEMO_START_OFFSET_DAYS - day;
    days[day] = {
      day,
      watchedVideoIds: plan.videos.map((v) => v.id),
      attempts: [buildPassedDayAttempt(day, whenDaysAgo)],
      completed: true,
      completedAt: daysAgoIso(whenDaysAgo),
    };
  }

  const day8Plan = getDayPlan(DEMO_ANCHOR_DAY);
  if (day8Plan) {
    days[DEMO_ANCHOR_DAY] = {
      day: DEMO_ANCHOR_DAY,
      watchedVideoIds: day8Plan.videos.slice(0, 4).map((v) => v.id),
      attempts: [],
      completed: false,
    };
  }

  const checkpointWhenDaysAgo = DEMO_START_OFFSET_DAYS - DEMO_CHECKPOINT_DAY;
  const checkpoints: Record<number, CheckpointProgress> = {
    [DEMO_CHECKPOINT_DAY]: {
      anchorDay: DEMO_CHECKPOINT_DAY,
      attempts: [buildPassedCheckpointAttempt(checkpointWhenDaysAgo)],
      completed: true,
      completedAt: daysAgoIso(checkpointWhenDaysAgo),
    },
  };

  return {
    unlockedDay: DEMO_ANCHOR_DAY,
    employeeName: DEMO_EMPLOYEE_NAME,
    startDate: daysAgoIso(DEMO_START_OFFSET_DAYS),
    days,
    checkpoints,
    certification: {
      theoryAttempts: [],
      theoryPassed: false,
      practicalAttempts: [],
      practicalPassed: false,
      completed: false,
    },
  };
}
