/**
 * Studio (Phase 2) — types & constants for the recording-studio UI.
 * Coordinates are normalized 0..1 so they survive resizes/aspect changes.
 */

export type StudioFont = 'fredoka' | 'press' | 'bangers' | 'caveat' | 'pacifico';

export interface StudioFontDef {
  id: StudioFont;
  label: string;
  cssFamily: string;
  /** Bumps the visual weight/tracking when stroke-rendered to canvas. */
  canvasWeight?: string;
}

export const STUDIO_FONTS: StudioFontDef[] = [
  { id: 'fredoka',  label: 'Round',  cssFamily: "'Fredoka', sans-serif", canvasWeight: '600' },
  { id: 'press',    label: 'Pixel',  cssFamily: "'Press Start 2P', monospace" },
  { id: 'bangers',  label: 'Comic',  cssFamily: "'Bangers', cursive" },
  { id: 'caveat',   label: 'Hand',   cssFamily: "'Caveat', cursive", canvasWeight: '700' },
  { id: 'pacifico', label: 'Script', cssFamily: "'Pacifico', cursive" },
];

export function fontCssFamily(id: StudioFont): string {
  return STUDIO_FONTS.find(f => f.id === id)?.cssFamily ?? STUDIO_FONTS[0].cssFamily;
}

export function fontCanvasWeight(id: StudioFont): string {
  return STUDIO_FONTS.find(f => f.id === id)?.canvasWeight ?? 'normal';
}

/** 8 colours — high-contrast, kid-friendly, all WCAG AA legible against the dark stroke. */
export const STUDIO_COLORS: { value: string; label: string }[] = [
  { value: '#FFFFFF', label: 'White'  },
  { value: '#FFD93D', label: 'Yellow' },
  { value: '#FF8A4C', label: 'Orange' },
  { value: '#FF4D88', label: 'Pink'   },
  { value: '#C084FC', label: 'Purple' },
  { value: '#7DD3FC', label: 'Sky'    },
  { value: '#7BE0AD', label: 'Mint'   },
  { value: '#231D18', label: 'Ink'    },
];

export interface TextOverlay {
  id: string;
  text: string;
  font: StudioFont;
  color: string;
  /** Center-x as fraction of canvas width (0..1). */
  x: number;
  /** Center-y as fraction of canvas height (0..1). */
  y: number;
  /** Font height as fraction of canvas height (e.g. 0.08 = 8%). */
  size: number;
  /** Visible from `startTime` (s in source video) until `endTime`. */
  startTime: number;
  endTime: number;
}

export interface WebcamConfig {
  enabled: boolean;
  /** Center, normalized. */
  x: number;
  y: number;
  /** Radius as fraction of canvas height. */
  radius: number;
  /** Mirror horizontally so kids see themselves the way they're used to. */
  mirror: boolean;
}

export const DEFAULT_WEBCAM: WebcamConfig = {
  enabled: true,
  x: 0.86,
  y: 0.84,
  radius: 0.18,
  mirror: true,
};

/** A 'punch-in' marker — a moment in the source video where the user pressed record. */
export interface PunchMarker {
  id: string;
  /** Source-video time (s) when the user hit record. */
  time: number;
  /** Optional duration (s) of the take. */
  duration?: number;
}

/** Canvas output settings — 720p @ 24fps is plenty for a kid's iPad clip. */
export const STUDIO_OUTPUT_WIDTH = 1280;
export const STUDIO_OUTPUT_HEIGHT = 720;
export const STUDIO_FRAMERATE = 24;

export function makeOverlayId(): string {
  return `o_${Math.random().toString(36).slice(2, 9)}`;
}
