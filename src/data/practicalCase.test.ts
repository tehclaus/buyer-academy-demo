import { describe, expect, it } from 'vitest';
import { emptyPracticalCaseAnswer, gradePracticalCase, PRACTICAL_CASE } from './practicalCase';
import type { PracticalCaseAnswer } from '../types';

function correctAnswer(): PracticalCaseAnswer {
  return {
    ...emptyPracticalCaseAnswer(),
    ctrPercent: PRACTICAL_CASE.expected.ctrPercent,
    crPercent: PRACTICAL_CASE.expected.crPercent,
    cpaRub: PRACTICAL_CASE.expected.cpaRub,
    roiPercent: PRACTICAL_CASE.expected.roiPercent,
    problemIndex: PRACTICAL_CASE.correctProblemIndex,
    actionIndices: [...PRACTICAL_CASE.correctActionIndices],
  };
}

describe('practical case grading', () => {
  it('passes a fully correct answer', () => {
    const result = gradePracticalCase(correctAnswer());
    expect(result).toEqual({
      ctrCorrect: true,
      crCorrect: true,
      cpaCorrect: true,
      roiCorrect: true,
      problemCorrect: true,
      actionsCorrect: true,
      passed: true,
    });
  });

  it('accepts small rounding differences within tolerance', () => {
    const answer = correctAnswer();
    answer.cpaRub = PRACTICAL_CASE.expected.cpaRub + 10; // small rounding slack
    const result = gradePracticalCase(answer);
    expect(result.cpaCorrect).toBe(true);
    expect(result.passed).toBe(true);
  });

  it('rejects a materially wrong metric and fails overall', () => {
    const answer = correctAnswer();
    answer.roiPercent = 40; // sign error: should be -40
    const result = gradePracticalCase(answer);
    expect(result.roiCorrect).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('rejects an unfilled numeric field', () => {
    const answer = correctAnswer();
    answer.ctrPercent = null;
    const result = gradePracticalCase(answer);
    expect(result.ctrCorrect).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('rejects the wrong diagnosed problem', () => {
    const answer = correctAnswer();
    answer.problemIndex = 0;
    const result = gradePracticalCase(answer);
    expect(result.problemCorrect).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('rejects an incomplete or incorrect action set', () => {
    const answer = correctAnswer();
    answer.actionIndices = [PRACTICAL_CASE.correctActionIndices[0]]; // missing one correct action
    const result = gradePracticalCase(answer);
    expect(result.actionsCorrect).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('rejects an action set with an extra wrong action added', () => {
    const answer = correctAnswer();
    answer.actionIndices = [...PRACTICAL_CASE.correctActionIndices, 1];
    const result = gradePracticalCase(answer);
    expect(result.actionsCorrect).toBe(false);
  });
});
