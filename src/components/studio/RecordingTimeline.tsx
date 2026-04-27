'use client';

import { useEffect, useRef, useState } from 'react';
import type { PunchMarker, TextOverlay } from '@/lib/studio';

interface Props {
  duration: number;
  currentTime: number;
  onSeek: (t: number) => void;
  punches: PunchMarker[];
  overlays: TextOverlay[];
  /** True while a recording is in progress — disables seeking to keep takes in sync. */
  recording: boolean;
}

export function RecordingTimeline({ duration, currentTime, onSeek, punches, overlays, recording }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    if (!scrubbing) return;
    const move = (ev: PointerEvent) => seekFromPointer(ev.clientX);
    const up   = () => setScrubbing(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    function seekFromPointer(clientX: number) {
      const el = trackRef.current;
      if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    }
  }, [scrubbing, duration, onSeek]);

  const playheadPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      className="card"
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
      aria-label="Timeline"
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="section-label">Timeline</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--sub)' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </header>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        aria-disabled={recording}
        tabIndex={recording ? -1 : 0}
        onPointerDown={e => {
          if (recording) return;
          e.preventDefault();
          setScrubbing(true);
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek(ratio * (duration || 0));
        }}
        onKeyDown={e => {
          if (recording || !duration) return;
          const step = e.shiftKey ? 5 : 1;
          if (e.key === 'ArrowRight') { e.preventDefault(); onSeek(Math.min(duration, currentTime + step)); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); onSeek(Math.max(0,        currentTime - step)); }
          if (e.key === 'Home')       { e.preventDefault(); onSeek(0); }
          if (e.key === 'End')        { e.preventDefault(); onSeek(duration); }
        }}
        style={{
          position: 'relative',
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          touchAction: 'none',
          opacity: recording ? 0.7 : 1,
          cursor: recording ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Overlay time-bars (top half) */}
        {overlays.map((o, i) => duration > 0 && (
          <div
            key={o.id}
            aria-hidden
            title={`"${o.text}" ${formatTime(o.startTime)} – ${formatTime(o.endTime)}`}
            style={{
              position: 'absolute',
              top: 6,
              height: 16,
              left:  `${(o.startTime / duration) * 100}%`,
              width: `${Math.max(1, ((o.endTime - o.startTime) / duration) * 100)}%`,
              background: o.color,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 4,
              opacity: 0.85,
              boxShadow: i === 0 ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.4)',
            }}
          />
        ))}

        {/* Punch-in markers (bottom half) */}
        {punches.map(p => duration > 0 && (
          <div
            key={p.id}
            aria-hidden
            title={`Recording at ${formatTime(p.time)}`}
            style={{
              position: 'absolute',
              bottom: 6,
              height: 16,
              left:  `${(p.time / duration) * 100}%`,
              width: p.duration ? `${Math.max(1, (p.duration / duration) * 100)}%` : 4,
              background: 'var(--accent)',
              borderRadius: 3,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.6)',
            }}
          />
        ))}

        {/* Playhead */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: `calc(${playheadPct}% - 1px)`,
            width: 2,
            background: 'var(--text)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            position: 'absolute',
            top: -4, left: -8,
            width: 18, height: 18,
            borderRadius: '50%',
            background: 'var(--text)',
            border: '2px solid var(--card)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }} />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--sub)', margin: 0 }}>
        Drag the timeline to scrub. <span style={{ color: 'var(--accent)' }}>●</span> marks where you recorded.
      </p>
    </section>
  );
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
