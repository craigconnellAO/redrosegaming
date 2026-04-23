'use client';

import { useState, useEffect, useMemo } from 'react';
import { Nav } from '@/components/Nav';
import { VideoCard } from '@/components/VideoCard';
import { UploadModal } from '@/components/UploadModal';
import { Toast } from '@/components/Toast';
import { subscribeToVideos } from '@/lib/firebase/videos';
import type { Video, GameTag } from '@/lib/types';

const FILTERS: (GameTag | 'All')[] = ['All', 'Dress to Impress', 'Brookhaven', '99 Nights'];

// Sparkle dot positions (deterministic — avoids SSR mismatch)
const SPARKLES = [
  { size: 5, opacity: 0.5, top: '22%', left: '12%', delay: 0 },
  { size: 3, opacity: 0.6, top: '65%', left: '18%', delay: 0.7 },
  { size: 6, opacity: 0.35, top: '30%', left: '78%', delay: 1.2 },
  { size: 4, opacity: 0.5, top: '70%', left: '72%', delay: 0.4 },
  { size: 3, opacity: 0.45, top: '15%', left: '50%', delay: 1.8 },
  { size: 5, opacity: 0.4, top: '78%', left: '42%', delay: 0.9 },
  { size: 3, opacity: 0.4, top: '50%', left: '8%',  delay: 2.1 },
  { size: 4, opacity: 0.3, top: '20%', left: '88%', delay: 0.3 },
  { size: 6, opacity: 0.3, top: '88%', left: '60%', delay: 1.5 },
  { size: 3, opacity: 0.5, top: '42%', left: '95%', delay: 0.6 },
];

export default function ChannelPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState<GameTag | 'All'>('All');
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToVideos(vs => {
      setVideos(vs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(
    () => filter === 'All' ? videos : videos.filter(v => v.game === filter),
    [videos, filter],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const copyLink = (id: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/watch/${id}`).catch(() => {});
    showToast('Link copied — share it with family 🌹');
  };

  const totalViews = videos.reduce((a, v) => a + v.views, 0);

  return (
    <>
      <Nav onUpload={() => setShowUpload(true)} />

      {/* Hero */}
      <div style={{
        position: 'relative', height: 280, overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #FDF0F3 0%, #F5EBF7 50%, #EEF2FD 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', width: 500, height: 500,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(192,72,106,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: s.size, height: s.size,
            background: i % 2 === 0 ? 'var(--accent)' : '#B080C0',
            opacity: s.opacity,
            top: s.top, left: s.left,
            animation: `shimmer ${3 + (i % 3) * 0.8}s ${s.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', animation: 'fadeUp 0.8s var(--ease) both' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56, letterSpacing: '-0.02em', lineHeight: 1,
            color: 'var(--text)', marginBottom: 10,
          }}>
            Red Rose Gaming
          </h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Private Family Channel
          </p>
        </div>
      </div>

      {/* Profile strip */}
      <div style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '0 32px 24px',
        display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 88, height: 88, marginTop: -44, flexShrink: 0,
          borderRadius: 10, border: '3px solid var(--card)', outline: '2px solid var(--accent)',
          background: 'linear-gradient(135deg, #F9D0DC, #E8C8F0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, animation: 'pulse-ring 3.5s ease-in-out infinite',
        }}>
          🌹
        </div>
        <div style={{ paddingTop: 14, flex: 1, minWidth: 180 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.01em', marginBottom: 6 }}>
            Red Rose Gaming
          </h2>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'} · {totalViews} total views · 🔒 Private
          </p>
          <p style={{ fontSize: 14, color: 'var(--sub)', marginTop: 2 }}>Gaming, Roblox &amp; more</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', display: 'flex', gap: 4, height: 48, alignItems: 'center',
        overflowX: 'auto',
      }}>
        {FILTERS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              transition: 'all 0.18s var(--ease)', whiteSpace: 'nowrap',
              border: filter === tag ? '1px solid rgba(192,72,106,0.2)' : '1px solid transparent',
              background: filter === tag ? 'var(--accent-light)' : 'transparent',
              color: filter === tag ? 'var(--accent)' : 'var(--sub)',
              minHeight: 36,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '32px 32px 64px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--sub)' }}>
            Loading videos…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--sub)' }}>
            {videos.length === 0
              ? 'No videos yet — upload the first one!'
              : 'No videos in this category.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(v => (
              <VideoCard key={v.id} video={v} onShare={copyLink} />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={showToast}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
