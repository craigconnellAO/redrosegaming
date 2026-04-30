import { FaceDetection } from './types';

let trackerLoaded = false;
let tracker: any = null;

export async function loadFaceModels() {
  if (trackerLoaded) return;

  // Dynamically load tracking.js from CDN
  if (typeof window === 'undefined') return;

  try {
    // Load the tracking library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.9.3/tracking.min.js';
    script.async = true;

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Wait for window.tracking to be available
    let attempts = 0;
    while (!window.tracking && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!window.tracking) {
      throw new Error('tracking.js failed to load');
    }

    tracker = new window.tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    trackerLoaded = true;
  } catch (e) {
    console.error('Failed to load face detection:', e);
    throw e;
  }
}

export async function detectFace(videoElement: HTMLVideoElement): Promise<FaceDetection | null> {
  if (!videoElement.videoWidth || !videoElement.videoHeight || !tracker) {
    return null;
  }

  try {
    const rects = tracker.track([videoElement]);

    if (rects.length === 0) {
      return null;
    }

    const rect = rects[0];

    // Normalize rect coordinates
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
    const height = rect.height;

    return {
      x,
      y,
      width,
      height,
      landmarks: {
        leftEye: { x: x + width * 0.3, y: y + height * 0.35 },
        rightEye: { x: x + width * 0.7, y: y + height * 0.35 },
        nose: { x: x + width / 2, y: y + height * 0.5 },
        mouth: { x: x + width / 2, y: y + height * 0.75 },
        leftEar: { x: x - 10, y: y + height * 0.3 },
        rightEar: { x: x + width + 10, y: y + height * 0.3 },
        forehead: { x: x + width / 2, y: y - 20 },
        jawline: { x: x + width / 2, y: y + height + 10 },
      },
    };
  } catch (e) {
    console.error('Face detection error:', e);
    return null;
  }
}

declare global {
  interface Window {
    tracking: any;
  }
}
