# 🌹 Red Rose Gaming

A private family video-sharing platform for Rose — a young Roblox creator. Think a personal YouTube channel, but completely private. Only people with a link can watch.

---

## What it does

### Phase 1: Channel & Playback
- **Channel homepage** — Rose's profile, video grid, filterable by game
- **Video player** — native HTML5 playback with likes and comments
- **Real-time comments** — family can leave comments and emoji reactions without needing an account
- **Private upload flow** — multi-step wizard optimised for iPad, with resumable upload for large video files
- **Admin login** — Rose (or a parent) signs in to upload and manage videos
- **Private by design** — no public search, no discovery. Videos are only accessible via direct link

### Phase 2: Recording Studio ✨ **NEW**
- **Post-upload studio** — After uploading a video, Rose can add voice/face-cam commentary and text overlays
- **Canvas compositing** — Renders source video + circular webcam PiP + text overlays in real-time at 24fps
- **Draggable webcam bubble** — Adjust position and size of her face-cam; mirror option for reversed view
- **Kid-friendly text overlays** — 5 playful fonts (Fredoka, Press Start 2P, Bangers, Caveat, Pacifico) + 8-color picker
- **Keyboard-friendly recording** — Space = record/stop, K = play/pause, R = restart, arrow keys = scrub timeline
- **Punch-in markers** — DAW-style recording markers to jump between commentary segments
- **Memory-optimized** — Works smoothly on iPad; periodic chunk draining prevents memory exhaustion during long recordings
- **One-click export** — Preview composite, edit metadata, upload to Firebase, share `/watch/[id]` link

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Auth | Firebase Authentication (email/password) |
| Database | Firebase Firestore (real-time) |
| Video storage | Firebase Storage (resumable upload) |
| Fonts | DM Serif Display, Inter, Fredoka, Press Start 2P, Bangers, Caveat, Pacifico (Google Fonts) |

---

## Design

The UI follows a **Contemporary Refined + Sparkle** direction — warm cream palette, elegant serif headings, coloured game-specific thumbnail gradients, and subtle sparkle animations in the hero. Grown-up enough for the family to enjoy, with just enough personality for Rose.

- Accent colour: `#C0486A` (deep rose)
- Display font: DM Serif Display
- Body font: Inter

---

## Routes

| Route | Description |
|---|---|
| `/` | Channel home — profile, filter tabs, video grid |
| `/watch/[id]` | Video player, description, likes, comments |
| `/login` | Admin sign in |
| `/record` | 3-phase record flow: record from webcam → trim → publish |
| `/studio/[id]` | Post-upload studio — add voice/face-cam commentary, text overlays, webcam PiP |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/craigconnellAO/redrosegaming.git
cd redrosegaming
npm install
```

### 2. Set up Firebase

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com) and enable:
- **Authentication** — Email/Password provider
- **Firestore** — create a database
- **Storage** — initialise a bucket

Copy your Firebase config into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_ADMIN_EMAIL=rose@yourdomain.com
```

### 3. Set Firebase security rules

