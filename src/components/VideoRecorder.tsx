'use client';

import { useEffect, useRef, useState } from 'react';
import { FilterCanvas } from './FilterCanvas';
import { FilterSelector } from './FilterSelector';
import { getFilterById } from '@/lib/filters/filters';

interface VideoRecorderProps {
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}

const MAX_DURATION_S = 180; // 3 min cap to keep file sizes reasonable

export function VideoRecorder({ onComplete, onCancel }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

  const selectedFilter = selectedFilterId ? getFilterById(selectedFilterId) : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // prevent feedback in preview
        }
        setReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setDuration(elapsed);
      if (elapsed >= MAX_DURATION_S) {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        }
        setRecording(false);
      }
    }, 100);
    return () => clearInterval(id);
  }, [recording]);

  const startRecording = () => {
    if (!streamRef.current) return;

    let recordingStream: MediaStream | null = streamRef.current;

    // If filter is selected, record from canvas instead
    if (selectedFilter && canvasRef.current) {
      try {
        const canvasStream = canvasRef.current.captureStream(30);
        const audioTracks = streamRef.current.getAudioTracks();
        audioTracks.forEach(track => {
          canvasStream.addTrack(track);
        });
        recordingStream = canvasStream;
      } catch (e) {
        console.error('Failed to capture canvas stream:', e);
      }
    }

    const candidates = [
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    const mime = candidates.find(c => MediaRecorder.isTypeSupported(c)) ?? '';
    const recorder = mime
      ? new MediaRecorder(recordingStream, { mimeType: mime })
      : new MediaRecorder(recordingStream);
    chunksRef.current = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      onComplete(blob);
    };
    recorderRef.current = recorder;
    recorder.start();
    setDuration(0);
    setRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  if (error) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--accent)', marginBottom: 12, fontWeight: 600 }}>
          Camera unavailable
        </p>
        <p style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
          {error}
        </p>
        <button className="btn btn-outline" onClick={onCancel}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #F9A8D4, #C084FC)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        aspectRatio: '16 / 9',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {selectedFilter && (
          <FilterCanvas
            ref={canvasRef}
            videoRef={videoRef}
            filter={selectedFilter}
          />
        )}

        {recording && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            zIndex: 10,
          }}>
            <span style={{
              width: 8, height: 8, background: '#FF4444', borderRadius: '50%',
              animation: 'pulse-ring 1.5s infinite var(--ease)',
            }} />
            {formatTime(duration)}
          </div>
        )}
        {!ready && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 600,
            background: 'rgba(0,0,0,0.3)',
          }}>
            Requesting camera…
          </div>
        )}
      </div>

      <FilterSelector
        selectedFilter={selectedFilter}
        onSelectFilter={filter => setSelectedFilterId(filter?.id ?? null)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={!ready}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
          style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: recording ? '#FFFFFF' : 'var(--accent)',
            border: recording ? '4px solid var(--accent)' : 'none',
            cursor: ready ? 'pointer' : 'not-allowed',
            opacity: ready ? 1 : 0.5,
            transition: 'all 0.18s var(--ease)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(192,72,106,0.3)',
            padding: 0,
          }}
        >
          {recording ? (
            <span style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 4 }} />
          ) : (
            <span style={{ width: 24, height: 24, background: '#fff', borderRadius: '50%' }} />
          )}
        </button>

        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 360 }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onCancel}
            disabled={recording}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
