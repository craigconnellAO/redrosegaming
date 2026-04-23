'use client';

import { useState, useEffect } from 'react';
import { subscribeToComments, addComment } from '@/lib/firebase/comments';
import { useAuth } from './AuthProvider';
import { REACTIONS, type Comment } from '@/lib/types';

interface CommentSectionProps {
  videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToComments(videoId, setComments);
    return unsub;
  }, [videoId]);

  const post = async (reactionEmoji?: string | null) => {
    if (!text.trim() && !reactionEmoji) return;
    setPosting(true);
    await addComment(
      videoId,
      name || (user?.displayName ?? ''),
      text,
      reactionEmoji ?? null,
      user?.uid ?? null,
    );
    setText('');
    setShowReactions(false);
    setPosting(false);
  };

  return (
    <div>
      <h3 className="section-label" style={{ marginBottom: 20 }}>
        Comments ({comments.length})
      </h3>

      {/* Form */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name (e.g. Grandma Pat)"
          style={{ marginBottom: 10 }}
        />
        <textarea
          className="input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Leave a lovely comment for Rose…"
          rows={3}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => post(null)}
            disabled={posting || !text.trim()}
          >
            Post comment
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowReactions(r => !r)}
          >
            {showReactions ? 'Hide reactions' : 'Send a reaction'}
          </button>
        </div>

        {showReactions && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8, marginTop: 14,
          }}>
            {REACTIONS.map(r => (
              <button
                key={r.emoji}
                onClick={() => post(r.emoji)}
                disabled={posting}
                style={{
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                  transition: 'all 0.15s var(--ease)',
                  minHeight: 44,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-light)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)';
                }}
              >
                <span style={{ fontSize: 24 }}>{r.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sub)' }}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment list */}
      {comments.map((c, i) => (
        <CommentBubble key={c.id} comment={c} index={i} />
      ))}

      {comments.length === 0 && (
        <p style={{ color: 'var(--sub)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          No comments yet — be the first!
        </p>
      )}
    </div>
  );
}

function CommentBubble({ comment: c, index }: { comment: Comment; index: number }) {
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      marginBottom: 14,
      animation: `slideIn 0.35s var(--ease) ${index * 0.04}s both`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #F9D0DC, #E8C8F0)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        🙂
      </div>
      <div style={{
        flex: 1,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: '0 10px 10px 10px',
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{c.authorName}</span>
          <span style={{ fontSize: 11, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {formatRelative(c.createdAt)}
          </span>
        </div>
        {c.reactionEmoji && (
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--accent-light)', border: '1px solid var(--accent-ring)',
            borderRadius: 20, padding: '4px 12px', marginBottom: 8, fontSize: 22,
          }}>
            {c.reactionEmoji}
          </div>
        )}
        {c.text && (
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>{c.text}</p>
        )}
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
