import Link from "next/link"
import { Home, LayoutDashboard, MessageSquare } from "lucide-react"

import { getFeedbacks } from "@/lib/actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { AdminFeedbackList } from "@/components/admin-feedback-list"

export const dynamic = "force-dynamic"

export default async function AdminFeedbackPage() {
  const result = await getFeedbacks()
  const feedbacks = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-background relative">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none z-0" />

      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
              <p className="font-semibold leading-tight">Feedback users</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Site
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-10 space-y-8">
        <div className="v4-card p-6 md:p-8 border-white/5 rounded-[2rem]">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground mt-2">
            Review public feedback and mark items as fixed once they are addressed.
          </p>
        </div>

        <AdminFeedbackList initialFeedbacks={feedbacks} />
      </main>
    </div>
  )
}

