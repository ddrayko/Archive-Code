import { Rocket, Sparkles, Timer, ArrowLeft, Code2, Cpu, Globe } from "lucide-react"
import { getV4Mode } from "@/lib/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function V4ComingPage() {
    const { isV4Mode, message, progress } = await getV4Mode()

    if (!isV4Mode) {
        redirect("/")
    }

    const getStatusText = (p: number) => {
        if (p <= 15) return "Starting..."
        if (p <= 35) return "Crafting UI"
        if (p <= 45) return "Create a UI prototype on Figma"
        if (p <= 55) return "Rewriting Code"
        if (p <= 75) return "Optimizing..."
        if (p <= 95) return "Polishing Interface"
        return "Systems Ready"
    }

    return (
        <div className="dark min-h-screen relative flex items-center justify-center overflow-hidden bg-[#030712] font-sans text-foreground px-4 sm:px-6">
            <div className="noise-overlay" />

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: "-3s" }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-float" />
            </div>

            <div className="relative z-10 p-4 sm:p-6 w-full max-w-4xl">
                <div className="text-center space-y-12">
                    <div className="reveal-up">
                        <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse">
                            <Sparkles className="h-4 w-4 mr-2" />
                            The next evolution is near
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none font-display">
                            <span className="block text-white/90">DRAYKO</span>
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent italic inline-block drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                VERSION 4.
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-2xl text-blue-100/60 font-medium max-w-2xl mx-auto leading-relaxed">
                            {message || "We are rebuilding the future of digital experiences from the ground up."}
                        </p>
                    </div>

                    <div className="glass p-6 sm:p-8 md:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border-white/5 backdrop-blur-3xl shadow-2xl space-y-8 sm:space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-white/5">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 text-blue-400">
                                    <Cpu className="h-6 w-6" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">Code Rewrite</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 text-indigo-400">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">Optimizing</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 text-cyan-400">
                                    <Code2 className="h-6 w-6" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">New UI</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div className="text-left">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/70 block mb-1">System Status</span>
                                    <span className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tighter">
                                        {getStatusText(progress || 0)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-white italic">{progress}%</span>
                                </div>
                            </div>

                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 ring-1 ring-white/10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)] relative"
                                    style={{ width: `${progress || 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
