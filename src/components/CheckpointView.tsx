import { useMemo, useState } from 'react';
import { getDayPlan, getVideoById } from '../data/curriculum';
import {
  getCheckpointDayRange,
  getCheckpointPool,
  getCheckpointProgress,
  type ActiveItem,
  type QuizResult,
} from '../progressEngine';
import { sampleQuestions } from '../quizSampling';
import { CHECKPOINT_QUESTION_COUNT, PASS_THRESHOLD_PERCENT } from '../types';
import type { ProgressState, QuizQuestion } from '../types';
import { Quiz } from './Quiz';

interface CheckpointViewProps {
  anchorDay: number;
  progress: ProgressState;
  onSubmitCheckpoint: (anchorDay: number, questions: QuizQuestion[], answers: number[]) => QuizResult;
  onNavigate: (target: ActiveItem) => void;
}

export function CheckpointView({ anchorDay, progress, onSubmitCheckpoint, onNavigate }: CheckpointViewProps) {
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const checkpointProgress = getCheckpointProgress(progress, anchorDay);
  const [rangeStart, rangeEnd] = getCheckpointDayRange(anchorDay);
  const attemptNumber = checkpointProgress.attempts.length;

  const pool = useMemo(() => getCheckpointPool(anchorDay), [anchorDay]);
  // Re-sampled on every render; only the value read at mount time (tied to
  // the `key={attemptNumber}` below) actually matters, so a fresh random
  // sample is picked for each new attempt without needing extra memoization.
  const attemptQuestions = sampleQuestions(pool, CHECKPOINT_QUESTION_COUNT);

  const coveredDays = [];
  for (let d = rangeStart; d <= rangeEnd; d += 1) {
    const plan = getDayPlan(d);
    if (plan) coveredDays.push(plan);
  }

  const handleSubmit = (answers: number[], shuffledQuestions: QuizQuestion[]) => {
    const result = onSubmitCheckpoint(anchorDay, shuffledQuestions, answers);
    setLastResult(result);
  };

  const weakVideos = lastResult && !lastResult.passed ? lastResult.reviewVideoIds.map((id) => getVideoById(id)) : [];

  return (
    <article className="day-view">
      <header className="day-view__header">
        <span className={`status-pill ${checkpointProgress.completed ? 'status-pill--success' : 'status-pill--neutral'}`}>
          {checkpointProgress.completed ? '✓ Пройдена' : 'Контрольная неделя'}
        </span>
        <h2 className="day-view__title">
          Контрольная неделя: дни {rangeStart}–{rangeEnd}
        </h2>
        <p className="day-view__objective">
          Прежде чем открыть следующий модуль, нужно набрать {PASS_THRESHOLD_PERCENT}% и выше в контрольном тесте из{' '}
          {CHECKPOINT_QUESTION_COUNT} вопросов, отобранных из материалов дней {rangeStart}–{rangeEnd}.
        </p>
        <ul className="checkpoint-days">
          {coveredDays.map((d) => (
            <li key={d.day}>
              День {d.day}. {d.title}
            </li>
          ))}
        </ul>
      </header>

      {lastResult && !lastResult.passed && (
        <div className="banner banner--warning" role="alert">
          <p>
            Результат: <strong>{lastResult.scorePercent}%</strong> ({lastResult.correctCount} из{' '}
            {lastResult.totalQuestions}). Для прохождения нужно {PASS_THRESHOLD_PERCENT}% и выше.
          </p>
          {lastResult.weakDays.length > 0 && (
            <div>
              <p>Слабые темы — рекомендуем повторить:</p>
              <ul>
                {lastResult.weakDays.map((day) => (
                  <li key={day}>
                    День {day}: {getDayPlan(day)?.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weakVideos.length > 0 && (
            <div>
              <p>Конкретные видео для повтора:</p>
              <ul>
                {weakVideos.map((v) => v && <li key={v.id}>{v.title}</li>)}
              </ul>
            </div>
          )}
          <p>Новая попытка сформирует новый набор вопросов из того же материала. Пройденные дни доступны в навигации слева для повтора.</p>
        </div>
      )}

      {lastResult && lastResult.passed && (
        <div className="banner banner--success" role="status">
          <p>
            Отличный результат: <strong>{lastResult.scorePercent}%</strong>! Контрольная неделя пройдена, следующий
            модуль открыт.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate({ type: 'day', day: anchorDay + 1 })}>
            Перейти к дню {anchorDay + 1}
          </button>
        </div>
      )}

      {checkpointProgress.completed ? (
        <p className="day-view__quiz-status">Контрольная неделя пройдена.</p>
      ) : (
        <Quiz
          questions={attemptQuestions}
          onSubmit={handleSubmit}
          ariaLabel="Тест контрольной недели"
          key={attemptNumber}
        />
      )}
    </article>
  );
}
