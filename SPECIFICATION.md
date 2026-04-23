# Red Rose Gaming: Project Specification

## 1. Vision & Intention
**Red Rose Gaming** is a premium, private video-sharing platform designed for a young gamer (Rose) to share her gameplay experiences (primarily Roblox: *Dress to Impress*, *Brookhaven*, *99 Nights*) with a curated circle of family and friends.

Unlike generic social media, this project prioritizes:
- **Intimacy & Safety**: A private space where only approved family members can view and interact.
- **High-Fidelity Engagement**: Encouraging meaningful feedback via a bespoke commenting and reaction system.
- **Sophisticated Aesthetics**: Moving away from "childlike" designs towards a high-end, architectural visual language inspired by modern technology and brutalist minimalism.

---

## 2. Technical Architecture

### Core Stack
- **Frontend**: Next.js 16 (App Router) & React 19.
- **Language**: TypeScript.
- **Styling**: 
  - **Tailwind CSS 4**: For layout and structural utilities.
  - **Vanilla CSS**: For precision micro-animations, complex gradients, and custom interaction states.
- **Backend-as-a-Service**: Firebase
  - **Authentication**: Secure, private access control.
  - **Firestore**: Real-time database for video metadata, comments, and engagement metrics.
  - **Storage**: High-performance hosting for video assets.
  - **Hosting**: Global deployment via Firebase Hosting.

### Key Functional Modules
1. **Channel Dashboard**: A central hub showing the latest uploads, categorized by game, with high-level engagement stats.
2. **Video Experience**: A dedicated playback environment focused on the content, supported by a rich, multi-threaded commenting system.
3. **Private Upload Workflow**: A multi-step, intuitive wizard for uploading and metadata tagging, designed for ease of use on mobile/iPad.
4. **Theming Engine**: A robust system to handle visual state transitions, now consolidated into a singular, premium design system.

---

## 3. Design System: 'Nothing OS' Guideline
The project has transitioned from multiple expressive themes to a single, authoritative visual identity: **Nothing Style**. This system is neo-brutalist, clean, and architecturally focused.

### Color Palette
- **Primary Background**: `#000000` (Pitch Black)
- **Secondary Background**: `#111111` (Onyx)
- **Primary Accent**: `#D71921` (Nothing Red)
- **Secondary Accent**: `#FFFFFF` (Pure White)
- **Borders/Grids**: `#333333` / `#222222`
- **Text (Primary)**: `#E8E8E8`
- **Text (Subtle)**: `#999999`

### Typography
- **Display/Logo**: `Doto` (Dot Matrix style) — Used for branding and high-level headers.
- **Body/UI**: `Space Grotesk` — A modern, geometric sans-serif for readability.
- **Metadata/Technical**: `Space Mono` — Used for timestamps, view counts, and button labels to emphasize the "tech" aesthetic.

### Visual Language
- **Grids**: Extensive use of `dot-grid` patterns (16px and 12px variants) to create depth without clutter.
- **Corner Radii**: Sharp yet refined. `4px` for buttons/small elements, `12px` for cards and containers.
- **Componentry**:
  - **Segmented Bars**: Dot-matrix style progress and view indicators.
  - **Borders**: Constant `1px` solid borders (`#333333`) for structural definition.
  - **Transitions**: Controlled, linear-to-ease-out timing (`var(--nothing-ease)`) instead of bouncy/playful animations.
- **Icons/Emoji**: Minimalist usage. Monochrome icons preferred, using Red only for high-priority interactions (e.g., 'Like').

---

## 4. Architectural Goals for "Google Stitch" Iteration
The intent is to port these architectural foundations into a collaborative design/prototyping environment (Google Stitch) to iterate on:
1. **Interaction Density**: Maximizing screen real estate while maintaining the "clean" aesthetic.
2. **Video-First UX**: Ensuring the dot-matrix framing enhances rather than distracts from the gameplay footage.
3. **Mobile Optimization**: Refining the iPad-specific upload and navigation experience.
