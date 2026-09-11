/**
 * Final-certification practical case: a fictional campaign the learner must
 * diagnose. Everything is graded client-side (numeric answers within a
 * tolerance, plus exact-match single/multi-select answers) — no backend or
 * API is involved.
 */
import type { PracticalCaseAnswer, PracticalCaseResult } from '../types';

export interface PracticalCaseMetrics {
  spendRub: number;
  impressions: number;
  clicks: number;
  conversions: number;
  payoutPerConversionRub: number;
}

export interface PracticalCaseExpected {
  ctrPercent: number;
  crPercent: number;
  cpaRub: number;
  roiPercent: number;
}

export interface PracticalCaseData {
  title: string;
  narrative: string;
  metrics: PracticalCaseMetrics;
  expected: PracticalCaseExpected;
  problemOptions: string[];
  correctProblemIndex: number;
  actionOptions: string[];
  correctActionIndices: number[];
}

export const PRACTICAL_CASE: PracticalCaseData = {
  title: 'Кейс: кампания «Fintech Pro RU»',
  narrative:
    'Учебная (вымышленная) кампания «Fintech Pro RU» отработала полную неделю. Ниже — итоговые цифры за этот период. ' +
    'Рассчитайте ключевые показатели, определите наиболее вероятную проблему связки и выберите подходящие следующие шаги.',
  metrics: {
    spendRub: 60000,
    impressions: 400000,
    clicks: 8000,
    conversions: 40,
    payoutPerConversionRub: 900,
  },
  expected: {
    ctrPercent: 2,
    crPercent: 0.5,
    cpaRub: 1500,
    roiPercent: -40,
  },
  problemOptions: [
    'Низкий CTR указывает на слабые креативы и нерелевантный трафик',
    'Низкая конверсия после клика при нормальном CTR — проблема, вероятно, в лендинге, оффере или трекинге конверсий',
    'Слишком высокий бюджет кампании автоматически вызывает падение ROI',
    'Источник трафика полностью нерелевантен, и его нужно полностью сменить',
  ],
  correctProblemIndex: 1,
  actionOptions: [
    'Проверить корректность передачи конверсий и настройку постбека в трекере',
    'Резко увеличить бюджет кампании, чтобы быстрее набрать статистику',
    'Протестировать альтернативный лендинг или прелендинг под этот оффер',
    'Сменить источник трафика на самый дешёвый из доступных без анализа',
    'Оставить кампанию без изменений и подождать ещё месяц',
  ],
  correctActionIndices: [0, 2],
};

function isWithinTolerance(
  value: number | null,
  expected: number,
  relativeTolerancePercent = 5,
  minAbsoluteTolerance = 0.75,
): boolean {
  if (value === null || Number.isNaN(value)) return false;
  const tolerance = Math.max(Math.abs(expected) * (relativeTolerancePercent / 100), minAbsoluteTolerance);
  return Math.abs(value - expected) <= tolerance;
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export function gradePracticalCase(answer: PracticalCaseAnswer): PracticalCaseResult {
  const { expected, correctProblemIndex, correctActionIndices } = PRACTICAL_CASE;

  const ctrCorrect = isWithinTolerance(answer.ctrPercent, expected.ctrPercent);
  const crCorrect = isWithinTolerance(answer.crPercent, expected.crPercent);
  const cpaCorrect = isWithinTolerance(answer.cpaRub, expected.cpaRub);
  const roiCorrect = isWithinTolerance(answer.roiPercent, expected.roiPercent);
  const problemCorrect = answer.problemIndex === correctProblemIndex;
  const actionsCorrect = sameSet(answer.actionIndices, correctActionIndices);

  const passed = ctrCorrect && crCorrect && cpaCorrect && roiCorrect && problemCorrect && actionsCorrect;

  return { ctrCorrect, crCorrect, cpaCorrect, roiCorrect, problemCorrect, actionsCorrect, passed };
}

export function emptyPracticalCaseAnswer(): PracticalCaseAnswer {
  return {
    ctrPercent: null,
    crPercent: null,
    cpaRub: null,
    roiPercent: null,
    problemIndex: null,
    actionIndices: [],
  };
}
