"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PartyPopper, Users, Star } from "lucide-react"
import { getCloudflareStats } from "@/lib/cloudflare"

export default function MilestonePage() {
    const [mounted, setMounted] = useState(false)
    const [milestone, setMilestone] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)

        async function fetchMilestone() {
            try {
                const stats = await getCloudflareStats('all')
                if (stats.success && stats.data) {
                    const total = stats.data.totals.uniques
                    const k = Math.floor(total / 1000)
                    if (k >= 1) {
                        setMilestone(`${k}k`)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch milestone", error)
            }
        }
        fetchMilestone()
    }, [])

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary overflow-hidden font-sans flex items-center justify-center">
            <div className="noise-overlay" />

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "-2s" }} />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8 animate-bounce-subtle">
                            <PartyPopper className="h-8 w-8 text-yellow-500 mr-2" />
                            <span className="text-yellow-500 font-bold tracking-widest uppercase">Milestone Reached</span>
                        </div>
                    </div>

                    <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-6 transition-all duration-1000 delay-200 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                            {milestone ? `${milestone} Visitors Unlocked!` : "Target Unlocked!"}
                        </span>
                    </h1>

                    <p className={`text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        We've reached a new huge milestone! A big <strong>thank to the entire community</strong> for your support. This journey wouldn't be possible without each and every one of you.
                    </p>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center gap-4">
                            <Star className="h-8 w-8 text-yellow-500" />
                            <div className="font-bold text-lg">Premium Quality</div>
                        </div>
                        <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center gap-4">
                            <PartyPopper className="h-8 w-8 text-pink-500" />
                            <div className="font-bold text-lg">Future Projects</div>
                        </div>
                    </div>

                    <div className={`pt-12 transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-white/10 hover:bg-white/5">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}