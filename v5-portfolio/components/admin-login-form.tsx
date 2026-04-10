"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Command, ChevronLeft, ShieldCheck } from "lucide-react"
import { loginAdmin } from "@/lib/auth"
import Link from "next/link"

export default function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await loginAdmin(email, password)

    if (result && !result.success) {
      setError(result.error || "Failed to create admin")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative selection:bg-primary/30 selection:text-primary overflow-hidden font-sans">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none z-0" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group z-50">
        <div className="p-2 rounded-xl glass border-white/10 group-hover:border-primary/50 transition-all">
          <ChevronLeft className="h-4 w-4" />
        </div>
        Back to Portfolio
      </Link>

      <div className="w-full max-w-md relative z-10 px-6 animate-scale-in">
        <div className="glass bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950/70 p-10 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl shadow-black/40">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight font-display text-gradient">ADMIN PORTAL</h2>
              <p className="text-muted-foreground font-medium text-sm">Secure authorization required</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-2xl h-14 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                  placeholder="admin@drayko.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="rounded-2xl h-14 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3 animate-shake">
                <ShieldCheck className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold tracking-tight transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Authorize Session"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-medium pt-4">
            System protected by end-to-end encryption.
          </p>
        </div>
      </div>
    </div>
  )
}
