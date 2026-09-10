import type { StatusSummary as StatusSummaryData } from '../progressEngine';

interface StatusSummaryProps {
  summary: StatusSummaryData;
}

/**
 * Concise automated status a manager or HR partner would glance at —
 * intentionally not a full analytics dashboard, just the facts needed to
 * know where the trainee stands.
 */
export function StatusSummary({ summary }: StatusSummaryProps) {
  const progressPercent = Math.round((summary.daysCompleted / summary.totalDays) * 100);

  let statusLabel = 'В процессе обучения';
  let statusTone = 'status-pill--neutral';
  if (summary.programCompleted) {
    statusLabel = 'Программа завершена';
    statusTone = 'status-pill--success';
  } else if (summary.needsAttention) {
    statusLabel = 'Требует внимания наставника';
    statusTone = 'status-pill--warning';
  }

  return (
    <section className="status-summary" aria-label="Автоматический статус для HR и руководителя">
      <div className="status-summary__row">
        <span className={`status-pill ${statusTone}`}>{statusLabel}</span>
        <span className="status-summary__note">
          Автоматический статус для HR и руководителя · демо-данные
        </span>
      </div>
      <dl className="status-summary__grid">
        <div className="status-metric">
          <dt>Текущий день</dt>
          <dd>
            {summary.currentDay} / {summary.totalDays}
          </dd>
        </div>
        <div className="status-metric">
          <dt>Дней завершено</dt>
          <dd>
            {summary.daysCompleted} ({progressPercent}%)
          </dd>
        </div>
        <div className="status-metric">
          <dt>Видео просмотрено</dt>
          <dd>
            {summary.videosWatched} / {summary.totalVideos}
          </dd>
        </div>
        <div className="status-metric">
          <dt>Средний балл за тесты</dt>
          <dd>{summary.averageScorePercent !== null ? `${summary.averageScorePercent}%` : '—'}</dd>
        </div>
        <div className="status-metric">
          <dt>Попыток на текущий день</dt>
          <dd>{summary.attemptsOnCurrentDay}</dd>
        </div>
      </dl>
    </section>
  );
}
