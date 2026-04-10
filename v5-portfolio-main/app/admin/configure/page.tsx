import Link from "next/link"
import { Home, LayoutDashboard, Settings, Wrench } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { AdminConfigureForm } from "@/components/admin-configure-form"
import { getSiteSettings } from "@/lib/actions"
import { normalizeDeveloperName } from "@/lib/site-settings"

export default async function AdminConfigurePage() {
  const { developerName } = await getSiteSettings()
  const initialDeveloperName = normalizeDeveloperName(developerName)

  return (
    <div className="min-h-screen bg-background relative">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none z-0" />

      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
              <p className="font-semibold leading-tight">Configure</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-black flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Global configuration
              </p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Portfolio identity</h1>
              <p className="text-muted-foreground max-w-2xl">
                Choose the name shown across the public site (navbar, footer, legal pages, hero...). Default: {initialDeveloperName}.
              </p>
            </div>
          </div>
        </div>

        <AdminConfigureForm initialDeveloperName={initialDeveloperName} />
      </main>
    </div>
  )
}

