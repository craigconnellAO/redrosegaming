"use client";

import React, { useState, useEffect } from 'react';
import { THEMES, VIDEOS, REACTIONS, INIT_COMMENTS } from '@/lib/data';

function Thumb({ v, large }: { v: any, large?: boolean }) {
  return (
    <div style={{
      width: '100%', paddingBottom: large ? '50%' : '56%',
      position: 'relative', borderRadius: large ? '16px 16px 0 0' : 16,
      overflow: 'hidden', flexShrink: 0,
      boxShadow: large ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.2)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${v.c1}, ${v.c2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.5s var(--smooth)',
      }}>
        <div style={{ fontSize: large ? 84 : 52, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))', transition: 'transform 0.5s var(--smooth)' }}>{v.emoji}</div>

        {/* Glow overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%)', mixBlendMode: 'overlay' }} />

        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          width: large ? 64 : 44, height: large ? 64 : 44,
          borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 30 : 20, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>🌹</div>
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: 'white',
          borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 800,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>{v.dur}</div>
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: 'white',
          borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 800,
          border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>{v.game}</div>
      </div>
    </div>
  );
}

function VideoCard({ v, T, liked, compact, onLike, onShare, onClick }: any) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        background: T.card, border: `1px solid ${T.cardBorder}`,
        borderRadius: 16, cursor: 'pointer',
        boxShadow: hover ? '0 32px 64px -12px rgba(0,0,0,0.15), 0 4px 24px rgba(0,0,0,0.06)' : T.shadow,
        transform: hover ? 'translateY(-6px) scale(1.01)' : 'none',
        transition: 'all 0.4s var(--smooth)',
        backdropFilter: T.backdrop, WebkitBackdropFilter: T.backdrop,
      }}
    >
      <div style={{ overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
        <Thumb v={v} />
      </div>
      <div style={{ padding: compact ? '14px 16px' : '16px 20px' }}>
        <h3 style={{
          fontWeight: 900, fontSize: compact ? 15 : 17, color: T.text, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          transition: 'color 0.2s',
        }}>{v.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: T.sub, fontWeight: 700 }}>👁 {v.views} · {v.date}</span>
          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
            <button onClick={onLike} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
              transition: 'transform 0.2s var(--spring-bounce)', transform: liked ? 'scale(1.2)' : 'scale(1)',
              filter: liked ? 'drop-shadow(0 2px 8px rgba(239,68,68,0.4))' : 'none',
            }}>{liked ? '❤️' : '🤍'}</button>
            <button onClick={onShare} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, transition: 'transform 0.2s', transform: 'scale(1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>🔗</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [themeId, setThemeId] = useState('dreamy');
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState('channel');
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [comments, setComments] = useState(INIT_COMMENTS);
  const [cName, setCName] = useState('');
  const [cText, setCText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadGame, setUploadGame] = useState('Dress to Impress');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('rg-theme');
    if (savedTheme) setThemeId(savedTheme);
    const savedPage = localStorage.getItem('rg-page');
    if (savedPage) setPage(savedPage);
    const savedVid = localStorage.getItem('rg-vid');
    if (savedVid) setActiveVideoId(Number(savedVid));
  }, []);

  const T = THEMES[themeId] || THEMES.dreamy;

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);

  const goVideo = (v: any) => {
    setActiveVideoId(v.id); setPage('video');
    localStorage.setItem('rg-page', 'video'); localStorage.setItem('rg-vid', String(v.id));
    window.scrollTo({ top: 0 });
  };
  const goChannel = () => {
    setPage('channel'); localStorage.setItem('rg-page', 'channel'); window.scrollTo({ top: 0 });
  };
  const toggleLike = (id: number) => {
    const isLiked = liked.has(id);
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(id) : n.add(id); return n; });
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? VIDEOS.find(v => v.id === id)?.likes ?? 0) + (isLiked ? -1 : 1) }));
  };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const shareLink = (id: number) => {
    navigator.clipboard?.writeText(`https://rosegaming.family/watch/${id}`).catch(() => { });
    showToast('🔗 Link copied! Share it with family & friends 💕');
  };
  const postComment = (gif: string | null = null) => {
    if (!cText.trim() && !gif) return;
    setComments(prev => [{ id: Date.now(), name: cName || 'Family Friend 💕', avatar: '🙂', text: cText, time: 'Just now', gif }, ...prev]);
    setCText(''); setShowReactions(false);
  };

  const activeVideo = VIDEOS.find(v => v.id === activeVideoId);
  const filtered = filter === 'All' ? VIDEOS : VIDEOS.filter(v => v.game === filter);

  const accentBtn = (outline = false) => ({
    padding: '8px 18px', borderRadius: 24, border: outline ? `2px solid ${T.accent}` : 'none',
    cursor: 'pointer', fontWeight: 800, fontSize: 14, transition: 'opacity 0.15s',
    background: outline ? 'transparent' : T.accentGrad,
    color: outline ? T.accent : 'white',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  });

  const LOGO_FONT = '"Architects Daughter", cursive';

  const Nav = () => (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: T.navBg, borderBottom: `1px solid ${T.navBorder}`,
      backdropFilter: T.backdrop || 'blur(20px)', WebkitBackdropFilter: T.backdrop || 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 72,
      boxShadow: '0 4px 32px rgba(0,0,0,0.04)',
      transition: 'background 0.5s var(--smooth), border-color 0.5s var(--smooth)'
    }}>
      <div onClick={goChannel} className="font-architects" style={{
        fontSize: 32, color: T.logoColor,
        cursor: 'pointer', userSelect: 'none', fontWeight: 900,
        textShadow: T.textShadow,
        letterSpacing: T.id === 'dreamy' ? 1 : 0,
        transition: 'all 0.5s var(--smooth)'
      }}>{T.logo}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {page === 'channel' && (
          <button style={accentBtn()} onClick={() => { setUploadStep(0); setShowUpload(true); }}>＋ Upload Video</button>
        )}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: T.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, cursor: 'pointer', border: `2px solid ${T.inputBorder}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s var(--spring-bounce)'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>🌹</div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
          <button onClick={() => { setThemeId('dreamy'); localStorage.setItem('rg-theme', 'dreamy'); }} 
                  style={{ width: 24, height: 24, borderRadius: '50%', background: THEMES.dreamy.accentGrad, border: 'none', cursor: 'pointer', outline: themeId === 'dreamy' ? `2px solid ${T.text}` : 'none', outlineOffset: 2 }} title="Dreamy Rose" />
          <button onClick={() => { setThemeId('galaxy'); localStorage.setItem('rg-theme', 'galaxy'); }} 
                  style={{ width: 24, height: 24, borderRadius: '50%', background: THEMES.galaxy.accentGrad, border: 'none', cursor: 'pointer', outline: themeId === 'galaxy' ? `2px solid ${T.text}` : 'none', outlineOffset: 2 }} title="Galaxy Gaming" />
          <button onClick={() => { setThemeId('fresh'); localStorage.setItem('rg-theme', 'fresh'); }} 
                  style={{ width: 24, height: 24, borderRadius: '50%', background: THEMES.fresh.accentGrad, border: 'none', cursor: 'pointer', outline: themeId === 'fresh' ? `2px solid ${T.text}` : 'none', outlineOffset: 2 }} title="Fresh & Clean" />
        </div>
      </div>
    </nav>
  );

  const ChannelPage = () => (
    <div>
      <div style={{ height: 190, background: T.banner, position: 'relative', overflow: 'hidden' }}>
        {T.stars && [...Array(28)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', background: 'white',
            opacity: Math.random() * 0.7 + 0.1,
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          }} />
        ))}
        {T.deco?.map((e: string, i: number) => (
          <div key={i} style={{ position: 'absolute', fontSize: 22 + i * 2, opacity: 0.3, left: `${8 + i * 12}%`, top: `${15 + i * 7}%` }}>{e}</div>
        ))}
      </div>
      <div style={{
        background: T.card, borderBottom: `1px solid ${T.cardBorder}`,
        padding: '0 32px 22px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 86, height: 86, borderRadius: '50%', marginTop: -43, flexShrink: 0,
          background: T.avatarBg, border: `4px solid ${T.card}`, outline: `3px solid ${T.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}>🌹</div>
        <div style={{ paddingTop: 14, flex: 1, minWidth: 200 }}>
          <h1 className="font-architects" style={{ fontSize: 30, color: T.text, lineHeight: 1 }}>Red Rose Gaming</h1>
          <p style={{ color: T.sub, fontSize: 13, marginTop: 5, fontWeight: 600 }}>
            {VIDEOS.length} videos · {VIDEOS.reduce((a, v) => a + v.views, 0)} total views · 🔒 Private channel
          </p>
          <p style={{ color: T.sub, fontSize: 13, marginTop: 2 }}>Gaming, Roblox & more 🎮</p>
        </div>
        <button style={{ ...accentBtn(), marginTop: 14 }} onClick={() => { setUploadStep(0); setShowUpload(true); }}>＋ Upload Video</button>
      </div>

      <div style={{ padding: '14px 32px 6px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['All', 'Dress to Impress', 'Brookhaven', '99 Nights'].map(tag => (
          <button key={tag} onClick={() => setFilter(tag)} style={{
            padding: '6px 18px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            border: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
            background: filter === tag ? T.accentGrad : T.tag,
            color: filter === tag ? 'white' : T.tagText,
          }}>{tag}</button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(auto-fill,minmax(200px,1fr))' : 'repeat(auto-fill,minmax(290px,1fr))',
        gap: 18, padding: '14px 32px 48px',
      }}>
        {filtered.map(v => (
          <VideoCard key={v.id} v={v} T={T} compact={compact}
            liked={liked.has(v.id)}
            onLike={() => toggleLike(v.id)}
            onShare={() => shareLink(v.id)}
            onClick={() => goVideo(v)}
          />
        ))}
      </div>
    </div>
  );

  const VideoPage = () => {
    if (!activeVideo) return null;
    const v = activeVideo;
    const isLiked = liked.has(v.id);
    const likeCount = likes[v.id] ?? v.likes;
    return (
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '24px 24px 60px' }}>
        <button onClick={goChannel} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: T.sub,
          fontWeight: 800, fontSize: 14, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 6, padding: 0,
        }}>← Back to channel</button>

        <div style={{
          background: T.card, borderRadius: 16, overflow: 'hidden',
          border: `1.5px solid ${T.cardBorder}`, boxShadow: T.shadow,
        }}>
          <Thumb v={v} large />
          <div style={{ padding: '20px 22px' }}>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: T.text, lineHeight: 1.3 }}>{v.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ color: T.sub, fontSize: 13, fontWeight: 600 }}>👁 {v.views} views · {v.date}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleLike(v.id)} style={{
                  ...accentBtn(false),
                  background: isLiked ? T.accentGrad : T.accentLight,
                  color: isLiked ? 'white' : T.accent,
                }}>{isLiked ? '❤️' : '🤍'} {likeCount}</button>
                <button onClick={() => shareLink(v.id)} style={accentBtn(true)}>🔗 Share</button>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: T.accentLight, color: T.text, fontSize: 14, lineHeight: 1.65 }}>{v.desc}</div>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <h3 style={{ fontWeight: 900, fontSize: 20, color: T.text, marginBottom: 18 }}>💬 Comments ({comments.length})</h3>
          <div style={{ background: T.card, border: `1.5px solid ${T.cardBorder}`, borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: T.shadow }}>
            <input value={cName} onChange={e => setCName(e.target.value)}
              placeholder="Your name (e.g. Grandma Pat 💛)"
              style={{ width: '100%', padding: '9px 13px', borderRadius: 10, marginBottom: 10, border: `1.5px solid ${T.inputBorder}`, background: T.inputBg, fontSize: 14, color: T.text, outline: 'none' }}
            />
            <textarea value={cText} onChange={e => setCText(e.target.value)}
              placeholder="Leave a lovely comment for Rose... 💕" rows={3}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${T.inputBorder}`, background: T.inputBg, fontSize: 14, color: T.text, resize: 'none', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button style={accentBtn()} onClick={() => postComment(null)}>Post 💬</button>
              <button style={accentBtn(true)} onClick={() => setShowReactions(r => !r)}>🎉 Send Reaction</button>
            </div>
            {showReactions && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 14 }}>
                {REACTIONS.map(r => (
                  <button key={r.id} onClick={() => postComment(r.emoji)} style={{
                    padding: '12px 6px', borderRadius: 12, border: `1.5px solid ${T.cardBorder}`,
                    background: r.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4, transition: 'transform 0.1s',
                  }}>
                    <span style={{ fontSize: 26 }}>{r.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {comments.map((c, i) => (
            <div key={c.id} style={{
              background: T.commentBg, border: `1px solid ${T.cardBorder}`, backdropFilter: T.backdrop, WebkitBackdropFilter: T.backdrop,
              borderRadius: '20px 20px 20px 4px', padding: '16px 20px', marginBottom: 16,
              display: 'flex', gap: 14, alignItems: 'flex-start',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              animation: `springUp 0.6s var(--spring-bounce) ${i * 0.1}s backwards`,
            }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `2px solid ${T.inputBorder}` }}>{c.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: 15, color: T.text }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: T.sub, fontWeight: 700 }}>{c.time}</span>
                </div>
                {c.gif && <div style={{ display: 'inline-flex', alignItems: 'center', background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 24, padding: '6px 16px', margin: '8px 0', fontSize: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>{c.gif}</div>}
                {c.text && <p style={{ marginTop: 6, fontSize: 15, color: T.text, lineHeight: 1.6, fontWeight: 600 }}>{c.text}</p>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <h3 style={{ fontWeight: 900, fontSize: 18, color: T.text, marginBottom: 14 }}>More videos 🎮</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {VIDEOS.filter(x => x.id !== v.id).slice(0, 4).map(x => (
              <VideoCard key={x.id} v={x} T={T} compact
                liked={liked.has(x.id)}
                onLike={() => toggleLike(x.id)}
                onShare={() => shareLink(x.id)}
                onClick={() => goVideo(x)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const UploadModal = () => {
    const steps = [
      {
        title: 'Choose your video 🎬',
        content: (
          <div>
            <div style={{ border: `3px dashed ${T.accent}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: T.accentLight, marginBottom: 16 }}>
              <div style={{ fontSize: 52 }}>📱</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: T.accent, marginTop: 12 }}>Tap to choose a video from your iPad</p>
              <p style={{ color: T.sub, fontSize: 13, marginTop: 6 }}>MP4, MOV — any recording you've made!</p>
            </div>
            <button style={{ ...accentBtn(), width: '100%', justifyContent: 'center' }} onClick={() => setUploadStep(1)}>Next →</button>
          </div>
        ),
      },
      {
        title: 'Give it a title 🌹',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
              placeholder="e.g. Dress to Impress — Galaxy Theme WIN! ✨"
              style={{ padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${T.inputBorder}`, background: T.inputBg, fontSize: 15, color: T.text, outline: 'none' }}
            />
            <select value={uploadGame} onChange={e => setUploadGame(e.target.value)} style={{ padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${T.inputBorder}`, background: T.inputBg, fontSize: 15, color: T.text, outline: 'none' }}>
              <option>Dress to Impress</option>
              <option>Brookhaven</option>
              <option>99 Nights</option>
              <option>Other Roblox</option>
              <option>Just Chatting</option>
            </select>
            <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}
              placeholder="Tell everyone what happened in this video... 😊" rows={3}
              style={{ padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${T.inputBorder}`, background: T.inputBg, fontSize: 14, color: T.text, resize: 'none', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={accentBtn(true)} onClick={() => setUploadStep(0)}>← Back</button>
              <button style={{ ...accentBtn(), flex: 1, justifyContent: 'center' }} onClick={() => setUploadStep(2)}>Next →</button>
            </div>
          </div>
        ),
      },
      {
        title: "You're ready! 🎉",
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <p style={{ fontWeight: 800, fontSize: 17, color: T.text, marginBottom: 8 }}>"{uploadTitle || 'My awesome video'}"</p>
            <p style={{ color: T.sub, fontSize: 14, marginBottom: 4 }}>Game: {uploadGame}</p>
            <p style={{ color: T.sub, fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>Your video will be uploaded and a private link will be created. Only people you share it with can watch it! 🔒</p>
            <button style={{ ...accentBtn(), width: '100%', justifyContent: 'center', fontSize: 16, padding: '12px 18px' }}
              onClick={() => { setShowUpload(false); showToast('🎉 Video uploaded! Copy the link to share with family 🔗'); setUploadTitle(''); setUploadDesc(''); setUploadStep(0); }}>
              🌹 Publish to Red Rose Gaming!
            </button>
          </div>
        ),
      },
    ];
    const step = steps[uploadStep];
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, animation: 'pulseGlow 0.4s var(--smooth) forwards' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
        <div style={{ background: T.card, backdropFilter: T.backdrop, WebkitBackdropFilter: T.backdrop, border: `1px solid ${T.cardBorder}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: T.shadow, animation: 'springUp 0.6s var(--spring-bounce)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: T.text }}>{step.title}</h2>
            <button onClick={() => setShowUpload(false)} style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: T.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: i <= uploadStep ? T.accent : T.inputBorder, transition: 'background 0.4s var(--smooth)' }} />
            ))}
          </div>
          {step.content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Nav />
      {page === 'channel' ? <ChannelPage /> : <VideoPage />}
      {showUpload && <UploadModal />}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: T.id === 'galaxy' ? '#1a1035' : 'white',
          border: `1.5px solid ${T.cardBorder}`, borderRadius: 30,
          padding: '12px 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          fontWeight: 700, fontSize: 14, color: T.text, zIndex: 300,
          animation: 'slideUp 0.3s ease',
        }}>{toast}</div>
      )}
    </div>
  );
}
