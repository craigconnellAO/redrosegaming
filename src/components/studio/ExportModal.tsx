'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadVideo } from '@/lib/firebase/storage';
import { addVideo } from '@/lib/firebase/videos';
import type { Video } from '@/lib/types';

interface Props {
  /** The recorded composite blob — what we'll upload. */
  blob: Blob;
  /** The original video — we copy game/title metadata. */
  source: Video;
  onClose: () => void;
  onSuccess: (newVideoId: string) => void;
}

export function ExportModal({ blob, source, onClose, onSuccess }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => URL.createObjectURL(blob));
  const [title, setTitle] = useState(`${source.title} (with commentary)`);
  const [description, setDescription] = useState(source.description ?? '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const sizeMb = (blob.size / 1024 / 1024).toFixed(1);

  const handlePublish = async () => {
    if (!title.trim()) return;
    setUploading(true);
    setError('');
    try {
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `studio-export.${ext}`, { type: blob.type });
      const videoId = crypto.randomUUID();
      const storageUrl = await uploadVideo(file, videoId, ({ percent }) => setProgress(percent));
      const newId = await addVideo({
        title: title.trim(),
        description: description.trim(),
        game: source.game,
        storageUrl,
        duration: source.duration ?? '',
      });
      onSuccess(newId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
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
        padding: 28, width: '100%', maxWidth: 560,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'modalIn 0.25s var(--ease)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="export-title" style={{
            fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.01em',
          }}>
            Save your masterpiece
          </h2>
          {!uploading && (
            <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
          )}
        </header>

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
            preload="metadata"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        <p style={{ fontSize: 12, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {source.game} · {sizeMb} MB
        </p>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="section-label">Title</span>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={uploading}
            maxLength={100}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="section-label">Description</span>
          <textarea
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={uploading}
            rows={3}
          />
        </label>

        {error && (
          <div role="alert" style={{
            padding: '12px 14px', borderRadius: 6,
            background: 'var(--accent-light)', border: '1px solid var(--accent-ring)',
            fontSize: 13, color: 'var(--accent)', fontWeight: 600,
          }}>
            Upload failed: {error}
          </div>
        )}

        {uploading ? (
          <div>
            <div style={{
              height: 6, background: 'var(--border)', borderRadius: 3,
              overflow: 'hidden', marginBottom: 8,
            }}>
              <div style={{
                height: '100%', background: 'var(--accent)',
                borderRadius: 3, width: `${progress}%`,
                transition: 'width 0.3s var(--ease)',
              }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--sub)' }}>Uploading… {progress}%</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handlePublish}
              disabled={!title.trim()}
            >
              🌹 Publish to Red Rose Gaming
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
