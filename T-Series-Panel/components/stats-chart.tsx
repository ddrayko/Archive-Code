"use client";

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type ChartPoint = {
  time: string;
  subscribers: number;
  views: number;
  videos: number;
};

const axisProps = {
  tick: { fill: "#d6a0aa", fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: "#4a1b24" }
};

const tooltipStyle = {
  backgroundColor: "#22090e",
  border: "1px solid #4a1b24",
  borderRadius: "10px",
  color: "#ffe9ed"
};

function ChartShell({ children }: { children: React.ReactNode }) {
  return <div style={{ width: "100%", height: 320 }}>{children}</div>;
}

function buildAdaptiveDomain(values: number[]): [number, number] {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return [0, 1];
  }

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);

  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.02;
    return [min - padding, max + padding];
  }

  const span = max - min;
  const padding = span * 0.1;
  return [min - padding, max + padding];
}

export function StatsChart({ data }: { data: ChartPoint[] }) {
  const yDomain = buildAdaptiveDomain(data.map((point) => point.subscribers));

  return (
    <ChartShell>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 14, right: 16, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="subscribersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3b4d" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ff3b4d" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#4a1b24" strokeDasharray="4 4" />
          <XAxis dataKey="time" {...axisProps} minTickGap={30} />
          <YAxis hide domain={yDomain} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="subscribers"
            stroke="#ff3b4d"
            fill="url(#subscribersFill)"
            strokeWidth={2.4}
            name="Subscribers"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function ViewsAreaChart({ data }: { data: ChartPoint[] }) {
  const yDomain = buildAdaptiveDomain(data.map((point) => point.views));

  return (
    <ChartShell>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 14, right: 16, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b78" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ff6b78" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#4a1b24" strokeDasharray="4 4" />
          <XAxis dataKey="time" {...axisProps} minTickGap={30} />
          <YAxis hide domain={yDomain} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#ff6b78"
            fill="url(#viewsFill)"
            strokeWidth={2.2}
            name="Views"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function VideosBarChart({ data }: { data: ChartPoint[] }) {
  const yDomain = buildAdaptiveDomain(data.map((point) => point.videos));

  return (
    <ChartShell>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 14, right: 16, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="videosFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8f9b" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ff8f9b" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#4a1b24" strokeDasharray="4 4" />
          <XAxis dataKey="time" {...axisProps} minTickGap={30} />
          <YAxis hide domain={yDomain} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="videos"
            stroke="#ff8f9b"
            fill="url(#videosFill)"
            strokeWidth={2.2}
            name="Videos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
