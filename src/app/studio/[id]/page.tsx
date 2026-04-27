'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { Toast } from '@/components/Toast';
import { CanvasCompositor, type CanvasCompositorHandle } from '@/components/studio/CanvasCompositor';
import { WebcamBubble } from '@/components/studio/WebcamBubble';
import { TextOverlayEditor } from '@/components/studio/TextOverlayEditor';
import { RecordingTimeline } from '@/components/studio/RecordingTimeline';
import { RecordingControls } from '@/components/studio/RecordingControls';
import { ExportModal } from '@/components/studio/ExportModal';
import { getVideo } from '@/lib/firebase/videos';
import { useAuth } from '@/components/AuthProvider';
import {
  DEFAULT_WEBCAM,
  type PunchMarker, type TextOverlay, type WebcamConfig,
} from '@/lib/studio';
import type { Video } from '@/lib/types';

interface PageProps { params: Promise<{ id: string }>; }

export default function StudioPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  // Loaded video
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Imperative refs to DOM elements (mutated freely). A `mounted` flag triggers re-renders
  // / effects when the elements first appear.
  const sourceRef = useRef<HTMLVideoElement | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const compositorRef = useRef<CanvasCompositorHandle>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState({ source: false, webcam: false });
  const setSourceRef = useCallback((el: HTMLVideoElement | null) => {
    sourceRef.current = el;
    setMounted(m => (m.source === !!el ? m : { ...m, source: !!el }));
  }, []);
  const setWebcamRef = useCallback((el: HTMLVideoElement | null) => {
    webcamRef.current = el;
    setMounted(m => (m.webcam === !!el ? m : { ...m, webcam: !!el }));
  }, []);

  // Container element (for the WebcamBubble's coord space). useState here is fine — we only read it.
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  // Source-video state
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Studio state
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [webcam, setWebcam] = useState<WebcamConfig>(DEFAULT_WEBCAM);
  const [punches, setPunches] = useState<PunchMarker[]>([]);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Export
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [toast, setToast] = useState('');

  // Load the source video doc
  useEffect(() => {
    let cancelled = false;
    getVideo(id)
      .then(v => {
        if (cancelled) return;
        if (!v) {
          setError('Video not found.');
          setLoading(false);
          return;
        }
        setVideo(v);
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Request webcam + mic
  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        setWebcamStream(new MediaStream(stream.getVideoTracks()));
        setMicStream(new MediaStream(stream.getAudioTracks()));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPermissionError(`Camera/mic blocked: ${msg}`);
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Bind webcam stream to the hidden <video> driving the compositor
  useEffect(() => {
    const v = webcamRef.current;
    if (!v || !webcamStream) return;
    if (v.srcObject !== webcamStream) {
      v.srcObject = webcamStream;
      v.play().catch(() => {});
    }
  }, [webcamStream, mounted.webcam]);

  // Source-video event wiring
  useEffect(() => {
    const v = sourceRef.current;
    if (!v) return;

    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta = () => {
      setDuration(isFinite(v.duration) ? v.duration : 0);
    };
    const onError = () => {
      const errorCodeNames: Record<number, string> = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      };
      const errorCode = v.error?.code ?? v.networkState;
      const errorName = errorCodeNames[errorCode] || 'UNKNOWN';
      console.error('[StudioPage] Video load error:', { errorCode, errorName });
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('error', onError);

    if (v.readyState >= 1) onMeta();

    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('error', onError);
    };
  }, [mounted.source]);

  // Tick elapsed timer ONLY while recording — no setState on idle
  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, [recording]);

  const handleSeek = useCallback((t: number) => {
    const v = sourceRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration || t, t));
  }, [duration]);

  const handleTogglePlay = useCallback(() => {
    const v = sourceRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const handleRestart = useCallback(() => {
    const v = sourceRef.current;
    if (!v) return;
    v.currentTime = 0;
  }, []);

  const stopRecording = useCallback(() => {
    const v = sourceRef.current;
    const r = recorderRef.current;

    // Clean up the chunk collection interval
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    if (r && r.state !== 'inactive') {
      r.stop();
    }
    if (v) {
      setPunches(p => {
        if (p.length === 0) return p;
        const updated = [...p];
        const last = { ...updated[updated.length - 1] };
        last.duration = v.currentTime - last.time;
        updated[updated.length - 1] = last;
        return updated;
      });
      v.pause();
    }
    setRecording(false);
    setElapsed(0);
  }, []);

  const startRecording = useCallback(() => {
    const v = sourceRef.current;
    if (!v) return;
    const composite = compositorRef.current?.getStream();
    if (!composite) {
      setError('Could not start recording: composite stream unavailable.');
      return;
    }
    const tracks = [
      ...composite.getVideoTracks(),
      ...(micStream?.getAudioTracks() ?? []),
    ];
    const out = new MediaStream(tracks);

    const candidates = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mime = candidates.find(c => MediaRecorder.isTypeSupported(c)) ?? '';
    let recorder: MediaRecorder;
    try {
      // Use a 1-second timeslice to drain chunks periodically and prevent memory buildup
      // This is especially important on iPad with long recordings.
      recorder = mime
        ? new MediaRecorder(out, { mimeType: mime })
        : new MediaRecorder(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      setExportBlob(blob);
    };
    recorder.onerror = e => {
      console.error('[StudioPage] Recording error:', e.error);
      setError(`Recording error: ${e.error}`);
      setRecording(false);
    };

    setPunches(p => [...p, { id: `p_${Math.random().toString(36).slice(2, 8)}`, time: v.currentTime }]);

    // Request data every 2 seconds to prevent memory buildup on iPad
    // This ensures chunks are collected periodically rather than all at once on stop
    const chunkInterval = setInterval(() => {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
    }, 2000);

    recorder.start();
    recorderRef.current = recorder;
    chunkIntervalRef.current = chunkInterval;
    setRecording(true);
    v.play().catch(() => {});
  }, [micStream]);

  const handleToggleRecord = useCallback(() => {
    if (recording) stopRecording();
    else startRecording();
  }, [recording, startRecording, stopRecording]);

  // Auto-stop when source ends mid-recording
  useEffect(() => {
    const v = sourceRef.current;
    if (!v) return;
    const onEnded = () => { if (recording) stopRecording(); };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [recording, stopRecording, mounted.source]);

  // ── Render gates ─────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <>
        <SiteHeader />
        <div style={{ textAlign: 'center', padding: '120px 32px', color: 'var(--sub)' }}>Loading studio…</div>
      </>
    );
  }
  if (!isAdmin) {
    return (
      <>
        <SiteHeader />
        <div style={{ textAlign: 'center', padding: '120px 32px' }}>
          <p style={{ color: 'var(--sub)', marginBottom: 16 }}>You need to sign in to use the studio.</p>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <SiteHeader />
        <div style={{ textAlign: 'center', padding: '120px 32px' }}>
          <p style={{ color: 'var(--accent)', marginBottom: 16, fontWeight: 600 }}>{error}</p>
          <Link href="/" className="btn btn-outline">← Back to channel</Link>
        </div>
      </>
    );
  }
  if (!video) return null;

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 64px' }}>
        <Link href={`/watch/${video.id}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: 'var(--sub)',
          textDecoration: 'none', marginBottom: 12,
          minHeight: 44, padding: '10px 0',
        }}>
          ← Back to {video.title}
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.01em',
          marginBottom: 4,
        }}>
          Studio
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
          Add your face-cam, drop in fun captions, then hit the rose to record commentary.
        </p>

        {permissionError && (
          <div role="alert" style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 6,
            background: 'var(--accent-light)', border: '1px solid var(--accent-ring)',
            fontSize: 13, color: 'var(--accent)', fontWeight: 600,
          }}>
            {permissionError}
            <br />
            <span style={{ fontWeight: 400 }}>
              Tap the address-bar lock icon and allow camera + microphone, then refresh.
            </span>
          </div>
        )}

        <div className="studio-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              ref={setContainerEl}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#000',
                border: '1px solid var(--border)',
                aspectRatio: '16 / 9',
              }}
            >
              <CanvasCompositor
                ref={compositorRef}
                sourceVideoRef={sourceRef}
                webcamVideoRef={webcamRef}
                webcam={webcam}
                overlays={overlays}
              />
              <WebcamBubble
                stream={webcamStream}
                container={containerEl}
                cfg={webcam}
                onChange={setWebcam}
              />
            </div>

            {/* Off-screen (NOT display:none — that stops frame decoding so canvas would be black).
                crossOrigin enables canvas capture; Firebase Storage CORS must allow our origin. */}
            <video
              ref={setSourceRef}
              src={video.storageUrl}
              crossOrigin="anonymous"
              playsInline
              preload="auto"
              style={offscreenVideoStyle}
            />
            <video
              ref={setWebcamRef}
              autoPlay
              playsInline
              muted
              style={offscreenVideoStyle}
            />

            <RecordingControls
              recording={recording}
              elapsed={elapsed}
              playing={playing}
              canRecord={!!webcamStream && !!micStream && mounted.source}
              onToggleRecord={handleToggleRecord}
              onTogglePlay={handleTogglePlay}
              onRestart={handleRestart}
            />

            <RecordingTimeline
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              punches={punches}
              overlays={overlays}
              recording={recording}
            />
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextOverlayEditor
              overlays={overlays}
              onChange={setOverlays}
              duration={duration}
              currentTime={currentTime}
            />

            <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 className="section-label">Face-cam</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, minHeight: 44 }}>
                <input
                  type="checkbox"
                  checked={webcam.enabled}
                  onChange={e => setWebcam(w => ({ ...w, enabled: e.target.checked }))}
                  style={{ width: 18, height: 18 }}
                />
                Show face-cam
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, minHeight: 44 }}>
                <input
                  type="checkbox"
                  checked={webcam.mirror}
                  onChange={e => setWebcam(w => ({ ...w, mirror: e.target.checked }))}
                  style={{ width: 18, height: 18 }}
                />
                Mirror me
              </label>
              <p style={{ fontSize: 12, color: 'var(--sub)', margin: 0, lineHeight: 1.5 }}>
                Drag the bubble on the preview to move it. Drag the pink corner to resize.
              </p>
            </section>

            <section className="card" style={{ padding: 16, fontSize: 12, color: 'var(--sub)', lineHeight: 1.8 }}>
              <h3 className="section-label" style={{ marginBottom: 6 }}>Shortcuts</h3>
              <div><Kbd>Space</Kbd> record / stop</div>
              <div><Kbd>K</Kbd> play / pause</div>
              <div><Kbd>R</Kbd> restart</div>
              <div><Kbd>← →</Kbd> scrub ±1s (Shift = ±5s)</div>
            </section>
          </aside>
        </div>
      </main>

      {exportBlob && video && (
        <ExportModal
          blob={exportBlob}
          source={video}
          onClose={() => setExportBlob(null)}
          onSuccess={(newId) => {
            setExportBlob(null);
            setToast('Saved! Taking you to your new video…');
            setTimeout(() => router.push(`/watch/${newId}`), 800);
          }}
        />
      )}

      <Toast message={toast} />

      <style jsx>{`
        .studio-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: minmax(0, 1fr);
        }
        @media (min-width: 960px) {
          .studio-grid {
            grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
          }
        }
      `}</style>
    </>
  );
}

/** Position videos off-screen rather than `display:none`, which prevents frame decoding. */
const offscreenVideoStyle: React.CSSProperties = {
  position: 'absolute',
  left: -9999,
  top: -9999,
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      display: 'inline-block',
      minWidth: 22,
      padding: '2px 6px',
      borderRadius: 4,
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--text)',
      marginRight: 6,
      textAlign: 'center',
    }}>
      {children}
    </kbd>
  );
}
