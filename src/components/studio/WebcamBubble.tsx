'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebcamConfig } from '@/lib/studio';

interface Props {
  /** Live webcam stream. */
  stream: MediaStream | null;
  /** Container element this bubble is positioned inside. Defines the 0..1 coord space. */
  container: HTMLDivElement | null;
  cfg: WebcamConfig;
  onChange: (next: WebcamConfig) => void;
  /** Hide visually (e.g. during export preview). */
  hidden?: boolean;
}

/**
 * WebcamBubble — visible draggable circular face-cam over the source video.
 *
 * The CanvasCompositor draws its own circular webcam during recording — this is the
 * *interactive* preview. Position changes flow into `cfg`; the compositor reads the
 * same `cfg` so they stay synced.
 *
 * Touch + mouse drag, ≥44px touch targets, ResizeObserver-based reflow.
 */
export function WebcamBubble({ stream, container, cfg, onChange, hidden }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragging, setDragging] = useState<null | 'move' | 'resize'>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // Bind stream to the <video>
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !stream) return;
    if (v.srcObject !== stream) {
      v.srcObject = stream;
      v.play().catch(() => {});
    }
  }, [stream]);

  // Track container size for accurate positioning on resize
  useEffect(() => {
    if (!container) return;
    const update = () => {
      const r = container.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [container]);

  // Drag/resize handlers
  useEffect(() => {
    if (!dragging || !container) return;
    const move = (ev: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width;
      const py = (ev.clientY - rect.top) / rect.height;

      if (dragging === 'move') {
        const ratio = rect.width / rect.height;
        const rxFrac = cfg.radius / ratio;
        onChange({
          ...cfg,
          x: clamp(px, rxFrac, 1 - rxFrac),
          y: clamp(py, cfg.radius, 1 - cfg.radius),
        });
      } else {
        const ratio = rect.width / rect.height;
        const dx = (px - cfg.x) * ratio;
        const dy = py - cfg.y;
        const newR = clamp(Math.hypot(dx, dy), 0.08, 0.4);
        onChange({ ...cfg, radius: newR });
      }
    };
    const up = () => setDragging(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, cfg, onChange, container]);

  const onDown = useCallback((kind: 'move' | 'resize') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(kind);
  }, []);

  if (!cfg.enabled || hidden || !size) return null;

  const diameterPx = cfg.radius * 2 * size.h;
  const cxPx = cfg.x * size.w;
  const cyPx = cfg.y * size.h;

  return (
    <div
      role="group"
      aria-label="Face-cam bubble — drag to move, drag the corner to resize"
      style={{
        position: 'absolute',
        left: cxPx - diameterPx / 2,
        top:  cyPx - diameterPx / 2,
        width: diameterPx,
        height: diameterPx,
        borderRadius: '50%',
        overflow: 'visible',
        cursor: dragging === 'move' ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={onDown('move')}
    >
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 6px 20px rgba(0,0,0,0.35)',
        background: '#000',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: cfg.mirror ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      <button
        type="button"
        aria-label="Resize face-cam"
        onPointerDown={onDown('resize')}
        style={{
          position: 'absolute',
          right: -10, bottom: -10,
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: '3px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'nwse-resize',
          padding: 0,
          touchAction: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        }}
      >
        <span aria-hidden style={{ fontSize: 16, lineHeight: 1, fontWeight: 700 }}>↘</span>
      </button>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
