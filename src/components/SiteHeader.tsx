'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';

interface SiteHeaderProps {
  videoCount?: number;
  totalViews?: number;
  onUpload?: () => void;
}

export function SiteHeader({ videoCount = 0, totalViews = 0, onUpload }: SiteHeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [compact, setCompact] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: compact
        ? 'rgba(var(--bg-raw), 0.92)'
        : 'rgba(var(--bg-raw), 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: compact ? '0 24px' : '14px 24px',
      height: compact ? 60 : 84,
      display: 'flex', alignItems: 'center', gap: 16,
      transition: 'height 0.3s ease, padding 0.3s ease',
    }}>
      {/* Logo — links home */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flex: 1, minWidth: 0 }}>
        <div style={{
          flexShrink: 0,
          width: compact ? 34 : 52,
          height: compact ? 34 : 52,
          borderRadius: compact ? 8 : 12,
          background: 'linear-gradient(135deg, #F9D0DC, #E8C8F0)',
          border: `${compact ? 1.5 : 2}px solid var(--accent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: compact ? 18 : 28,
          transition: 'all 0.3s ease',
        }}>
          🌹
        </div>

        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: compact ? 18 : 24,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            transition: 'font-size 0.3s ease',
            marginBottom: compact ? 0 : 4,
          }}>
            Red Rose Gaming
          </h1>
          <div style={{
            overflow: 'hidden',
            maxHeight: compact ? 0 : 20,
            opacity: compact ? 0 : 1,
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {videoCount} {videoCount === 1 ? 'video' : 'videos'} · {totalViews} views · 🔒 Private
            </p>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          className="icon-btn"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {isAdmin && onUpload && (
          <button className="btn btn-primary" onClick={onUpload}>
            + Upload
          </button>
        )}

        {user && (
          <button
            className="btn btn-outline"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ fontSize: 12 }}
          >
            {signingOut ? '…' : 'Sign out'}
          </button>
        )}
      </div>
    </header>
  );
}
