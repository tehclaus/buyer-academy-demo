import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  watched: boolean;
  editable: boolean;
  needsReview: boolean;
  onToggle: (watched: boolean) => void;
}

export function VideoCard({ video, watched, editable, needsReview, onToggle }: VideoCardProps) {
  const checkboxId = `video-${video.id}`;
  const descId = `video-desc-${video.id}`;

  return (
    <li className={`video-card ${watched ? 'video-card--watched' : ''} ${needsReview ? 'video-card--review' : ''}`}>
      <input
        type="checkbox"
        id={checkboxId}
        checked={watched}
        disabled={!editable}
        onChange={(e) => onToggle(e.target.checked)}
        aria-describedby={descId}
      />
      <div className="video-card__body">
        <label htmlFor={checkboxId} className="video-card__title">
          <span className="video-card__order">Видео {video.order}</span>
          {video.title}
        </label>
        <p id={descId} className="video-card__description">
          {video.description}
        </p>
        <div className="video-card__meta">
          <span>{video.durationMinutes} мин</span>
          {needsReview && <span className="video-card__review-tag">Рекомендовано к повтору</span>}
        </div>
      </div>
    </li>
  );
}
