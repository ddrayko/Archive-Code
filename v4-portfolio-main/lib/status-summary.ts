export interface StatusComponent {
  id: string
  name: string
  group_name?: string
  current_status?: string
}

export interface StatusIncident {
  id: string
  name: string
  status?: string
  url?: string
  current_worst_impact?: string
  affected_components?: StatusComponent[]
  last_update_at?: string
  last_update_message?: string
}

export interface StatusSummary {
  page_title?: string
  page_url?: string
  ongoing_incidents?: StatusIncident[]
  in_progress_maintenances?: Array<{
    id?: string
    name?: string
    status?: string
    url?: string
  }>
  scheduled_maintenances?: Array<{
    id?: string
    name?: string
    status?: string
    url?: string
  }>
}

export type SystemStatusLevel = "operational" | "degraded" | "outage"

const STATUS_SUMMARY_URL = "https://status.drayko.xyz/api/v1/summary"
const STATUS_SUMMARY_TIMEOUT_MS = 600

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, timeoutId }
}

export async function getStatusSummary(): Promise<StatusSummary | null> {
  const { signal, timeoutId } = createTimeoutSignal(STATUS_SUMMARY_TIMEOUT_MS)

  try {
    const response = await fetch(STATUS_SUMMARY_URL, {
      signal,
      cache: "force-cache",
      next: { revalidate: 30 },
    })
    if (!response.ok) return null
    return (await response.json()) as StatusSummary
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      console.error("status summary fetch failed:", error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

function normalizeStatus(value?: string): string {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function getStatusSeverity(status?: string): 0 | 1 | 2 {
  const key = normalizeStatus(status)
  if (!key || key === "operational" || key === "up") return 0
  if (
    key === "full_outage" ||
    key === "major_outage" ||
    key === "outage" ||
    key === "down"
  ) {
    return 2
  }
  if (
    key === "degraded_performance" ||
    key === "partial_outage" ||
    key === "minor_outage" ||
    key.includes("degraded") ||
    key.includes("partial") ||
    key.includes("minor")
  ) {
    return 1
  }
  return 1
}

function isDegradedOrDown(status?: string): boolean {
  return getStatusSeverity(status) > 0
}

export function getActiveIncident(summary: StatusSummary | null): StatusIncident | null {
  if (!summary?.ongoing_incidents?.length) return null

  return (
    summary.ongoing_incidents.find((incident) => {
      if (isDegradedOrDown(incident.status)) return true
      return (incident.affected_components ?? []).some((component) =>
        isDegradedOrDown(component.current_status)
      )
    }) ?? null
  )
}

export function getIncidentLevel(incident: StatusIncident | null): SystemStatusLevel {
  if (!incident) return "operational"

  let maxSeverity: 0 | 1 | 2 = 0
  maxSeverity = Math.max(maxSeverity, getStatusSeverity(incident.current_worst_impact)) as 0 | 1 | 2
  maxSeverity = Math.max(maxSeverity, getStatusSeverity(incident.status)) as 0 | 1 | 2

  for (const component of incident.affected_components ?? []) {
    maxSeverity = Math.max(maxSeverity, getStatusSeverity(component.current_status)) as 0 | 1 | 2
  }

  if (maxSeverity === 2) return "outage"
  if (maxSeverity === 1) return "degraded"
  return "degraded"
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function getIncidentProjectMarkers(incident: StatusIncident | null): string[] {
  if (!incident) return []

  const markers = new Set<string>()

  for (const component of incident.affected_components ?? []) {
    const platformName = normalizeText(component.name || "")
    if (!platformName) continue

    // Keep the full platform name (e.g. "clerk", "cloudflare workers").
    markers.add(platformName)

    // Also keep specific tokens from the platform name only.
    const tokens = platformName
      .split(" ")
      .filter((token) => token.length >= 4)
    for (const token of tokens) markers.add(token)

    // Keep group_name as a strict marker (project identity), without tokenizing it.
    const groupName = normalizeText(component.group_name || "")
    if (groupName) {
      markers.add(groupName)
    }
  }

  return Array.from(markers)
}
