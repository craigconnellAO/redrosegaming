'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface NavProps {
  onUpload?: () => void;
}

export function Nav({ onUpload }: NavProps) {
  const { user, isAdmin, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(254,251,247,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 24,
        color: 'var(--accent)',
        textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>
          🌹
        </span>
        Red Rose Gaming
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAdmin && onUpload && (
          <button className="btn btn-primary" onClick={onUpload}>
            + Upload Video
          </button>
        )}
        {user ? (
          <button
            className="btn btn-outline"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ fontSize: 13 }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <Link href="/login" style={{
            fontSize: 13, fontWeight: 600, color: 'var(--sub)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--sub)')}
          >
            Admin sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
