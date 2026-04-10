'use client'

import { useEffect } from 'react'
import { RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { useSiteSettings } from '@/components/site-settings-provider'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const { developerName } = useSiteSettings()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#020714] text-[#f9fafb] font-sans flex items-center justify-center overflow-hidden relative selection:bg-red-500/30 selection:text-red-500">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(2,8,23,0)_0%,rgba(2,6,23,0.85)_58%,rgba(1,3,10,1)_100%)]" />
                <div className="absolute top-[-18%] left-[-18%] w-[65vw] h-[65vw] bg-red-700/18 rounded-full blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-20%] right-[-18%] w-[60vw] h-[60vw] bg-orange-600/14 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: "-2s" }} />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(100,0,18,0.22)_0%,rgba(4,12,40,0.08)_40%,rgba(6,16,48,0.08)_60%,rgba(79,22,10,0.18)_100%)]" />
            </div>

            <div className="noise-overlay opacity-10" />

            <div className="container relative z-10 px-6 max-w-xl text-center space-y-10 animate-shake">
                <div className="space-y-3">
                    <div className="text-[clamp(7rem,20vw,10rem)] font-black leading-none tracking-tighter font-display bg-gradient-to-b from-red-400 via-red-500 to-red-900 bg-clip-text text-transparent drop-shadow-[0_10px_32px_rgba(239,68,68,0.4)]">
                        500
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display uppercase italic text-white">
                        UNSTABLE <span className="text-red-500">CORE</span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-lg mx-auto font-medium leading-relaxed">
                        The {developerName} portfolio server is experiencing heavy load. Access to my projects is temporarily suspended for corrective maintenance.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <button
                        onClick={reset}
                        className="group relative inline-flex min-w-[230px] items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-b from-red-500 to-red-700 text-white font-black uppercase tracking-[0.14em] text-sm rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_12px_40px_-14px_rgba(239,68,68,0.9)] hover:shadow-[0_18px_48px_-12px_rgba(239,68,68,0.95)]"
                    >
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Restart System
                    </button>

                    <Link
                        href="/"
                        className="group inline-flex min-w-[230px] items-center justify-center gap-2.5 px-8 py-4 bg-white/[0.04] border border-white/10 text-slate-200 font-black uppercase tracking-[0.14em] text-sm rounded-full hover:bg-white/[0.08] transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Central Hub
                    </Link>
                </div>

                <div className="flex justify-center flex-col items-center gap-4 opacity-70">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Running diagnostics...</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
