'use client';

import { useState, useRef } from 'react';
import { addVideo } from '@/lib/firebase/videos';
import { uploadVideo } from '@/lib/firebase/storage';
import { GAME_TAGS, type GameTag } from '@/lib/types';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

type Step = 0 | 1 | 2;

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [step, setStep] = useState<Step>(0);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState<GameTag>('Dress to Impress');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setStep(1); }
  };

  const handlePublish = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);

    try {
      // Create doc first to get the ID for the storage path
      const videoId = crypto.randomUUID();
      const storageUrl = await uploadVideo(file, videoId, ({ percent }) => {
        setProgress(percent);
      });

      await addVideo({
        title:      title.trim(),
        description: description.trim(),
        game,
        storageUrl,
        duration:   '', // Could extract from file metadata in future
      });

      onSuccess('Video uploaded! Share the link with family 🌹');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Upload failed:', msg);
      setUploadError(msg);
      setUploading(false);
    }
  };

  const steps = [
    {
      title: 'Choose your video',
      content: (
        <div>
          {/* Hidden file input — no `capture` so iPad shows full gallery picker */}
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '1.5px dashed rgba(192,72,106,0.4)',
              borderRadius: 10,
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--accent-light)',
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(192,72,106,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(192,72,106,0.4)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-light)';
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)', marginBottom: 4 }}>
              Tap to choose a video
            </p>
            <p style={{ fontSize: 12, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              MP4 or MOV from your iPad
            </p>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => fileRef.current?.click()}>
            Browse files
          </button>
        </div>
      ),
    },
    {
      title: 'Add details',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {file && (
            <div style={{
              padding: '10px 14px', borderRadius: 6,
              background: 'var(--accent-light)', border: '1px solid var(--accent-ring)',
              fontSize: 13, color: 'var(--accent)', fontWeight: 600,
            }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Video title…"
            autoFocus
          />
          <select
            className="input"
            value={game}
            onChange={e => setGame(e.target.value as GameTag)}
          >
            {GAME_TAGS.map(g => <option key={g}>{g}</option>)}
          </select>
          <textarea
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell everyone what happened in this video…"
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setStep(2)}
              disabled={!title.trim()}
            >
              Next →
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to publish!",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
          <p style={{ fontWeight: 600, fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>
            "{title || 'My video'}"
          </p>
          <p style={{ fontSize: 12, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {game}
          </p>
          <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, marginBottom: 24 }}>
            Only people you share the link with can watch. 🔒
          </p>

          {uploadError && (
            <div style={{
              marginBottom: 16, padding: '12px 14px', borderRadius: 6,
              background: 'var(--accent-light)', border: '1px solid var(--accent-ring)',
              fontSize: 13, color: 'var(--accent)', fontWeight: 600, textAlign: 'left',
            }}>
              Upload failed: {uploadError}
              <br />
              <span style={{ fontWeight: 400, opacity: 0.8 }}>
                Check that Firebase Storage rules allow writes for signed-in users.
              </span>
            </div>
          )}
          {uploading ? (
            <div>
              <div style={{
                height: 6, background: 'var(--border)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 12,
              }}>
                <div style={{
                  height: '100%', background: 'var(--accent)',
                  borderRadius: 3, width: `${progress}%`,
                  transition: 'width 0.3s var(--ease)',
                }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--sub)' }}>
                Uploading… {progress}%
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" onClick={() => { setStep(1); setUploadError(''); }}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: 15, padding: '12px 18px' }}
                onClick={handlePublish}
              >
                🌹 Publish to Red Rose Gaming
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(35,29,24,0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget && !uploading) onClose(); }}
    >
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        animation: 'modalIn 0.25s var(--ease)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.01em' }}>
            {current.title}
          </h2>
          {!uploading && (
            <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ fontSize: 16 }}>
              ✕
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 3, flex: 1, borderRadius: 2,
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.35s var(--ease)',
            }} />
          ))}
        </div>

        {current.content}
      </div>
    </div>
  );
}
