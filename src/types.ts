/**
 * Core domain types for the Buyer Academy curriculum and learner progress.
 * All curriculum content is fictional demo data (see src/data/curriculum.ts).
 */

export type QuestionType = 'knowledge' | 'situational';

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
  type: QuestionType;
  /** The curriculum day (1-20) this question was authored for; used to pool/sample questions for checkpoints and certification and to group weak topics. */
  sourceDay: number;
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
  /** Answers as selected option indexes, in the order the questions were presented for this attempt. */
  answers: number[];
  correctCount: number;
  totalQuestions: number;
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

/** A weekly checkpoint gates progress after days 5, 10 and 15. */
export interface CheckpointProgress {
  anchorDay: number;
  attempts: QuizAttempt[];
  completed: boolean;
  completedAt?: string;
}

export interface PracticalCaseAnswer {
  ctrPercent: number | null;
  crPercent: number | null;
  cpaRub: number | null;
  roiPercent: number | null;
  problemIndex: number | null;
  actionIndices: number[];
}

export interface PracticalCaseResult {
  ctrCorrect: boolean;
  crCorrect: boolean;
  cpaCorrect: boolean;
  roiCorrect: boolean;
  problemCorrect: boolean;
  actionsCorrect: boolean;
  passed: boolean;
}

export interface PracticalCaseAttempt {
  timestamp: string;
  answer: PracticalCaseAnswer;
  result: PracticalCaseResult;
}

/** The day-20 final certification replaces the regular weekly checkpoint. */
export interface CertificationProgress {
  theoryAttempts: QuizAttempt[];
  theoryPassed: boolean;
  practicalAttempts: PracticalCaseAttempt[];
  practicalPassed: boolean;
  completed: boolean;
  completedAt?: string;
}

export interface ProgressState {
  /** Furthest day whose videos/quiz are accessible (1-20). Does not advance past a checkpoint-anchor day (5/10/15) until that checkpoint is passed, and stays at 20 until certification is completed. */
  unlockedDay: number;
  employeeName: string;
  startDate: string;
  days: Record<number, DayProgress>;
  checkpoints: Record<number, CheckpointProgress>;
  certification: CertificationProgress;
}

export const TOTAL_DAYS = 20;
export const VIDEOS_PER_DAY = 5;
export const QUESTIONS_PER_DAY = 10;
export const TOTAL_QUESTIONS = TOTAL_DAYS * QUESTIONS_PER_DAY;
export const KNOWLEDGE_QUESTIONS_PER_DAY = 7;
export const SITUATIONAL_QUESTIONS_PER_DAY = 3;
export const PASS_THRESHOLD_PERCENT = 80;

export const CHECKPOINT_ANCHOR_DAYS = [5, 10, 15] as const;
export const CHECKPOINT_SPAN_DAYS = 5;
export const CHECKPOINT_QUESTION_COUNT = 25;
export const CERTIFICATION_DAY = 20;
export const CERTIFICATION_QUESTION_COUNT = 40;

export function isCheckpointAnchorDay(day: number): boolean {
  return (CHECKPOINT_ANCHOR_DAYS as readonly number[]).includes(day);
}
