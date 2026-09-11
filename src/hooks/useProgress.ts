import { useCallback, useEffect, useState } from 'react';
import { buildDemoProgress } from '../data/demoState';
import * as engine from '../progressEngine';
import { clearProgress, createInitialProgress, loadProgress, saveProgress } from '../storage';
import type { PracticalCaseAnswer, PracticalCaseResult, ProgressState, QuizQuestion } from '../types';

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const markVideoWatched = useCallback((day: number, videoId: string, watched: boolean) => {
    setState((prev) => engine.setVideoWatched(prev, day, videoId, watched));
  }, []);

  const submitDayQuiz = useCallback(
    (day: number, questions: QuizQuestion[], answers: number[]): engine.QuizResult => {
      const outcome = engine.submitDayQuiz(state, day, questions, answers);
      setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const submitCheckpoint = useCallback(
    (anchorDay: number, questions: QuizQuestion[], answers: number[]): engine.QuizResult => {
      const outcome = engine.submitCheckpoint(state, anchorDay, questions, answers);
      setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const submitCertificationTheory = useCallback(
    (questions: QuizQuestion[], answers: number[]): engine.QuizResult => {
      const outcome = engine.submitCertificationTheory(state, questions, answers);
      setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const submitPracticalCase = useCallback(
    (answer: PracticalCaseAnswer): PracticalCaseResult => {
      const outcome = engine.submitPracticalCase(state, answer);
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
    submitDayQuiz,
    submitCheckpoint,
    submitCertificationTheory,
    submitPracticalCase,
    loadDemoState,
    resetProgress,
  };
}
