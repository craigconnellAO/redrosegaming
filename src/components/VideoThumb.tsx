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

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 9',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: large ? '10px 10px 0 0' : 8,
      flexShrink: 0,
    }}>
      {/* Coloured gradient */}
      <div className={tc} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Subtle radial overlay for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 65%)',
        }} />

        <span style={{
          fontSize: large ? 80 : 52,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          transition: 'transform 0.3s var(--ease)',
          position: 'relative', zIndex: 1,
        }}>
          {emoji}
        </span>

        {/* Game tag — top left */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'white',
          fontSize: large ? 12 : 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {video.game}
        </div>

        {/* Duration — bottom left */}
        {video.duration && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.55)',
            color: 'white',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            padding: '3px 8px', borderRadius: 4,
          }}>
            {video.duration}
          </div>
        )}

        {/* Rose badge — bottom right */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
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
    </div>
  );
}
