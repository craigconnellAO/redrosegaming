'use client';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--text)', color: '#fff',
      borderRadius: 8, padding: '12px 22px',
      fontSize: 14, fontWeight: 600, zIndex: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.25s var(--ease)',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}
