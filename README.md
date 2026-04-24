# 🌹 Red Rose Gaming

A private family video-sharing platform for Rose — a young Roblox creator. Think a personal YouTube channel, but completely private. Only people with a link can watch.

---

## What it does

- **Channel homepage** — Rose's profile, video grid, filterable by game
- **Video player** — native HTML5 playback with likes and comments
- **Real-time comments** — family can leave comments and emoji reactions without needing an account
- **Private upload flow** — multi-step wizard optimised for iPad, with resumable upload for large video files
- **Admin login** — Rose (or a parent) signs in to upload and manage videos
- **Private by design** — no public search, no discovery. Videos are only accessible via direct link

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
| Fonts | DM Serif Display + Inter (Google Fonts) |

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
    page.tsx              # Channel home
    watch/[id]/page.tsx   # Video player
    login/page.tsx        # Admin login
    globals.css           # Design tokens + animations
    layout.tsx            # Root layout + AuthProvider
  components/
    AuthProvider.tsx      # Firebase auth context
    Nav.tsx               # Sticky navigation
    VideoCard.tsx         # Card in the grid
    VideoThumb.tsx        # Coloured game thumbnail
    CommentSection.tsx    # Real-time comments + reactions
    UploadModal.tsx       # 3-step upload wizard
    Toast.tsx             # Toast notifications
  lib/
    types.ts              # Shared TypeScript types
    firebase/
      config.ts           # Firebase initialisation
      videos.ts           # Video CRUD + real-time subscription
      comments.ts         # Comment CRUD + real-time subscription
      storage.ts          # Resumable video upload
```

---

*Built with love for Gracie 🌹*
