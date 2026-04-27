'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { VideoRecorder } from '@/components/VideoRecorder';
import { VideoTrimmer } from '@/components/VideoTrimmer';
import { UploadModal } from '@/components/UploadModal';
import { Toast } from '@/components/Toast';

type Phase = 'record' | 'trim' | 'publish';

export default function RecordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('record');
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const [trimmed, setTrimmed] = useState<File | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const goHome = () => router.push('/');

  return (
    <>
      <SiteHeader />

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px 64px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24, letterSpacing: '-0.01em',
            color: 'var(--text)', marginBottom: 4,
          }}>
            {phase === 'record' && 'Record Clip'}
            {phase === 'trim' && 'Trim Your Clip'}
            {phase === 'publish' && 'Publish'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sub)' }}>
            {phase === 'record' && 'Tap the rose button to start recording.'}
            {phase === 'trim' && 'Drag the start and end markers to trim.'}
            {phase === 'publish' && 'Add details to publish your clip.'}
          </p>
        </div>

        {phase === 'record' && (
          <VideoRecorder
            onComplete={blob => {
              setRecorded(blob);
              setPhase('trim');
            }}
            onCancel={goHome}
          />
        )}

        {phase === 'trim' && recorded && (
          <VideoTrimmer
            blob={recorded}
            onComplete={file => {
              setTrimmed(file);
              setPhase('publish');
            }}
            onCancel={() => {
              setRecorded(null);
              setPhase('record');
            }}
          />
        )}
      </main>

      {phase === 'publish' && trimmed && (
        <UploadModal
          initialFile={trimmed}
          onClose={() => {
            setTrimmed(null);
            setPhase('trim');
          }}
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
