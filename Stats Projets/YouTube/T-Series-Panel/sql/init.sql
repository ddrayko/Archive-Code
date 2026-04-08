CREATE TABLE IF NOT EXISTS channel_stats (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL,
  subscriber_count BIGINT NOT NULL,
  video_count INTEGER NOT NULL,
  view_count BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
