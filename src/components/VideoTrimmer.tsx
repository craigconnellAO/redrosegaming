'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoTrimmerProps {
  blob: Blob;
  onComplete: (file: File) => void;
  onCancel: () => void;
}

export function VideoTrimmer({ blob, onComplete, onCancel }: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => URL.createObjectURL(blob));
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const handleLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    // Some recorded blobs report Infinity for duration in Safari until played
    let d = v.duration;
    if (!isFinite(d) || d <= 0) {
      // Force seek-to-end to coerce duration
      v.currentTime = 1e6;
      v.ontimeupdate = () => {
        v.ontimeupdate = null;
        v.currentTime = 0;
        d = v.duration;
        if (isFinite(d) && d > 0) {
          setDuration(d);
          setEnd(d);
        }
      };
      return;
    }
    setDuration(d);
    setEnd(d);
  };

  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  const noTrim = start <= 0.05 && end >= duration - 0.05;

  const handleNext = async () => {
    setProcessing(true);
    setError(null);
    try {
      if (!noTrim) {
        const trimmedBlob = await trimViaCaptureStream(blob, start, end);
        if (trimmedBlob && trimmedBlob.size > 0) {
          onComplete(new File([trimmedBlob], `recording.${ext}`, { type: trimmedBlob.type }));
          return;
        }
        // Fall through with the original if re-encode failed
      }
      onComplete(new File([blob], `recording.${ext}`, { type: blob.type }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        aspectRatio: '16 / 9',
      }}>
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          onLoadedMetadata={handleLoaded}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p className="section-label" style={{ marginBottom: 12 }}>Trim Range</p>

        <TrimRow
          label="Start"
          value={start}
          duration={duration}
          onChange={v => setStart(Math.min(v, end - 0.5))}
          accent
        />
        <div style={{ height: 12 }} />
        <TrimRow
          label="End"
          value={end}
          duration={duration}
          onChange={v => setEnd(Math.max(v, start + 0.5))}
          accent
        />

        <p style={{ fontSize: 12, color: 'var(--sub)', marginTop: 12 }}>
          Clip length: <strong style={{ color: 'var(--text)' }}>{formatTime(end - start)}</strong>
        </p>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, fontWeight: 600 }}>
            {error}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={processing}>
          ← Re-record
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={processing || end <= start || duration <= 0}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {processing ? 'Processing…' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

function TrimRow({
  label, value, duration, onChange, accent,
}: {
  label: string;
  value: number;
  duration: number;
  onChange: (v: number) => void;
  accent?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--sub)', minWidth: 36, fontWeight: 600 }}>
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.1}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        disabled={duration <= 0}
        style={{
          flex: 1,
          accentColor: accent ? 'var(--accent)' : undefined,
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--text)', minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(value)}
      </span>
    </div>
  );
}

async function trimViaCaptureStream(blob: Blob, start: number, end: number): Promise<Blob | null> {
  return new Promise(resolve => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(blob);
    video.src = url;
    video.muted = false;
    video.playsInline = true;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onerror = () => { cleanup(); resolve(null); };

    video.onloadedmetadata = () => {
      const v = video as HTMLVideoElement & {
        captureStream?: () => MediaStream;
        mozCaptureStream?: () => MediaStream;
      };
      const capture = v.captureStream || v.mozCaptureStream;
      if (!capture) { cleanup(); resolve(null); return; }

      video.currentTime = start;
      video.onseeked = () => {
        video.onseeked = null;
        let stream: MediaStream;
        try {
          stream = capture.call(video);
        } catch {
          cleanup();
          resolve(null);
          return;
        }
        const mime = blob.type || 'video/webm';
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType: mime });
        } catch {
          recorder = new MediaRecorder(stream);
        }
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          cleanup();
          resolve(new Blob(chunks, { type: recorder.mimeType || mime }));
        };
        recorder.start();
        video.play().catch(() => { cleanup(); resolve(null); });
        video.ontimeupdate = () => {
          if (video.currentTime >= end) {
            video.ontimeupdate = null;
            video.pause();
            if (recorder.state !== 'inactive') recorder.stop();
          }
        };
      };
    };
  });
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
