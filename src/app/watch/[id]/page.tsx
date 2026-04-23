'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Nav } from '@/components/Nav';
import { VideoThumb } from '@/components/VideoThumb';
import { VideoCard } from '@/components/VideoCard';
import { CommentSection } from '@/components/CommentSection';
import { Toast } from '@/components/Toast';
import { getVideo, subscribeToVideos, incrementViews, toggleLike } from '@/lib/firebase/videos';
import { useAuth } from '@/components/AuthProvider';
import type { Video } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WatchPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const userId = user?.uid ?? 'guest';

  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const viewCounted = useRef(false);

  useEffect(() => {
    getVideo(id).then(v => {
      if (v) {
        setVideo(v);
        setLiked(v.likedBy.includes(userId));
        setLikeCount(v.likes);
      }
      setLoading(false);
    });
  }, [id, userId]);

  // Related videos (all others)
  useEffect(() => {
    const unsub = subscribeToVideos(vs => {
      setRelated(vs.filter(v => v.id !== id).slice(0, 4));
    });
    return unsub;
  }, [id]);

  // Count view once per session
  useEffect(() => {
    if (video && !viewCounted.current) {
      viewCounted.current = true;
      incrementViews(id);
    }
  }, [video, id]);

  const handleLike = async () => {
    if (!video) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(c => c + (nextLiked ? 1 : -1));
    await toggleLike(video.id, userId, liked);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setToast('Link copied — share it with family 🌹');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div style={{ textAlign: 'center', padding: '120px 32px', color: 'var(--sub)' }}>Loading…</div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Nav />
        <div style={{ textAlign: 'center', padding: '120px 32px' }}>
          <p style={{ color: 'var(--sub)', marginBottom: 16 }}>Video not found.</p>
          <Link href="/" className="btn btn-primary">← Back to channel</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600, color: 'var(--sub)',
          textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.07em',
          marginBottom: 24, transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--sub)')}
        >
          ← Back to channel
        </Link>

        {/* Player */}
        <div style={{
          width: '100%', borderRadius: 12,
          overflow: 'hidden', border: '1px solid var(--border)',
          marginBottom: 24,
          background: '#000',
        }}>
          {video.storageUrl ? (
            <video
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', display: 'block', maxHeight: '60vh' }}
              src={video.storageUrl}
            />
          ) : (
            <VideoThumb video={video} large />
          )}
        </div>

        {/* Details card */}
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, letterSpacing: '-0.01em', lineHeight: 1.2,
            marginBottom: 12,
          }}>
            {video.title}
          </h1>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
            paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, color: 'var(--sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {video.views} views · {video.game}
              {video.duration && ` · ${video.duration}`}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleLike}
                className="btn"
                style={{
                  background: liked ? 'var(--accent)' : 'transparent',
                  border: `1px solid ${liked ? 'var(--accent)' : 'var(--border)'}`,
                  color: liked ? '#fff' : 'var(--text)',
                  padding: '8px 16px',
                }}
              >
                {liked ? '❤️' : '♡'} {likeCount}
              </button>
              <button onClick={copyLink} className="btn btn-outline">⎋ Share</button>
            </div>
          </div>

          {video.description && (
            <p style={{
              fontSize: 14, lineHeight: 1.75,
              background: 'var(--bg)', borderRadius: 6,
              padding: 16, border: '1px solid var(--border)',
            }}>
              {video.description}
            </p>
          )}
        </div>

        {/* Comments */}
        <CommentSection videoId={video.id} />

        {/* Related videos */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 className="section-label" style={{ marginBottom: 16 }}>More videos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {related.map(v => (
                <VideoCard key={v.id} video={v} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      <Toast message={toast} />
    </>
  );
}
