export interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  landmarks: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
    leftEar: { x: number; y: number };
    rightEar: { x: number; y: number };
    forehead: { x: number; y: number };
    jawline: { x: number; y: number };
  };
}

export interface FilterContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  videoElement: HTMLVideoElement;
  timestamp: number;
  face: FaceDetection | null;
}

export interface Filter {
  id: string;
  name: string;
  description: string;
  emoji: string;
  draw: (context: FilterContext) => void;
}

export type FilterId = string;
