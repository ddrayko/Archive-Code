import { MessageSquare, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

import { getMaintenanceMode } from "@/lib/actions"
import { isLocalRequest } from "@/lib/server-utils"
import { FeedbackForm } from "@/components/feedback-form"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"

export const dynamic = "force-dynamic"

export default async function FeedbackPage() {
  const isLocal = await isLocalRequest()
  if (!isLocal) {
    const { isMaintenance } = await getMaintenanceMode()
    if (isMaintenance) {
      redirect("/maintenance")
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <V4Navbar />

      <main className="relative z-10 pt-32 pb-24 container max-w-4xl mx-auto px-6">
        <section className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Sparkles className="w-3 h-3" />
            Public Feedback
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight italic">
            Your feedback <span className="text-primary">matters</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share your thoughts on the portfolio: what works well, what should be improved, and what you would like to see next.
          </p>
        </section>

        <section className="v4-glass border border-white/10 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Form</p>
              <p className="font-semibold">Tell me what can be improved!</p>
            </div>
          </div>

          <FeedbackForm />
        </section>
      </main>

      <V4Footer />
      <V4Dock />
    </div>
  )
}

