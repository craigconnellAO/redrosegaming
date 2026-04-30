import * as faceapi from 'face-api.js';
import { FaceDetection } from './types';

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;

  // Load models from CDN
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/models';

  try {
    await Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceDetectionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (e) {
    console.error('Failed to load face models from CDN:', e);
    throw e;
  }
}

export async function detectFace(videoElement: HTMLVideoElement): Promise<FaceDetection | null> {
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    return null;
  }

  try {
    const detections = await faceapi.detectAllFaces(videoElement).withFaceLandmarks();

    if (detections.length === 0) {
      return null;
    }

    const detection = detections[0];
    const box = detection.detection.box;
    const landmarks = detection.landmarks;

    // Get landmark points
    const points = landmarks.positions;

    // Map to approximate landmark groups
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      landmarks: {
        leftEye: { x: points[36].x, y: points[36].y }, // Left eye outer corner
        rightEye: { x: points[45].x, y: points[45].y }, // Right eye outer corner
        nose: { x: points[30].x, y: points[30].y }, // Nose tip
        mouth: { x: points[57].x, y: points[57].y }, // Mouth center
        leftEar: { x: box.x - 20, y: box.y + 30 }, // Extrapolated left
        rightEar: { x: box.x + box.width + 20, y: box.y + 30 }, // Extrapolated right
        forehead: { x: box.x + box.width / 2, y: box.y - 30 }, // Top of head
        jawline: { x: box.x + box.width / 2, y: box.y + box.height }, // Bottom of face
      },
    };
  } catch (e) {
    console.error('Face detection error:', e);
    return null;
  }
}
