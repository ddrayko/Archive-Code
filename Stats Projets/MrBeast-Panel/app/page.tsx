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

function findBaselineAtOrAfter(rows: ApiRow[], targetMs: number) {
  if (rows.length === 0) {
    return undefined;
  }

  for (const row of rows) {
    const rowMs = new Date(row.created_at).getTime();
    if (rowMs >= targetMs) {
      return row;
    }
  }

  return rows[rows.length - 1];
}

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function HomePage() {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [growthRows, setGrowthRows] = useState<ApiRow[]>([]);
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

  const loadGrowthStats = useCallback(async () => {
    const response = await fetch("/api/stats?range=1y", { cache: "no-store" });
    const bodyText = await response.text();
    let json: StatsResponse;

    try {
      json = JSON.parse(bodyText) as StatsResponse;
    } catch {
      throw new Error("The /api/stats route returned HTML (check server/env).");
    }

    if (!response.ok || !json.success) {
      throw new Error(json.error ?? "Unable to load growth stats.");
    }

    setGrowthRows(json.data);
  }, []);

  useEffect(() => {
    Promise.all([loadStats(), loadGrowthStats()]).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Unknown error.");
    });
  }, [loadStats, loadGrowthStats]);

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
    const growthLatest = growthRows[growthRows.length - 1];

    if (!growthLatest || growthRows.length === 0) {
      return [
        { label: "2026 Growth", value: "-", detail: "No data" },
        { label: "24 Hour Growth", value: "-", detail: "No data" },
        { label: "7 Day Growth", value: "-", detail: "No data" },
        { label: "30 Day Growth", value: "-", detail: "No data" },
        { label: "365 Day Growth", value: "-", detail: "No data" }
      ];
    }

    const latestMs = new Date(growthLatest.created_at).getTime();
    const start2026Ms = new Date(2026, 0, 1, 0, 0, 0).getTime();
    const first2026 = growthRows.find((row) => new Date(row.created_at).getTime() >= start2026Ms);
    const baseline2026 = first2026;
    const baseline24h = findBaselineAtOrAfter(growthRows, latestMs - 24 * 60 * 60 * 1000);
    const baseline7d = findBaselineAtOrAfter(growthRows, latestMs - 7 * 24 * 60 * 60 * 1000);
    const baseline30d = findBaselineAtOrAfter(growthRows, latestMs - 30 * 24 * 60 * 60 * 1000);
    const baseline365d = findBaselineAtOrAfter(growthRows, latestMs - 365 * 24 * 60 * 60 * 1000);

    const makeCard = (label: string, baseline: ApiRow | undefined) => {
      const effectiveBaseline = baseline ?? growthRows[0];
      const delta = computeDelta(growthLatest, effectiveBaseline, "subscriber_count");
      return {
        label,
        value: formatSigned(delta),
        detail: baseline
          ? `Base: ${formatDateTime(effectiveBaseline.created_at)}`
          : `Base: ${formatDateTime(effectiveBaseline.created_at)} (partial history)`
      };
    };

    const has24hCoverage =
      new Date(growthLatest.created_at).getTime() - new Date(growthRows[0].created_at).getTime() >= 24 * 60 * 60 * 1000;

    const cards = [
      makeCard("2026 Growth", baseline2026),
      makeCard("24 Hour Growth", baseline24h),
      makeCard("7 Day Growth", baseline7d),
      makeCard("30 Day Growth", baseline30d),
      makeCard("365 Day Growth", baseline365d)
    ];

    if (!has24hCoverage) {
      cards[1] = {
        ...cards[1],
        detail: `${cards[1].detail} (less than 24h between first and latest point)`
      };
    }

    return cards;
  }, [growthRows]);

  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="kicker">Live Tracking</p>
          <h1>MrBeast Graph</h1>
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
