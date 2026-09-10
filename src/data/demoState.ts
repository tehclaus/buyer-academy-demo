import { getDayPlan } from './curriculum';
import { DEMO_EMPLOYEE_NAME } from '../storage';
import type { DayProgress, ProgressState, QuizAttempt } from '../types';

const DEMO_ANCHOR_DAY = 8;
const DEMO_START_OFFSET_DAYS = 11;

function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function buildPassedAttempt(day: number, whenDaysAgo: number): QuizAttempt {
  const plan = getDayPlan(day);
  if (!plan) throw new Error(`Unknown day ${day} in demo state`);
  const answers = plan.quiz.map((q) => q.correctIndex);
  return {
    timestamp: daysAgoIso(whenDaysAgo),
    answers,
    correctCount: plan.quiz.length,
    scorePercent: 100,
    passed: true,
  };
}

/**
 * Demo scenario for interviewers: days 1-7 are already completed with a
 * perfect quiz attempt, and day 8 (pixels / click IDs / postbacks /
 * attribution) is in progress with 4 of its 5 videos already watched.
 * Completing the last video and passing the day-8 quiz unlocks day 9.
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
      attempts: [buildPassedAttempt(day, whenDaysAgo)],
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

  return {
    unlockedDay: DEMO_ANCHOR_DAY,
    employeeName: DEMO_EMPLOYEE_NAME,
    startDate: daysAgoIso(DEMO_START_OFFSET_DAYS),
    days,
  };
}
