import type { CertificationProgress, ProgressState } from './types';

// Bumped from v1: progress now includes weekly checkpoints and the final
// certification. Old v1 data is intentionally not migrated — an unrecognized
// shape simply falls back to a fresh start (see loadProgress below).
const STORAGE_KEY = 'buyer-academy:progress:v2';

export const DEMO_EMPLOYEE_NAME = 'Анна Смирнова (демо-стажёр)';

function createEmptyCertification(): CertificationProgress {
  return {
    theoryAttempts: [],
    theoryPassed: false,
    practicalAttempts: [],
    practicalPassed: false,
    completed: false,
  };
}

export function createInitialProgress(): ProgressState {
  return {
    unlockedDay: 1,
    employeeName: DEMO_EMPLOYEE_NAME,
    startDate: new Date().toISOString(),
    days: {},
    checkpoints: {},
    certification: createEmptyCertification(),
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    if (
      !parsed ||
      typeof parsed.unlockedDay !== 'number' ||
      typeof parsed.days !== 'object' ||
      typeof parsed.checkpoints !== 'object' ||
      typeof parsed.certification !== 'object'
    ) {
      return createInitialProgress();
    }
    return parsed;
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota) — progress stays in-memory for this session
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
