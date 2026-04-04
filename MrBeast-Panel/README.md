# MrBeast Stats Dashboard (Next.js + Neon)

A Next.js site deployable on Vercel with:
- API `GET /api/get-api-count` that pings Mixerno and inserts the result into Neon
- API `GET /api/stats` that returns historical records
- Dashboard with counters and charts

## 1) Local installation

```bash
npm install
cp .env.example .env.local
```

Set `DATABASE_URL` with your Neon connection string.

Then:

```bash
npm run dev
```

## 2) Endpoints

- `GET /api/get-api-count`
  - Fetch: `https://backend.mixerno.space/api/youtube/estv3/UCX6OQ3DkcsbYNE6H8uQQuVA`
  - Reads `subscriberCount`, `videoCount`, `viewCount`
  - Inserts into `channel_stats`

- `GET /api/stats?limit=200`
  - Returns the last N points in chronological order

## 3) Structure DB

The schema is in `sql/init.sql`.
The code also creates the table automatically if it does not exist.

## 4) Deploy Vercel

1. Push to GitHub
2. Import the repo into Vercel
3. Add the `DATABASE_URL` environment variable
4. Deploy

## 5) Automatic ping (optional)

You can schedule `/api/get-api-count` with:
- Vercel Cron
- or UptimeRobot / external cron
