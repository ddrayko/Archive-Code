import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ForbiddenPage() {
  const headersList = await headers()
  const blockedIp = headersList.get("x-blocked-ip") || headersList.get("x-forwarded-for") || "unknown"

  return (
    <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 sm:px-6">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl v4-glass rounded-[2.5rem] p-8 sm:p-12 border border-white/10 shadow-2xl">
        <div className="space-y-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">Error 403</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
            Access denied
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            The admin panel is restricted to admins. This IP is not authorized.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold">
            IP: <span className="text-primary">{blockedIp}</span>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-2xl">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl glass border-white/10">
              <Link href="/contact">Contact admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
