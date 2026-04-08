import Link from "next/link";

const RANGE_VALUES = ["1h", "6h", "12h", "1d", "7d", "1m", "6m", "1y"] as const;

export default function ApiDocsPage() {
  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="kicker">API Reference</p>
          <h1>T-Series Stats API</h1>
          <p className="intro">
            This page explains how to collect new snapshots and query historical data from your deployed API routes.
          </p>
        </div>
      </section>

      <section className="panel chart-stack">
        <article className="stat-card">
          <p className="label">Collect Snapshot</p>
          <p className="detail">
            Endpoint: <code>GET /api/get-api-count</code>
          </p>
          <p className="detail">
            Action: calls Mixerno API, validates payload, and inserts one row in <code>channel_stats</code> if values
            changed.
          </p>
          <p className="detail">Example: <code>curl https://tseries-panel.vercel.app/api/get-api-count</code></p>
        </article>

        <article className="stat-card">
          <p className="label">Read Historical Stats</p>
          <p className="detail">
            Endpoint: <code>GET /api/stats?range=...</code>
          </p>
          <p className="detail">Supported ranges:</p>
          <p className="detail">
            {RANGE_VALUES.map((range) => (
              <code key={range} style={{ marginRight: 10 }}>
                {range}
              </code>
            ))}
          </p>
          <p className="detail">Example: <code>curl &quot;https://tseries-panel.vercel.app/api/stats?range=6h&quot;</code></p>
        </article>

        <article className="stat-card">
          <p className="label">Response Shape</p>
          <pre
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #4a1b24",
              background: "#23090f",
              color: "#ffe9ed",
              overflowX: "auto"
            }}
          >
{`{
  "success": true,
  "range": "6h",
  "count": 12,
  "data": [
    {
      "id": 123,
      "channel_id": "UCq-Fj5jknLsUf-MWSy4_brA",
      "subscriber_count": 372000000,
      "video_count": 850,
      "view_count": 75600000000,
      "created_at": "2026-02-17T18:41:00.000Z"
    }
  ]
}`}
          </pre>
        </article>
      </section>

      <section className="panel">
        <Link href="/" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
