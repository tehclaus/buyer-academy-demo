import { useState } from 'react';
import { PRACTICAL_CASE } from '../data/practicalCase';
import type { PracticalCaseAnswer, PracticalCaseResult } from '../types';

interface PracticalCaseProps {
  passed: boolean;
  onSubmit: (answer: PracticalCaseAnswer) => PracticalCaseResult;
}

function parseNumber(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw.replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

export function PracticalCase({ passed, onSubmit }: PracticalCaseProps) {
  const [ctrRaw, setCtrRaw] = useState('');
  const [crRaw, setCrRaw] = useState('');
  const [cpaRaw, setCpaRaw] = useState('');
  const [roiRaw, setRoiRaw] = useState('');
  const [problemIndex, setProblemIndex] = useState<number | null>(null);
  const [actionIndices, setActionIndices] = useState<number[]>([]);
  const [result, setResult] = useState<PracticalCaseResult | null>(null);

  const { metrics, expected, problemOptions, actionOptions } = PRACTICAL_CASE;

  const numbersFilled = [ctrRaw, crRaw, cpaRaw, roiRaw].every((v) => parseNumber(v) !== null);
  const canSubmit = numbersFilled && problemIndex !== null && actionIndices.length > 0;

  const toggleAction = (index: number) => {
    setActionIndices((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const answer: PracticalCaseAnswer = {
      ctrPercent: parseNumber(ctrRaw),
      crPercent: parseNumber(crRaw),
      cpaRub: parseNumber(cpaRaw),
      roiPercent: parseNumber(roiRaw),
      problemIndex,
      actionIndices,
    };
    setResult(onSubmit(answer));
  };

  if (passed) {
    return (
      <div className="practical-case">
        <p className="day-view__quiz-status">✓ Практический кейс успешно пройден.</p>
      </div>
    );
  }

  return (
    <div className="practical-case" aria-label="Практический кейс сертификации">
      <h3>{PRACTICAL_CASE.title}</h3>
      <p>{PRACTICAL_CASE.narrative}</p>

      <table className="practical-case__table">
        <tbody>
          <tr>
            <th scope="row">Расход за неделю</th>
            <td>{metrics.spendRub.toLocaleString('ru-RU')} ₽</td>
          </tr>
          <tr>
            <th scope="row">Показы</th>
            <td>{metrics.impressions.toLocaleString('ru-RU')}</td>
          </tr>
          <tr>
            <th scope="row">Клики</th>
            <td>{metrics.clicks.toLocaleString('ru-RU')}</td>
          </tr>
          <tr>
            <th scope="row">Конверсии</th>
            <td>{metrics.conversions.toLocaleString('ru-RU')}</td>
          </tr>
          <tr>
            <th scope="row">Выплата за 1 конверсию (оффер)</th>
            <td>{metrics.payoutPerConversionRub.toLocaleString('ru-RU')} ₽</td>
          </tr>
        </tbody>
      </table>

      <div className="practical-case__fields">
        <label className="practical-case__field">
          <span>CTR, % (клики / показы × 100)</span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={ctrRaw}
            onChange={(e) => setCtrRaw(e.target.value)}
            aria-describedby="ctr-hint"
          />
          {result && (
            <span className={result.ctrCorrect ? 'practical-case__ok' : 'practical-case__bad'} id="ctr-hint">
              {result.ctrCorrect ? 'Верно' : `Неверно, правильный ответ ≈ ${expected.ctrPercent}%`}
            </span>
          )}
        </label>
        <label className="practical-case__field">
          <span>CR, % (конверсии / клики × 100)</span>
          <input type="number" step="0.01" inputMode="decimal" value={crRaw} onChange={(e) => setCrRaw(e.target.value)} />
          {result && (
            <span className={result.crCorrect ? 'practical-case__ok' : 'practical-case__bad'}>
              {result.crCorrect ? 'Верно' : `Неверно, правильный ответ ≈ ${expected.crPercent}%`}
            </span>
          )}
        </label>
        <label className="practical-case__field">
          <span>CPA, ₽ (расход / конверсии)</span>
          <input type="number" step="0.01" inputMode="decimal" value={cpaRaw} onChange={(e) => setCpaRaw(e.target.value)} />
          {result && (
            <span className={result.cpaCorrect ? 'practical-case__ok' : 'practical-case__bad'}>
              {result.cpaCorrect ? 'Верно' : `Неверно, правильный ответ ≈ ${expected.cpaRub} ₽`}
            </span>
          )}
        </label>
        <label className="practical-case__field">
          <span>ROI, % ((конверсии × выплата − расход) / расход × 100)</span>
          <input type="number" step="0.01" inputMode="decimal" value={roiRaw} onChange={(e) => setRoiRaw(e.target.value)} />
          {result && (
            <span className={result.roiCorrect ? 'practical-case__ok' : 'practical-case__bad'}>
              {result.roiCorrect ? 'Верно' : `Неверно, правильный ответ ≈ ${expected.roiPercent}%`}
            </span>
          )}
        </label>
      </div>

      <fieldset className="practical-case__choice">
        <legend>Какая проблема наиболее вероятна?</legend>
        {problemOptions.map((option, index) => (
          <label key={option} className="quiz__option">
            <input
              type="radio"
              name="practical-case-problem"
              checked={problemIndex === index}
              onChange={() => setProblemIndex(index)}
            />
            <span>{option}</span>
          </label>
        ))}
        {result && (
          <p className={result.problemCorrect ? 'practical-case__ok' : 'practical-case__bad'}>
            {result.problemCorrect ? 'Верно' : 'Неверно — перечитайте данные кейса и попробуйте снова'}
          </p>
        )}
      </fieldset>

      <fieldset className="practical-case__choice">
        <legend>Какие действия стоит предпринять дальше? (отметьте все подходящие)</legend>
        {actionOptions.map((option, index) => (
          <label key={option} className="quiz__option">
            <input type="checkbox" checked={actionIndices.includes(index)} onChange={() => toggleAction(index)} />
            <span>{option}</span>
          </label>
        ))}
        {result && (
          <p className={result.actionsCorrect ? 'practical-case__ok' : 'practical-case__bad'}>
            {result.actionsCorrect ? 'Верно' : 'Неверно — выбран не тот набор действий, попробуйте снова'}
          </p>
        )}
      </fieldset>

      <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
        Отправить решение кейса
      </button>

      {result && (
        <p className={result.passed ? 'practical-case__ok' : 'practical-case__bad'} role="status">
          {result.passed
            ? 'Кейс успешно пройден!'
            : 'Кейс пока не пройден — исправьте отмеченные поля и отправьте решение ещё раз.'}
        </p>
      )}
    </div>
  );
}
