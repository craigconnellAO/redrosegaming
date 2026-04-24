'use client';

import { useRef, useState } from 'react';
import type { Video } from '@/lib/types';
import { thumbClass } from '@/lib/types';

const GAME_EMOJI: Record<string, string> = {
  'Dress to Impress': '👗',
  'Brookhaven':       '🏡',
  '99 Nights':        '🌲',
  'Other Roblox':     '🎮',
  'Just Chatting':    '💬',
};

interface VideoThumbProps {
  video: Video;
  large?: boolean;
}

export function VideoThumb({ video, large }: VideoThumbProps) {
  const emoji = GAME_EMOJI[video.game] ?? '🎮';
  const tc = thumbClass(video.game);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: large ? '10px 10px 0 0' : 8,
        flexShrink: 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient fallback — always visible behind video */}
      <div className={tc} style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 65%)',
        }} />
      </div>

      {/* Real video — fades in once metadata is loaded */}
      {video.storageUrl && (
        <video
          ref={videoRef}
          src={video.storageUrl}
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setVideoReady(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.4s',
          }}
        />
      )}

      {/* Game tag */}
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 10,
        background: 'rgba(0,0,0,0.48)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: 'white',
        fontSize: large ? 12 : 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 4,
      }}>
        {video.game}
      </div>

      {/* Duration */}
      {video.duration && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 10,
          background: 'rgba(0,0,0,0.55)',
          color: 'white',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 8px', borderRadius: 4,
        }}>
          {video.duration}
        </div>
      )}

      {/* Rose badge */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10, zIndex: 10,
        width: large ? 48 : 34, height: large ? 48 : 34,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: large ? 26 : 18,
      }}>
        🌹
      </div>
    </div>
  );
}
