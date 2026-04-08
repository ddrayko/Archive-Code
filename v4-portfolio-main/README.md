# Drayko - Creative Developer (Next.js)

Portfolio and admin panel (dashboard + "Project Ops") built with Next.js (App Router), Firebase/Firestore, Clerk, Tailwind, and Radix UI.

## Features

- Public pages (v4 UI)
- Admin login + dashboard: project management, news, stats, and global toggles (maintenance, v4, availability, error mode)
- Project Ops: "Single project" mode + "General" mode (updates/events + global calendar)
- Firestore as the main data source

## Stats
![Alt](https://repobeats.axiom.co/api/embed/dea08b428617027867d6865dca9c9664506643e8.svg "Repobeats analytics image")

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Firebase (Firestore + Storage)
- Clerk (auth)
- Tailwind CSS + Radix UI (shadcn-style components)

## Quick Install

You can install and configure the project quickly using the provided interactive scripts.

### Linux / macOS

```bash
curl -o install.sh https://drayko.xyz/install.sh && chmod +x install.sh && ./install.sh
```

### Windows

Download [install.bat](https://drayko.xyz/install.bat) and run it.

## Getting Started

Prerequisites: recent Node.js + npm.

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - copy `.env.example` to `.env`
   - fill values
3. Start development server:
   - `npm run dev`

## Environment Variables

Main variables:
- Firebase (public): `NEXT_PUBLIC_FIREBASE_*`
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Cloudflare (optional): `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`

## Admin

Routes:
- `/admin`: admin login page
- `/admin/dashboard`: main dashboard
- `/admin/projects`: Project Ops (internal organization)

Notes:
- Admin session uses the `admin_session` cookie (see `lib/auth.ts` + `middleware.ts`).
- Project Ops data is stored in `project-admin/{projectId}`.
- The Project Ops roadmap is synced with `portfolio/{projectId}.changelog` (same model as dashboard updates).

## Firestore Data Model

- `portfolio` (projects)
  - project fields + `changelog: [{ id, version, date, changes[] }]`
- `admins` (admin accounts)
- `project-admin` (internal project metadata)
  - `notes`, `updates` (statuses), `events` (calendar)
- `news` (posts)
- `update-p/main` (site update badge / global changelog)

## Scripts

- `npm run dev`: dev server
- `npm run build`: production build
- `npm run start`: production server
- `npm run lint`: eslint (if installed/configured)
- `npm run sync-themes`: copy special-theme CSS files to `public/`

