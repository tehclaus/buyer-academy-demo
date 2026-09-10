/**
 * Core domain types for the Buyer Academy curriculum and learner progress.
 * All curriculum content is fictional demo data (see src/data/curriculum.ts).
 */

export interface Video {
  id: string;
  /** 1-based position within the day (1-5) */
  order: number;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  /** Video id the learner should re-watch if this question is answered incorrectly */
  reviewVideoId: string;
}

export interface DayPlan {
  day: number;
  moduleId: number;
  title: string;
  objective: string;
  videos: Video[];
  quiz: QuizQuestion[];
}

export interface ModulePlan {
  id: number;
  title: string;
  dayStart: number;
  dayEnd: number;
}

export interface QuizAttempt {
  timestamp: string;
  answers: number[];
  correctCount: number;
  scorePercent: number;
  passed: boolean;
}

export interface DayProgress {
  day: number;
  watchedVideoIds: string[];
  attempts: QuizAttempt[];
  completed: boolean;
  completedAt?: string;
}

export interface ProgressState {
  /** Furthest day the learner has unlocked (1-20) */
  unlockedDay: number;
  employeeName: string;
  startDate: string;
  days: Record<number, DayProgress>;
}

export const TOTAL_DAYS = 20;
export const VIDEOS_PER_DAY = 5;
export const QUESTIONS_PER_DAY = 5;
export const PASS_THRESHOLD_PERCENT = 80;
