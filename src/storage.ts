import type { ProgressState } from './types';

const STORAGE_KEY = 'buyer-academy:progress:v1';

export const DEMO_EMPLOYEE_NAME = 'Анна Смирнова (демо-стажёр)';

export function createInitialProgress(): ProgressState {
  return {
    unlockedDay: 1,
    employeeName: DEMO_EMPLOYEE_NAME,
    startDate: new Date().toISOString(),
    days: {},
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || typeof parsed.unlockedDay !== 'number' || typeof parsed.days !== 'object') {
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
