"use client"

import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminStats } from "@/components/admin-stats"

export default function AdminVisitorsPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-20 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <BarChart3 className="h-3 w-3" />
            Visitor Analytics
          </div>
        </div>

        <div className="v4-glass rounded-3xl border-white/10 p-6 sm:p-8">
          <AdminStats />
        </div>
      </main>
    </div>
  )
}
