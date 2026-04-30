'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import { Filter } from '@/lib/filters/types';
import { detectFace, loadFaceModels } from '@/lib/filters/faceDetection';

interface FilterCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  filter: Filter | null;
}

export const FilterCanvas = forwardRef<HTMLCanvasElement, FilterCanvasProps>(
  function FilterCanvas({ videoElement, filter }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const [modelsReady, setModelsReady] = useState(false);

    // Forward the ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    // Load face detection models
    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          await loadFaceModels();
          if (!cancelled) {
            setModelsReady(true);
          }
        } catch (e) {
          console.error('Failed to load face models:', e);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      if (!canvasRef.current || !videoRef?.current || !filter || !modelsReady) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const startTime = Date.now();

      const draw = async () => {
        const video = videoRef?.current;
        if (!video || !filter) return;

        try {
          // Match canvas size to video
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
          }

          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Detect face
          const face = await detectFace(video);

          // Draw filter
          filter.draw({
            ctx,
            canvas,
            videoElement: video,
            timestamp: Date.now() - startTime,
            face,
          });
        } catch (e) {
          console.error(`Error drawing filter ${filter.id}:`, e);
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      animationRef.current = requestAnimationFrame(draw);

      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [filter, modelsReady]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
        }}
      />
    );
  }
);