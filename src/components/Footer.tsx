'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function Footer() {
  const { user, signOut } = useAuth();

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'rgba(var(--bg-raw), 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '0 24px',
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17,
        color: 'var(--accent)',
        textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>🌹</span>
        Red Rose Gaming
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: 11, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          🔒 Private family channel
        </span>
        {user ? (
          <button
            onClick={() => signOut()}
            style={{
              fontSize: 12, fontWeight: 600, color: 'var(--sub)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 0', minHeight: 44,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--sub)')}
          >
            Sign out
          </button>
        ) : (
          <Link href="/login" style={{
            fontSize: 12, fontWeight: 600, color: 'var(--sub)',
            textDecoration: 'none', padding: '10px 0', minHeight: 44,
            display: 'inline-flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--sub)')}
          >
            Admin →
          </Link>
        )}
      </div>
    </footer>
  );
}
