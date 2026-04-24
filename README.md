# Zenova — Emotion-Driven Holistic Wellness Platform

A demo-ready full-stack web app implementing the 155-point Zenova walkthrough: splash intro, landing page, auth, onboarding, dashboard tabs, wellness weather, recovery mode, weekly reflection, physical/mental/emotional tracking, unified wellness score, profile, protected routes, and JWT-secured API.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Local JSON file persistence for easy demo setup
- Auth: JWT + bcrypt

## How to Run

1. Install dependencies.

```bash
cd Zenova
npm install
npm run install-all
```

2. Create backend environment file.

```bash
cp backend/.env.example backend/.env
```

3. Start both frontend and backend.

```bash
npm run dev
```

4. Open the frontend.

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:5001
```

## Demo Walkthrough
1. Landing page and splash intro.
2. Explore Features panel and tooltips.
3. Join us → Signup.
4. Onboarding age/occupation.
5. Dashboard Overview → Daily check-in.
6. Show Wellness Weather, Recommendation, Recovery Mode after three stressed entries.
7. Physical/Mental/Emotional tabs.
8. Unified Wellness Score and cross-domain insights.
9. Profile page and check-in history.
10. Logout and protected route behavior.

## API Endpoints
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/user/profile
- PUT /api/user/onboarding
- POST /api/checkin
- GET /api/checkin/history
- GET /api/insights/weekly
- POST /api/physical
- POST /api/mental
- POST /api/emotional

## Notes
- The app uses the supplied `zenova_logo.svg` in the navbar and splash flow.
- The palette follows the strict Zenova color system: Ivory, Sage, Forest, Lavender, Sky, Peach, and Dew.
- Recommendations and insights are rule-based, deterministic, and demo-safe.
