import { useState } from 'react';
import {
  canEditDay,
  canTakeQuiz,
  getDayProgress,
  isDayCompleted,
  type ActiveItem,
  type QuizResult,
} from '../progressEngine';
import type { DayPlan, ProgressState, QuizQuestion } from '../types';
import { PASS_THRESHOLD_PERCENT, isCheckpointAnchorDay, TOTAL_DAYS } from '../types';
import { Quiz } from './Quiz';
import { VideoList } from './VideoList';

interface DayViewProps {
  dayPlan: DayPlan;
  moduleTitle: string;
  progress: ProgressState;
  onToggleVideo: (videoId: string, watched: boolean) => void;
  onSubmitQuiz: (day: number, questions: QuizQuestion[], answers: number[]) => QuizResult;
  onNavigate: (target: ActiveItem) => void;
}

export function DayView({ dayPlan, moduleTitle, progress, onToggleVideo, onSubmitQuiz, onNavigate }: DayViewProps) {
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  const dayProgress = getDayProgress(progress, dayPlan.day);
  const editable = canEditDay(progress, dayPlan.day);
  const completed = isDayCompleted(progress, dayPlan.day);
  const quizAvailable = canTakeQuiz(progress, dayPlan.day);
  const watchedCount = dayProgress.watchedVideoIds.length;
  const isAnchor = isCheckpointAnchorDay(dayPlan.day);
  const isFinalDay = dayPlan.day === TOTAL_DAYS;

  const bestPassedScore = [...dayProgress.attempts].reverse().find((a) => a.passed)?.scorePercent;

  let headerBadge = 'Просмотр';
  if (completed) headerBadge = '✓ Завершён';
  else if (editable) headerBadge = 'Текущий день';

  const handleSubmit = (answers: number[], shuffledQuestions: QuizQuestion[]) => {
    const result = onSubmitQuiz(dayPlan.day, shuffledQuestions, answers);
    setLastResult(result);
  };

  const reviewVideoIds = lastResult && !lastResult.passed ? lastResult.reviewVideoIds : [];

  return (
    <article className="day-view">
      <header className="day-view__header">
        <span className={`status-pill ${completed ? 'status-pill--success' : editable ? 'status-pill--neutral' : ''}`}>
          {headerBadge}
        </span>
        <h2 className="day-view__title">
          День {dayPlan.day}. {dayPlan.title}
        </h2>
        <p className="day-view__module">{moduleTitle}</p>
        <p className="day-view__objective">
          <strong>Цель дня:</strong> {dayPlan.objective}
        </p>
      </header>

      {lastResult && !lastResult.passed && (
        <div className="banner banner--warning" role="alert">
          <p>
            Результат теста: <strong>{lastResult.scorePercent}%</strong> ({lastResult.correctCount} из{' '}
            {lastResult.totalQuestions}). Для завершения дня нужно набрать {PASS_THRESHOLD_PERCENT}% и выше.
          </p>
          <p>Отмеченные ниже видео рекомендуется пересмотреть перед новой попыткой.</p>
        </div>
      )}

      {lastResult && lastResult.passed && (
        <div className="banner banner--success" role="status">
          <p>
            Отличный результат: <strong>{lastResult.scorePercent}%</strong>! День {dayPlan.day} завершён.
          </p>
          {isAnchor && (
            <>
              <p>Впереди — контрольная неделя по материалам последних 5 дней, прежде чем откроется следующий модуль.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate({ type: 'checkpoint', anchorDay: dayPlan.day })}
              >
                Перейти к контрольной неделе
              </button>
            </>
          )}
          {isFinalDay && (
            <>
              <p>Впереди — финальная сертификация: теория по всему курсу и практический кейс.</p>
              <button type="button" className="btn btn-primary" onClick={() => onNavigate({ type: 'certification' })}>
                Перейти к финальной сертификации
              </button>
            </>
          )}
          {!isAnchor && !isFinalDay && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate({ type: 'day', day: dayPlan.day + 1 })}
            >
              Перейти к дню {dayPlan.day + 1}
            </button>
          )}
        </div>
      )}

      <section aria-labelledby="video-list-heading">
        <div className="section-heading">
          <h3 id="video-list-heading">Видео дня</h3>
          <span className="section-heading__count">{watchedCount} / 5 просмотрено</span>
        </div>
        <VideoList
          videos={dayPlan.videos}
          watchedVideoIds={dayProgress.watchedVideoIds}
          editable={editable}
          reviewVideoIds={reviewVideoIds}
          onToggle={onToggleVideo}
        />
      </section>

      <section aria-labelledby="quiz-heading" className="day-view__quiz-section">
        <div className="section-heading">
          <h3 id="quiz-heading">Тест дня (10 вопросов)</h3>
        </div>
        {completed && bestPassedScore !== undefined && (
          <p className="day-view__quiz-status">Тест пройден. Лучший результат: {bestPassedScore}%.</p>
        )}
        {!completed && quizAvailable && (
          <Quiz questions={dayPlan.quiz} onSubmit={handleSubmit} key={`${dayPlan.day}-${dayProgress.attempts.length}`} />
        )}
        {!completed && !quizAvailable && (
          <p className="day-view__quiz-status day-view__quiz-status--locked">
            {editable
              ? `Тест откроется после просмотра всех 5 видео (просмотрено ${watchedCount} из 5).`
              : 'Тест недоступен для этого дня.'}
          </p>
        )}
      </section>
    </article>
  );
}
