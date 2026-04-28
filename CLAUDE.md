# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Red Rose Gaming** — a private family video channel for Rose (age 8–10), an iPad-based Roblox content creator. Target device is iPad (tablet-first, touch UX). Deployed at `redrosegaming.vercel.app`.

All app code lives in `redrosegaming-app/`. Run all commands from that directory.

## Commands

```bash
cd redrosegaming-app

npm run dev      # Start dev server (auto-assigns port if 3000 is busy)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite exists yet.

> ⚠️ **AGENTS.md warning**: This is Next.js 16 with React 19. APIs and conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Architecture

### Stack
- **Next.js 16** App Router, **React 19**, **TypeScript**, **Tailwind CSS 4**
- **Firebase**: Auth (email/password), Firestore (real-time), Storage (resumable uploads)
- No test framework, no ORM, no state management library

### Provider tree (`src/app/layout.tsx`)
```
ThemeProvider → AuthProvider → {children}
```

**ThemeProvider** (`src/components/ThemeProvider.tsx`)  
- Reads/writes `localStorage` key `'rrg-theme'`
- Sets `document.documentElement.dataset.theme` to `'light'` or `'dark'`
- Exposes `useTheme()` → `{ theme, toggle }`

**AuthProvider** (`src/components/AuthProvider.tsx`)  
- Wraps Firebase `onAuthStateChanged`
- `isAdmin` is true when `user.email === NEXT_PUBLIC_ADMIN_EMAIL`
- Exposes `useAuth()` → `{ user, isAdmin, loading, signIn, signOut }`

### Firebase layer (`src/lib/firebase/`)
| File | Exports |
|------|---------|
| `config.ts` | `app`, `auth`, `db`, `storage` — single init via `getApps()` guard |
| `videos.ts` | `getVideo`, `getVideos`, `subscribeToVideos`, `addVideo`, `incrementViews`, `toggleLike` |
| `storage.ts` | `uploadVideo(file, videoId, onProgress)` — uses `uploadBytesResumable` for large iPad files |
| `comments.ts` | Comment CRUD |

### Data types (`src/lib/types.ts`)
`Video`, `Comment`, `GameTag` (union of 5 Roblox games), `GAME_TAGS[]`, `REACTIONS[]`, `thumbClass(game)` helper.

### Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `src/app/page.tsx` | Channel home: live video grid with filter tabs |
| `/watch/[id]` | `src/app/watch/[id]/page.tsx` | Video watch page with comments |
| `/login` | `src/app/login/page.tsx` | Admin login |
| `/record` | `src/app/record/page.tsx` | 3-phase: record → trim → publish |
| `/studio/[id]` | `src/app/studio/[id]/page.tsx` | Post-upload studio: add voice/face-cam commentary, text overlays, webcam PiP |

### Design token system (`src/app/globals.css`)

All UI is built with CSS custom properties — **never hardcode colours**:

```css
/* Light mode (:root) */
--bg, --bg-raw (raw RGB triplet), --card, --border,
--text, --sub, --accent, --accent-hover, --accent-light, --accent-ring
--font-display, --font-body, --ease, --ease-out
--radius-sm/md/lg/xl