**Firestore:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videos/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /comments/{id} {
      allow read: if true;
      allow create: if true;
      allow delete: if request.auth != null;
    }
  }
}
```

**Storage:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{file} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Create the admin account

In Firebase console → Authentication → Add user. Use the same email you set as `NEXT_PUBLIC_ADMIN_EMAIL`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Uploading videos (iPad)

1. Sign in at `/login` with the admin account
2. Tap **+ Upload Video** on the channel page
3. Choose a video from your iPad's photo library (MP4 or MOV)
4. Add a title, pick the game, and write a description
5. Publish — the upload is resumable so large files are handled safely
6. Copy the `/watch/[id]` link and share it with family

---

## Project structure

```
src/
  app/
    page.tsx                # Channel home
    watch/[id]/page.tsx     # Video player
    login/page.tsx          # Admin login
    record/page.tsx         # 3-phase record flow
    studio/[id]/page.tsx    # Post-upload recording studio
    globals.css             # Design tokens + animations
    layout.tsx              # Root layout + AuthProvider + ThemeProvider
  components/
    AuthProvider.tsx        # Firebase auth context
    ThemeProvider.tsx       # Theme toggle (light/dark)
    SiteHeader.tsx          # Sticky navigation (compact on scroll)
    StarscapeHero.tsx       # Canvas 2D animated starfield
    VideoCard.tsx           # Card in the grid
    VideoThumb.tsx          # Coloured game thumbnail + hover-to-play
    CommentSection.tsx      # Real-time comments + reactions
    UploadModal.tsx         # 3-step upload wizard
    VideoRecorder.tsx       # Webcam record to blob
    VideoTrimmer.tsx        # Drag-slider trim start/end
    Toast.tsx               # Toast notifications
    studio/
      CanvasCompositor.tsx  # Canvas 24fps compositor (source + webcam + overlays)
      WebcamBubble.tsx      # Draggable circular webcam PiP
      TextOverlayEditor.tsx # Kid-friendly text overlay creator
      RecordingTimeline.tsx # Scrubber + DAW-style punch-in markers
      RecordingControls.tsx # Space/K/R keyboard shortcuts + ARIA live regions
      ExportModal.tsx       # Preview + metadata editor + upload/share
  lib/
    types.ts                # Shared TypeScript types (Video, Comment, GameTag, Reaction)
    studio.ts               # Studio constants and type definitions
    firebase/
      config.ts             # Firebase initialisation + getApps() guard
      videos.ts             # Video CRUD + real-time subscription
      comments.ts           # Comment CRUD + real-time subscription
      storage.ts            # Resumable video upload with progress callback
```

---

## Changelog

### Phase 2: Recording Studio (April 2026)
**Features:**
- Post-upload recording studio (`/studio/[id]`) for adding voice and face-cam commentary
- Canvas-based compositing at 24fps: source video + circular webcam PiP + text overlays
- Draggable, resizable webcam bubble with mirror option
- 5 kid-friendly fonts for text overlays: Fredoka, Press Start 2P, Bangers, Caveat, Pacifico
- 8-color text overlay picker
- Keyboard-friendly: Space (record/stop), K (play/pause), R (restart), arrow keys (timeline scrub)
- DAW-style punch-in markers for recording commentary segments
- Memory-optimized: periodic chunk draining prevents iPad exhaustion during long recordings
- One-click export: preview, edit metadata, upload to Firebase, share watch link

**Bug Fixes:**
- Fixed CORS blocking canvas compositing by configuring Firebase Storage `Access-Control-Allow-Origin` headers
- Fixed 6-second recording cutoff by implementing periodic `recorder.requestData()` (2000ms interval)
- Fixed blank canvas on first playback by ensuring video metadata is loaded before drawing

**Improvements:**
- Consolidated console logging; removed 14+ redundant `console.log` statements
- Simplified canvas tick function: streamlined readyState checks and interval throttling
- Enhanced video error handling with decoded error codes and detailed diagnostics
- Refactored event listeners (10 → 5 essential, removed redundant capacity checks)

### Phase 1: Channel & Playback (March 2026)
**Features:**
- Private channel homepage with Rose's profile and filterable video grid (by Roblox game)
- Native HTML5 video player with real-time likes and comments
- Emoji reactions and comment threading (no account required)
- 3-step upload wizard optimized for iPad with resumable upload for large files
- Admin authentication (email/password via Firebase)
- Dark mode with theme toggle
- Animated starscape hero with canvas-based 2D animation
- Hover-to-play video thumbnails with game-specific gradient backgrounds
- Compact sticky header that shrinks on scroll (84px → 60px)
- WCAG 2.5.5 accessibility: all touch targets ≥ 44px

---

*Built with love for Gracie 🌹*
