import { useCallback, useEffect, useState } from 'react';
import { buildDemoProgress } from '../data/demoState';
import * as engine from '../progressEngine';
import { clearProgress, createInitialProgress, loadProgress, saveProgress } from '../storage';
import type { ProgressState } from '../types';

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const markVideoWatched = useCallback((day: number, videoId: string, watched: boolean) => {
    setState((prev) => engine.setVideoWatched(prev, day, videoId, watched));
  }, []);

  const submitQuiz = useCallback(
    (day: number, answers: number[]): engine.QuizResult => {
      const outcome = engine.submitQuizAnswers(state, day, answers);
      setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const loadDemoState = useCallback(() => {
    setState(buildDemoProgress());
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setState(createInitialProgress());
  }, []);

  return {
    state,
    markVideoWatched,
    submitQuiz,
    loadDemoState,
    resetProgress,
  };
}
