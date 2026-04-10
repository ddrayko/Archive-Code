import Link from "next/link"
import { ArrowLeft, ArrowRight, Construction, ShieldCheck, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

import { getMaintenanceMode, getSiteSettings } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function MaintenancePage() {
  const [{ isMaintenance, message, progress }, { developerName }] = await Promise.all([
    getMaintenanceMode(),
    getSiteSettings(),
  ])

  if (!isMaintenance) {
    redirect("/")
  }

  const progressValue = Math.min(Math.max(progress ?? 0, 0), 100)
  const displayMessage =
    message ||
    "Le portfolio v4 est momentanément indisponible le temps d'une mise à jour importante. Merci pour votre patience."

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30 selection:text-primary">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 top-10 w-72 h-72 bg-primary/15 blur-[120px]" />
        <div className="absolute right-10 bottom-10 w-80 h-80 bg-secondary/15 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance v5
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground font-bold">Portfolio</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight uppercase">
              Maintenance en cours sur drayko.xyz
            </h1>
          </div>

          <div className="v4-glass border-white/10 rounded-[2.25rem] p-8 md:p-10 space-y-8 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Construction className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black tracking-tight">Mise à jour système en cours</p>
                <p className="text-muted-foreground leading-relaxed">
                  {displayMessage}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                <span>Progression</span>
                <span className="text-primary">{progressValue}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 transition-all duration-700"
                  style={{ width: `${progressValue}%` }}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="https://status.drayko.xyz/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 glass hover:border-primary/60 transition-colors text-sm font-semibold"
            >
              Consulter le statut
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
