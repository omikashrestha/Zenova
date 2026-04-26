# Zenova - Action-Based Wellness Platform (v2)

Zenova is a full-stack wellness platform that helps users take small daily actions across physical, mental, emotional, and recovery health.  
The current release uses an action-module experience instead of a traditional dashboard-tab layout.

## Live Deployment

- Frontend (Vercel): your production Vercel URL
- Backend (Render): https://zenova-backend.onrender.com

## Release

- Current production tag: `v2.0.0-action-modules-live`
- Branch merged to production: `main`

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Icons: Lucide React
- Storage: JSON persistence (`backend/zenova-db.json`)
- Authentication: JWT + bcrypt
- Deploy: Vercel (frontend), Render (backend)

## Core Product Flow (v2)

1. Landing + auth modal (signup/login)
2. Onboarding (age group, occupation)
3. Today's Focus home with module cards
4. Action modules:
   - Physical Activity
   - Hydration
   - Sleep
   - Calm & Reset
   - Mind & Emotions
5. Profile module with activity summary and preferences

## UX and Design Rules

- No emojis in interface actions; Lucide icons are used throughout modules
- Card-based layout with minimal copy
- Color system:
  - Green `#6B9E78` for physical health
  - Lavender `#9B8FCA` for mental and emotional state
  - Blue `#AACFE0` for hydration and sleep context
  - Peach `#E8CBBA` for warning and recovery accents
- Typography:
  - Headings: DM Serif Display
  - Body: DM Sans
- Base background tone: ivory (`#F7F5F0`)
- Zenova logo click routes users to:
  - `/dashboard` when logged in
  - `/` when logged out

## Local Development

### 1) Install dependencies

```bash
npm install
npm run install-all
```

### 2) Configure backend environment

```bash
cp backend/.env.example backend/.env
```

### 3) Run app

```bash
npm run dev
```

This starts frontend and backend together from the root workspace.

### 4) Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5003/api`

Frontend API base is configured via:

- `VITE_API_URL` (recommended in production), or
- fallback `http://localhost:5003/api`

## Key Frontend Entry Points

- `frontend/src/main.jsx` - routing, auth flow, home module hub
- `frontend/src/modules/` - module implementations
- `frontend/src/PageWrapper.jsx` - shared module wrapper

## Key Backend Entry Point

- `backend/server.js` - API bootstrap and route mounts

## API Surface (high level)

- Auth: `/api/auth/*`
- User: `/api/user/*`
- Check-ins: `/api/checkin/*`
- Insights: `/api/insights/*`
- Coach/Module persistence: `/api/coach/*`
- Mind and journaling routes: `/api/*` (from `mindRoutes`)
- Legacy compatibility:
  - `POST /api/physical`
  - `POST /api/mental`
  - `POST /api/emotional`
  - `POST /api/sleep`
  - `POST /api/calm`

## Notes

- The backend on Render free tier may cold start after inactivity.
- Large static media should be monitored for repository size impact and may be moved to CDN or object storage in future iterations.
