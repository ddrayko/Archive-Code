import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { ChannelSnapshot } from "@/lib/types";

type TimeRange = "1h" | "6h" | "12h" | "1d" | "7d" | "1m" | "6m" | "1y";

function subtractRange(baseDate: Date, range: TimeRange) {
  const d = new Date(baseDate);

  if (range === "1h") {
    d.setHours(d.getHours() - 1);
  }
  if (range === "6h") {
    d.setHours(d.getHours() - 6);
  }
  if (range === "12h") {
    d.setHours(d.getHours() - 12);
  }
  if (range === "1d") {
    d.setDate(d.getDate() - 1);
  }
  if (range === "7d") {
    d.setDate(d.getDate() - 7);
  }
  if (range === "1m") {
    d.setMonth(d.getMonth() - 1);
  }
  if (range === "6m") {
    d.setMonth(d.getMonth() - 6);
  }
  if (range === "1y") {
    d.setFullYear(d.getFullYear() - 1);
  }

  return d;
}

export async function GET(request: NextRequest) {
  try {
    const rangeParam = request.nextUrl.searchParams.get("range");
    const validRanges: TimeRange[] = ["1h", "6h", "12h", "1d", "7d", "1m", "6m", "1y"];
    const range: TimeRange = validRanges.includes(rangeParam as TimeRange) ? (rangeParam as TimeRange) : "1m";
    const since = subtractRange(new Date(), range);

    await ensureSchema();
    const sql = getSql();

    const rows = (await sql`
      SELECT id, channel_id, subscriber_count, video_count, view_count, created_at
      FROM channel_stats
      WHERE created_at >= ${since.toISOString()}
      ORDER BY created_at ASC;
    `) as ChannelSnapshot[];

    return NextResponse.json({
      success: true,
      range,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
