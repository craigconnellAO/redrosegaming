'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { Footer } from '@/components/Footer';
import { VideoCard } from '@/components/VideoCard';
import { UploadModal } from '@/components/UploadModal';
import { Toast } from '@/components/Toast';
import { subscribeToVideos } from '@/lib/firebase/videos';
import type { Video, GameTag } from '@/lib/types';

const FILTERS: (GameTag | 'All')[] = ['All', 'Dress to Impress', 'Brookhaven', '99 Nights', 'Just Chatting', 'Other Roblox'];

export default function ChannelPage() {
  const router = useRouter();
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
    () => {
      const notArchived = videos.filter(v => !v.archived);
      return filter === 'All' ? notArchived : notArchived.filter(v => v.game === filter);
    },
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
      <SiteHeader
        videoCount={videos.length}
        totalViews={totalViews}
        onUpload={() => setShowUpload(true)}
      />

      <section style={{ height: 300 }} />

      {/* Filter tabs */}
      <div style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', gap: 4, height: 56, alignItems: 'center',
        overflowX: 'auto',
        // Scroll indicator fade on right
        maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
      }}>
        {FILTERS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: '10px 18px', borderRadius: 20, fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              transition: 'all 0.18s var(--ease)', whiteSpace: 'nowrap',
              border: filter === tag ? '1px solid rgba(192,72,106,0.2)' : '1px solid transparent',
              background: filter === tag ? 'var(--accent-light)' : 'transparent',
              color: filter === tag ? 'var(--accent)' : 'var(--sub)',
              minHeight: 44,
            }}
          >
            {tag}
          </button>
        ))}
        {/* Spacer so last item clears the mask */}
        <div style={{ minWidth: 24, flexShrink: 0 }} />
      </div>

      {/* Grid */}
      <div style={{ padding: '28px 24px 48px' }}>
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 18,
          }}>
            {filtered.map(v => (
              <VideoCard key={v.id} video={v} onShare={copyLink} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(msg, videoId) => {
            showToast(`${msg} Opening Studio…`);
            setTimeout(() => router.push(`/studio/${videoId}`), 600);
          }}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
