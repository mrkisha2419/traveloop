# Traveloop

Traveloop is a full-stack travel planning platform for creating trips, building drag-and-drop itineraries, discovering cities and activities, tracking budgets and expenses, managing packing lists, writing trip notes, generating AI plans, and sharing public itineraries.

## Features

- JWT authentication with access and refresh tokens
- Register, login, logout, refresh token, and forgot password API
- User profile settings, photo upload, export/delete account flows
- Trip creation, update, deletion, cover upload, public sharing
- Stops with reorder support and activity timelines
- City and activity search seeded with 30 real-world cities and 150 activities
- Budget dashboard with breakdowns, per-day analysis, and warnings
- Expense tracking with category totals
- Packing checklist with packed states and Claude-powered suggestions
- Trip notes with stop linking and autosave-ready editor
- Claude itinerary generation and destination recommendations
- Admin analytics, users table, and trips analytics
- Responsive React UI with mobile navigation and premium light travel styling

## Tech Stack

Frontend:

- React + Vite + TypeScript
- Tailwind CSS with shadcn-style reusable primitives
- React Router v6
- Zustand
- Axios
- react-hot-toast
- Recharts
- @dnd-kit/core and @dnd-kit/sortable
- date-fns

Backend:

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT auth
- bcrypt
- Multer + Cloudinary
- Zod validation
- Anthropic SDK using `claude-sonnet-4-20250514`

## Project Structure

```text
traveloop-fullstack/
  backend/
    src/
      config/
      middleware/
      routes/
      services/
      utils/
  frontend/
    src/
      api/
      components/
      hooks/
      pages/
      stores/
      types/
  prisma/
    migrations/
    schema.prisma
    seed.ts
```

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and run migration:

```bash
npx prisma migrate dev
```

5. Seed database:

```bash
npm run seed
```

6. Run backend and frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000`

## Demo Accounts

After seeding:

- User: `demo@traveloop.app` / `traveloop123`
- Admin: `admin@traveloop.app` / `admin123`

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`

Users:

- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/photo`
- `DELETE /api/users/me`

Trips:

- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:tripId`
- `PATCH /api/trips/:tripId`
- `DELETE /api/trips/:tripId`
- `POST /api/trips/:tripId/cover`
- `POST /api/trips/:tripId/share`
- `GET /api/trips/public/:shareSlug`

Stops and activities:

- `POST /api/trips/:tripId/stops`
- `PATCH /api/trips/:tripId/stops/reorder`
- `PATCH /api/trips/:tripId/stops/:stopId`
- `DELETE /api/trips/:tripId/stops/:stopId`
- `POST /api/trips/:tripId/stops/:stopId/activities`
- `PATCH /api/trips/:tripId/activities/:activityId`
- `DELETE /api/trips/:tripId/activities/:activityId`

Search:

- `GET /api/search/cities`
- `GET /api/search/activities`

Budget, checklist, notes, expenses:

- `GET /api/trips/:tripId/budget`
- `GET/POST/PATCH/DELETE /api/trips/:tripId/checklist`
- `GET/POST/PATCH/DELETE /api/trips/:tripId/notes`
- `GET/POST/PATCH/DELETE /api/trips/:tripId/expenses`

AI:

- `POST /api/ai/trips/:tripId/itinerary`
- `POST /api/ai/trips/:tripId/packing`
- `POST /api/ai/destinations`

Admin:

- `GET /api/admin/analytics`
- `GET /api/admin/users`
- `GET /api/admin/trips`

## Screenshots

Add screenshots here after running the app:

- Auth page
- Dashboard
- Itinerary builder
- Budget dashboard
- Packing checklist
- Public share page
- Admin analytics

## Notes

- Claude and Cloudinary integrations are environment-driven. If keys are missing, AI services return safe deterministic fallbacks and uploads return inline development data URLs.
- The public share page includes document title updates and a meta description in `index.html`.
- The UI uses accessible labels, visible focus states, responsive layouts, loading skeletons, empty states, and toast notifications.
