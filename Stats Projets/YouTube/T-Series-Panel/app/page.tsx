"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatsChart, VideosBarChart, ViewsAreaChart } from "@/components/stats-chart";

type ApiRow = {
  id: number;
  channel_id: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  created_at: string;
};

type StatsResponse = {
  success: boolean;
  data: ApiRow[];
  count: number;
  error?: string;
};

type TimeRange = "1d" | "7d" | "1m" | "6m" | "1y";

const RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: "1d", label: "1 day" },
  { key: "7d", label: "7 days" },
  { key: "1m", label: "1 month" },
  { key: "6m", label: "6 months" },
  { key: "1y", label: "1 year" }
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function computeDelta(latest: ApiRow | undefined, baseline: ApiRow | undefined, key: keyof ApiRow) {
  if (!latest || !baseline) {
    return 0;
  }

  return Number(latest[key]) - Number(baseline[key]);
}

function findBaseline(rows: ApiRow[], targetMs: number) {
  if (rows.length === 0) {
    return undefined;
  }

  let baseline = rows[0];
  for (const row of rows) {
    const rowMs = new Date(row.created_at).getTime();
    if (rowMs <= targetMs) {
      baseline = row;
    } else {
      break;
    }
  }

  return baseline;
}

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

export default function HomePage() {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");

  const loadStats = useCallback(async () => {
    const response = await fetch(`/api/stats?range=${timeRange}`, { cache: "no-store" });
    const bodyText = await response.text();
    let json: StatsResponse;

    try {
      json = JSON.parse(bodyText) as StatsResponse;
    } catch {
      throw new Error("The /api/stats route returned HTML (check server/env).");
    }

    if (!response.ok || !json.success) {
      throw new Error(json.error ?? "Unable to load stats.");
    }

    setRows(json.data);
  }, [timeRange]);

  const handlePing = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ping = await fetch("/get-api-count", {
        method: "GET",
        cache: "no-store"
      });
      const bodyText = await ping.text();
      let result: { success?: boolean; error?: string };

      try {
        result = JSON.parse(bodyText) as { success?: boolean; error?: string };
      } catch {
        throw new Error("The /get-api-count route returned HTML.");
      }

      if (!ping.ok || !result.success) {
        throw new Error(result.error ?? "Error during collection.");
      }

      await loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  useEffect(() => {
    loadStats().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Unknown error.");
    });
  }, [loadStats]);

  const latest = rows[rows.length - 1];
  const first = rows[0];
  const previous = rows[rows.length - 2];

  const chartData = useMemo(
    () =>
      rows.map((row) => ({
        time: new Date(row.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
        subscribers: Number(row.subscriber_count),
        views: Number(row.view_count),
        videos: Number(row.video_count)
      })),
    [rows]
  );

  const cards = useMemo(
    () => [
      {
        label: "Subscribers",
        value: latest ? formatNumber(Number(latest.subscriber_count)) : "-",
        detail: previous
          ? `${Number(latest?.subscriber_count) - Number(previous.subscriber_count) >= 0 ? "+" : ""}${formatNumber(
              Number(latest?.subscriber_count) - Number(previous.subscriber_count)
            )} since the last point`
          : "Not enough data"
      },
      {
        label: "Total views",
        value: latest ? formatNumber(Number(latest.view_count)) : "-",
        detail: first
          ? `${computeDelta(latest, first, "view_count") >= 0 ? "+" : ""}${formatCompact(
              computeDelta(latest, first, "view_count")
            )} over the period`
          : "Not enough data"
      },
      {
        label: "Videos",
        value: latest ? formatNumber(Number(latest.video_count)) : "-",
        detail: first
          ? `${computeDelta(latest, first, "video_count") >= 0 ? "+" : ""}${formatNumber(
              computeDelta(latest, first, "video_count")
            )} over the period`
          : "Not enough data"
      }
    ],
    [latest, previous, first]
  );

  const growthCards = useMemo(() => {
    if (!latest || rows.length === 0) {
      return [
        { label: "2026 Growth", value: "-", detail: "No data" },
        { label: "24 Hour Growth", value: "-", detail: "No data" },
        { label: "7 Day Growth", value: "-", detail: "No data" },
        { label: "30 Day Growth", value: "-", detail: "No data" },
        { label: "365 Day Growth", value: "-", detail: "No data" }
      ];
    }

    const latestMs = new Date(latest.created_at).getTime();
    const start2026Ms = new Date(2026, 0, 1, 0, 0, 0).getTime();
    const first2026 = rows.find((row) => new Date(row.created_at).getTime() >= start2026Ms);
    const baseline2026 = first2026 ?? rows[0];
    const baseline24h = findBaseline(rows, latestMs - 24 * 60 * 60 * 1000);
    const baseline7d = findBaseline(rows, latestMs - 7 * 24 * 60 * 60 * 1000);
    const baseline30d = findBaseline(rows, latestMs - 30 * 24 * 60 * 60 * 1000);
    const baseline365d = findBaseline(rows, latestMs - 365 * 24 * 60 * 60 * 1000);

    const makeCard = (label: string, baseline: ApiRow | undefined) => {
      const delta = computeDelta(latest, baseline, "subscriber_count");
      return {
        label,
        value: formatSigned(delta),
        detail: baseline ? `Base: ${new Date(baseline.created_at).toLocaleDateString("en-US")}` : "No baseline"
      };
    };

    return [
      makeCard("2026 Growth", baseline2026),
      makeCard("24 Hour Growth", baseline24h),
      makeCard("7 Day Growth", baseline7d),
      makeCard("30 Day Growth", baseline30d),
      makeCard("365 Day Growth", baseline365d)
    ];
  }, [latest, rows]);

  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="kicker">Live Tracking</p>
          <h1>T-Series Graph</h1>
        </div>
      </section>

      {error ? <p className="error">Error: {error}</p> : null}

      <section className="stats-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <p className="label">{card.label}</p>
            <p className="value">{card.value}</p>
            <p className="detail">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="panel chart-stack">
        <div className="panel-head">
          <h2>Historical charts</h2>
          <div className="panel-tools">
            <div className="timeframe-picker">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`time-btn ${timeRange === option.key ? "active" : ""}`}
                  onClick={() => setTimeRange(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <article className="chart-card">
          <div className="label">Subscriber count trend</div>
          <StatsChart data={chartData} />
        </article>
        <article className="chart-card">
          <div className="label">Views trend</div>
          <ViewsAreaChart data={chartData} />
        </article>
        <article className="chart-card">
          <div className="label">Video count trend</div>
          <VideosBarChart data={chartData} />
        </article>
      </section>

      <section className="panel growth-grid">
        {growthCards.map((card) => (
          <article className="stat-card compact" key={card.label}>
            <p className="label">{card.label}</p>
            <p className="value">{card.value}</p>
            <p className="detail">{card.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
