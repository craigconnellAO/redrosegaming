'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  STUDIO_FRAMERATE, STUDIO_OUTPUT_HEIGHT, STUDIO_OUTPUT_WIDTH,
  fontCanvasWeight, fontCssFamily,
  type TextOverlay, type WebcamConfig,
} from '@/lib/studio';

export interface CanvasCompositorHandle {
  /** The MediaStream produced by `canvas.captureStream(fps)`. Stable for the life of the canvas. */
  getStream: () => MediaStream | null;
  getCanvas: () => HTMLCanvasElement | null;
}

interface Props {
  /** Ref to the hidden source <video>; read every frame so we don't need to know when it mounts. */
  sourceVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Ref to the hidden webcam <video>. */
  webcamVideoRef: React.RefObject<HTMLVideoElement | null>;
  webcam: WebcamConfig;
  overlays: TextOverlay[];
  width?: number;
  height?: number;
  fps?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CanvasCompositor — composites source video, a circular webcam PiP, and time-bound text
 * overlays onto an off-screen-ish canvas at `fps`. Exposes `captureStream()` for the recorder.
 *
 * Why canvas, not CSS overlay capture: we need a single MediaStream containing the composite,
 * which only `canvas.captureStream` provides reliably across Safari/Chrome.
 *
 * CORS note: the source <video> must have `crossOrigin="anonymous"` AND Firebase Storage must
 * serve `Access-Control-Allow-Origin` for our origin. Otherwise the canvas becomes "tainted"
 * and the resulting MediaStream produces only black frames.
 */
export const CanvasCompositor = forwardRef<CanvasCompositorHandle, Props>(function CanvasCompositor(
  {
    sourceVideoRef, webcamVideoRef, webcam, overlays,
    width = STUDIO_OUTPUT_WIDTH, height = STUDIO_OUTPUT_HEIGHT, fps = STUDIO_FRAMERATE,
    className, style,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    getStream: () => {
      const c = canvasRef.current;
      if (!c) return null;
      if (!streamRef.current) {
        const cap = (c as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }).captureStream;
        streamRef.current = cap ? cap.call(c, fps) : null;
      }
      return streamRef.current;
    },
    getCanvas: () => canvasRef.current,
  }), [fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let lastFrame = 0;
    const interval = 1000 / fps;

    const tick = (ts: number) => {
      try {
        raf = requestAnimationFrame(tick);
        if (ts - lastFrame < interval) return;
        lastFrame = ts;

        const source = sourceVideoRef.current;
        const webcamVideo = webcamVideoRef.current;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawSourceVideo(ctx, canvas, source);
        if (webcam.enabled) drawWebcam(ctx, canvas, webcamVideo, webcam);
        drawOverlays(ctx, canvas, overlays, source?.currentTime ?? 0);
      } catch (err) {
        console.error('[CanvasCompositor] Render loop error:', err);
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sourceVideoRef, webcamVideoRef, webcam, overlays, fps]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: `${width} / ${height}`,
        background: '#000',
        ...style,
      }}
      aria-label="Recording preview"
      role="img"
    />
  );
});

function drawSourceVideo(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement | null,
) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

  const cAR = canvas.width / canvas.height;
  const sAR = video.videoWidth / video.videoHeight;
  let dw: number, dh: number;
  if (sAR > cAR) { dh = canvas.height; dw = dh * sAR; }
  else            { dw = canvas.width;  dh = dw / sAR; }
  const dx = (canvas.width - dw) / 2;
  const dy = (canvas.height - dh) / 2;

  try {
    ctx.drawImage(video, dx, dy, dw, dh);
  } catch (err) {
    if (err instanceof Error && err.name === 'SecurityError') {
      console.error('[CanvasCompositor] CORS error: Firebase Storage headers not configured');
    }
  }
}

function drawWebcam(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement | null,
  cfg: WebcamConfig,
) {
  if (!video || video.readyState < 2 || !video.videoWidth) return;
  const cx = cfg.x * canvas.width;
  const cy = cfg.y * canvas.height;
  const r  = cfg.radius * canvas.height;
  const size = r * 2;

  // Square center-crop of the webcam frame
  const wW = video.videoWidth, wH = video.videoHeight;
  const sSide = Math.min(wW, wH);
  const sx = (wW - sSide) / 2;
  const sy = (wH - sSide) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (cfg.mirror) {
    ctx.translate(cx + r, cy - r);
    ctx.scale(-1, 1);
    try { ctx.drawImage(video, sx, sy, sSide, sSide, 0, 0, size, size); } catch {}
  } else {
    try { ctx.drawImage(video, sx, sy, sSide, sSide, cx - r, cy - r, size, size); } catch {}
  }
  ctx.restore();

  // Soft white ring so the bubble pops against any background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(3, r * 0.05);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
}

function drawOverlays(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  overlays: TextOverlay[],
  currentTime: number,
) {
  for (const o of overlays) {
    if (currentTime < o.startTime || currentTime > o.endTime) continue;
    const fontSize = Math.max(12, o.size * canvas.height);
    ctx.font = `${fontCanvasWeight(o.font)} ${fontSize}px ${fontCssFamily(o.font)}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const x = o.x * canvas.width;
    const y = o.y * canvas.height;

    // Dark stroke for legibility against any background → WCAG-safe contrast
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = Math.max(3, fontSize * 0.10);
    ctx.strokeText(o.text, x, y);

    ctx.fillStyle = o.color;
    ctx.fillText(o.text, x, y);
  }
}