/* Dark mode ([data-theme="dark"]) */
/* Same tokens, different values */
```

`--bg-raw` (e.g. `254, 251, 247`) exists specifically for `rgba(var(--bg-raw), 0.9)` in translucent headers — the normal hex form doesn't work in `rgba()`.

### Shared CSS classes (globals.css)
`.btn`, `.btn-primary`, `.btn-outline`, `.icon-btn` (44×44px, WCAG 2.5.5), `.input`, `.card`, `.section-label`, `.thumb-dti/bh/99n/other/chat` (game gradient backgrounds)

### Key components
| Component | Role |
|-----------|------|
| `SiteHeader` | Sticky header, compacts on scroll (84px → 60px), links home, dark mode toggle, admin controls |
| `StarscapeHero` | Canvas 2D animation (220 neon stars flyout). `isDark` in useEffect deps → re-init on theme change. White bg in light mode, `#04020F` in dark. |
| `VideoThumb` | Self-contained hover-to-play (muted). Shows real video frame via `preload="metadata"`. Falls back to game gradient. |
| `VideoCard` | Wraps VideoThumb + metadata + like/share buttons |
| `UploadModal` | 3-step wizard (pick file → details → publish). Calls `uploadVideo` then `addVideo`. Redirects to `/studio/[id]` on success. |
| `VideoRecorder` | `getUserMedia` webcam recorder. MIME type negotiation for Safari/Chrome. 3-min cap. |
| `VideoTrimmer` | Drag sliders for start/end. Re-encodes via `captureStream` (falls back to original blob if unsupported). |
| `CanvasCompositor` | Composites source video + circular webcam PiP + text overlays at 24fps via canvas & `requestAnimationFrame`. Exposes `captureStream()`. |
| `WebcamBubble` | Draggable/resizable circular webcam bubble. Mirror toggle. Position/size via `WebcamConfig` (x, y, radius). |
| `TextOverlayEditor` | Kid-friendly text editor: 5 fonts (Fredoka, Press Start 2P, Bangers, Caveat, Pacifico), 8-colour swatch, drag to position. |
| `RecordingTimeline` | Scrubber + DAW-style punch-in markers. Jump between commentary segments. |
| `RecordingControls` | Keyboard shortcuts: Space (record/stop), K (play/pause), R (restart), arrow keys (timeline scrub). ARIA live regions. |
| `ExportModal` | Preview composite, edit metadata, upload to Firebase Storage, generate share link. |
| `Footer` | Thin footer with channel branding, admin sign-in link |

### Recording flow
**`/record` page (3-phase):**  
`VideoRecorder` → blob → `VideoTrimmer` → File → `UploadModal` (with `initialFile` prop, skips step 0)

**`/studio/[id]` page (post-upload studio):**  
Load video from Firebase → `CanvasCompositor` watches source + `WebcamBubble` + `TextOverlayEditor` + `RecordingTimeline` + `RecordingControls` + `RecordingAudioBridge` → MediaRecorder (canvas stream + mic audio) → `ExportModal` → Firebase Storage + share link

## Environment variables

All `NEXT_PUBLIC_*` — set in Vercel and `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_ADMIN_EMAIL
```

Firebase API key exposure in the browser is safe and expected — security is enforced by Firestore/Storage rules, not key secrecy.

## Current development state

**Main branch**: `main` (Phase 1 + Phase 2 complete, live on Vercel)

### Phase 1 (complete, merged to main)
Full channel: home, watch page, upload, Firebase CRUD, dark mode, animated starscape hero, compact sticky header, hover-to-play thumbnails.

### Phase 2 (complete, merged to main — April 2026)
Post-upload Recording Studio with:
- `/studio/[id]` route — watch gameplay + overlay-record face/voice commentary
- `CanvasCompositor` — composites source video + webcam PiP + text overlays at 24fps
- `WebcamBubble` — draggable/resizable circular PiP with mirror toggle
- `TextOverlayEditor` — kid-friendly fonts: Fredoka, Press Start 2P, Bangers, Caveat, Pacifico; 8-colour swatch
- `RecordingTimeline` — scrubber + DAW-style punch-in markers for segment jump
- `RecordingControls` — Space (record/stop), K (play/pause), R (restart), arrow keys (timeline scrub); ARIA live regions
- `ExportModal` — preview composite, edit metadata, upload to Firebase, share `/watch/[id]` link
- `UploadModal` redirects to `/studio/[id]` on success
- Memory-optimized: periodic `recorder.requestData()` (2000ms) prevents iPad exhaustion during long recordings
- CORS-safe: Firebase Storage configured with `Access-Control-Allow-Origin` headers for canvas compositing

## iPad / accessibility constraints
- All touch targets ≥ 44px (WCAG 2.5.5) — use `.icon-btn`, `.input`, `.btn` classes which enforce this
- `min-height: 44px` on any custom interactive element
- Keyboard shortcuts for recording controls: Space (record/stop), R (restart)
- ARIA live regions for recording state announcements
- `preload="metadata"` on video elements (not `auto`) to avoid exhausting mobile bandwidth
- `playsInline` required on all `<video>` elements for iOS

## Cross-browser notes
- **Safari on iPad**: `video.duration` may be `Infinity` on recorded blobs — see `VideoTrimmer.handleLoaded` for the seek-to-end workaround
- **MediaRecorder MIME types**: prefer `video/mp4`, fall back to `video/webm` variants — see `VideoRecorder.startRecording`
- `captureStream` is `mozCaptureStream` in Firefox — see `VideoTrimmer.trimViaCaptureStream`
