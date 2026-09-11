import type { QuizQuestion } from './types';

/** Fisher-Yates shuffle — returns a new array, does not mutate the input. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Picks `count` questions at random from `pool` (no duplicates). If the pool is smaller than `count`, returns the whole (shuffled) pool. */
export function sampleQuestions(pool: QuizQuestion[], count: number): QuizQuestion[] {
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/**
 * Returns a copy of the question with its answer options shuffled and
 * `correctIndex` remapped to match the new order, so downstream scoring
 * (which compares a selected option index to `correctIndex`) stays correct.
 */
function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const optionOrder = shuffle([0, 1, 2, 3]);
  const options = optionOrder.map((originalIndex) => question.options[originalIndex]) as QuizQuestion['options'];
  const correctIndex = optionOrder.indexOf(question.correctIndex) as QuizQuestion['correctIndex'];
  return { ...question, options, correctIndex };
}

/**
 * Prepares a fresh attempt: randomizes question order and, within each
 * question, randomizes answer-option order — while preserving which option
 * is correct, so scoring against the returned array's `correctIndex`
 * remains accurate. Call this once per attempt (e.g. on component mount).
 */
export function prepareAttempt(questions: QuizQuestion[]): QuizQuestion[] {
  return shuffle(questions).map(shuffleQuestionOptions);
}
