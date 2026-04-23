'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VideoThumb } from './VideoThumb';
import type { Video } from '@/lib/types';
import { toggleLike } from '@/lib/firebase/videos';
import { useAuth } from './AuthProvider';

interface VideoCardProps {
  video: Video;
  compact?: boolean;
  onShare?: (id: string) => void;
}

export function VideoCard({ video, compact, onShare }: VideoCardProps) {
  const { user } = useAuth();
  const userId = user?.uid ?? 'guest';
  const [liked, setLiked] = useState(video.likedBy.includes(userId));
  const [likeCount, setLikeCount] = useState(video.likes);
  const [hover, setHover] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(c => c + (nextLiked ? 1 : -1));
    await toggleLike(video.id, userId, liked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(video.id);
  };

  return (
    <Link href={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.22s var(--ease)',
          borderColor: hover ? 'rgba(192,72,106,0.35)' : 'var(--border)',
          transform: hover ? 'translateY(-4px)' : 'none',
          boxShadow: hover ? '0 8px 28px rgba(192,72,106,0.1), 0 2px 8px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <div style={{ overflow: 'hidden', borderRadius: '10px 10px 0 0' }}>
          <VideoThumb video={video} />
        </div>

        <div style={{ padding: compact ? '12px 14px' : '16px 18px' }}>
          <h3 style={{
            fontWeight: 600, fontSize: compact ? 13 : 15,
            letterSpacing: '-0.003em', lineHeight: 1.4,
            color: 'var(--text)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 10,
          }}>
            {video.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--sub)', fontWeight: 500 }}>
              {video.views} views
              {video.createdAt && (
                <> · {formatDate(video.createdAt)}</>
              )}
            </span>

            <div style={{ display: 'flex', gap: 2 }}>
              <button className="icon-btn" onClick={handleLike} title="Like" aria-label="Like">
                <span style={{
                  fontSize: 16,
                  transition: 'transform 0.2s var(--ease)',
                  transform: liked ? 'scale(1.2)' : 'scale(1)',
                }}>
                  {liked ? '❤️' : '♡'}
                </span>
              </button>
              <button className="icon-btn" onClick={handleShare} title="Share" aria-label="Copy link">
                ⎋
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
