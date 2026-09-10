import type { Video } from '../types';
import { VideoCard } from './VideoCard';

interface VideoListProps {
  videos: Video[];
  watchedVideoIds: string[];
  editable: boolean;
  reviewVideoIds: string[];
  onToggle: (videoId: string, watched: boolean) => void;
}

export function VideoList({ videos, watchedVideoIds, editable, reviewVideoIds, onToggle }: VideoListProps) {
  const watchedSet = new Set(watchedVideoIds);
  const reviewSet = new Set(reviewVideoIds);

  return (
    <ul className="video-list" aria-label="Видео дня">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          watched={watchedSet.has(video.id)}
          editable={editable}
          needsReview={reviewSet.has(video.id) && !watchedSet.has(video.id)}
          onToggle={(watched) => onToggle(video.id, watched)}
        />
      ))}
    </ul>
  );
}
