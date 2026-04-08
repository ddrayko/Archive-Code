import Link from "next/link"
import { AlertTriangle, ArrowUpRight, CheckCircle2, Home } from "lucide-react"
import { getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"
import { getActiveIncident, getIncidentLevel, getStatusSummary } from "@/lib/status-summary"

export const dynamic = "force-dynamic"

function formatDate(input?: string) {
  if (!input) return null
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function StatusPage() {
  const isLocal = await isLocalRequest()
  if (!isLocal) {
    const { isMaintenance } = await getMaintenanceMode()
    if (isMaintenance) {
      redirect("/maintenance")
    }
  }

  const summary = await getStatusSummary()
  const incident = getActiveIncident(summary)
  const incidentLevel = getIncidentLevel(incident)
  const incidentDate = formatDate(incident?.last_update_at)
  const impactedComponents = (incident?.affected_components ?? []).filter((component) => {
    const state = component.current_status?.toLowerCase()
    return Boolean(state && state !== "operational" && state !== "up")
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <V4Navbar />

      <main className="relative z-10 pt-40 pb-24 container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <AlertTriangle className="w-3 h-3" />
            Service Status
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase italic">
            {incidentLevel === "outage" ? (
              <>
                OUTAGE <span className="text-red-400">NOW</span>
              </>
            ) : incidentLevel === "degraded" ? (
              <>
                DEGRADED <span className="text-orange-400">PERFORMANCE</span>
              </>
            ) : (
              <>
                ALL <span className="text-primary">SYSTEMS OPERATIONAL</span>
              </>
            )}
          </h1>

          <div className="v4-glass p-8 md:p-10 rounded-[2rem] border-white/10 space-y-6">
            {incidentLevel !== "operational" && incident ? (
              <>
                <p className="text-2xl font-black tracking-tight">{incident.name}</p>
                {incident.last_update_message ? (
                  <p className="text-muted-foreground text-lg leading-relaxed">{incident.last_update_message}</p>
                ) : null}

                {impactedComponents.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Impacted services</p>
                    <div className="flex flex-wrap gap-2">
                      {impactedComponents.map((component) => (
                        <span
                          key={component.id}
                          className="inline-flex items-center rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-200"
                        >
                          {component.group_name ? `${component.group_name} / ${component.name}` : component.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {incidentDate ? (
                  <p className="text-sm text-muted-foreground">Last Update: {incidentDate}</p>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={incident.url || summary?.page_url || "https://status.drayko.xyz/"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 h-12 text-xs font-black uppercase tracking-widest text-primary-foreground hover:scale-[1.02] transition-transform"
                  >
                    View on Incident
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 glass px-6 h-12 text-xs font-black uppercase tracking-widest hover:bg-white/5"
                  >
                    <Home className="w-4 h-4" />
                    Back Home
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-300 text-xs font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  No active incidents
                </div>
                <p className="text-muted-foreground text-lg">All services listed on the status page are operational.</p>
                <Link
                  href={summary?.page_url || "https://status.drayko.xyz/"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 glass px-6 h-12 text-xs font-black uppercase tracking-widest hover:bg-white/5"
                >
                  Open Status Page
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <V4Footer />
      <V4Dock />
    </div>
  )
}
