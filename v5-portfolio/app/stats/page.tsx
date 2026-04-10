import { PublicStats } from "@/components/public-stats"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"
import { BarChart3 } from "lucide-react"

export default function StatsPage() {
    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary overflow-x-hidden font-sans">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <div className="relative z-10 container mx-auto px-6 pt-40 pb-32">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                            <BarChart3 className="w-3 h-3" />
                            Live Metrics
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                            PUBLIC <span className="text-primary">STATS.</span>
                        </h1>
                    </div>

                    <div className="v4-glass p-8 md:p-12 rounded-[3rem] border-white/10 shadow-2xl">
                        <PublicStats />
                    </div>
                </div>
            </div>

            <V4Footer />
            <V4Dock />
        </div>
    )
}
