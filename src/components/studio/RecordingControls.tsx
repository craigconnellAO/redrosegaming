'use client';

import { useEffect } from 'react';

interface Props {
  recording: boolean;
  /** Seconds elapsed in the current take (0 when not recording). */
  elapsed: number;
  /** Whether the source video is currently playing. */
  playing: boolean;
  canRecord: boolean;
  onToggleRecord: () => void;
  onTogglePlay: () => void;
  onRestart: () => void;
}

/**
 * Big primary controls + keyboard shortcuts:
 *   Space → record / stop
 *   R     → restart (jump source video to 0)
 *   K     → play / pause source video
 *
 * Announces state changes via an ARIA live region for screen readers.
 */
export function RecordingControls({
  recording, elapsed, playing, canRecord,
  onToggleRecord, onTogglePlay, onRestart,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a field
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      if (e.code === 'Space') { e.preventDefault(); onToggleRecord(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); onRestart(); }
      else if (e.key === 'k' || e.key === 'K') { e.preventDefault(); onTogglePlay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggleRecord, onTogglePlay, onRestart]);

  return (
    <section
      aria-label="Recording controls"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 16,
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        className="btn btn-outline"
        onClick={onRestart}
        aria-label="Restart from beginning (R)"
        title="Restart from beginning  ·  R"
        style={{ minHeight: 56, minWidth: 56, justifyContent: 'center' }}
      >
        ↺ Restart
      </button>

      <button
        type="button"
        className="btn btn-outline"
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause source video (K)' : 'Play source video (K)'}
        title={playing ? 'Pause  ·  K' : 'Play  ·  K'}
        style={{ minHeight: 56, minWidth: 64, justifyContent: 'center' }}
      >
        {playing ? '⏸ Pause' : '▶ Play'}
      </button>

      <button
        type="button"
        className="record-btn"
        data-state={recording ? 'recording' : 'idle'}
        onClick={onToggleRecord}
        disabled={!canRecord}
        aria-label={recording ? 'Stop recording (Space)' : 'Start recording (Space)'}
        aria-pressed={recording}
        title={recording ? 'Stop  ·  Space' : 'Record  ·  Space'}
      >
        {recording ? (
          <span aria-hidden style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 4 }} />
        ) : (
          <span aria-hidden style={{ width: 26, height: 26, background: '#fff', borderRadius: '50%' }} />
        )}
      </button>

      <div
        style={{
          minWidth: 72,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: 18,
          color: recording ? 'var(--accent)' : 'var(--sub)',
        }}
        aria-hidden
      >
        {formatTime(elapsed)}
      </div>

      {/* ARIA live region — empty when idle, announces transitions. */}
      <div className="sr-only" role="status" aria-live="polite">
        {recording ? `Recording — ${formatTime(elapsed)}` : 'Not recording'}
      </div>
    </section>
  );
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
