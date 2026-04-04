import { neon } from "@neondatabase/serverless";

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  return neon(databaseUrl);
}

export async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS channel_stats (
      id BIGSERIAL PRIMARY KEY,
      channel_id TEXT NOT NULL,
      subscriber_count BIGINT NOT NULL,
      video_count INTEGER NOT NULL,
      view_count BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}
