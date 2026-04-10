import Link from "next/link"
import { ChevronLeft, User, Heart, Sparkles, Code2, Brain, Globe, Laptop, Command } from "lucide-react"
import { getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"
import { Github } from 'lucide-react';
import { getSiteSettings } from "@/lib/actions"
import { normalizeDeveloperName } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }
    const { developerName } = await getSiteSettings()
    const displayName = normalizeDeveloperName(developerName)
    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <User className="w-3 h-3" />
                        About the Architect
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase italic">
                        BEHIND THE <span className="text-primary">SYSTEM.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        I'm {displayName}, a developer dedicated to pushing the boundaries of
                        <span className="text-white"> web performance </span> and
                        <span className="text-primary italic"> creative engineering</span>.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 v4-glass p-8 md:p-16 rounded-[2.5rem] border-white/10 space-y-16 shadow-2xl relative overflow-hidden">
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 text-primary">
                                <Sparkles className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">The Genesis</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight uppercase">Crafting Digital Realities</h2>
                            <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                                <p>
                                    My journey into the digital realm began with a simple question: "How does this work?" From deconstructing game assets to architecting complex cloud infrastructures, that curiosity has been the driving force of my career.
                                </p>
                                <p>
                                    I view development as a form of architecture. It's not just about building something that stands—it's about building something that inspires. Every project is an opportunity to refine my craft and deliver an experience that feels as good as it looks.
                                </p>
                            </div>
                        </section>

                        <section className="grid md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                            {[
                                { title: "User Experience", desc: "If it's not intuitive, it's not complete.", icon: Laptop },
                                { title: "Refined Design", desc: "Obsessive attention to every micro-interaction.", icon: Sparkles },
                            ].map((p, i) => (
                                <div key={i} className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <p.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic">{p.title}</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{p.desc}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="v4-glass p-10 rounded-[2.5rem] border-white/10 space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Connectivity</h4>
                            <div className="space-y-6">
                                <a href="https://github.com/GraphStats" target="_blank" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-primary/20 transition-all group">
                                    <span className="font-bold uppercase tracking-widest text-xs">GitHub</span>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <Github className="w-4 h-4" />
                                    </div>
                                </a>
                                <Link href="/contact" className="flex items-center justify-center w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                                    Start Collaboration
                                </Link>
                            </div>
                        </div>

                        <div className="p-10 rounded-[2.5rem] border border-white/5 italic text-xl text-muted-foreground font-medium bg-gradient-to-br from-white/5 to-transparent">
                            "Innovation is the child of curiosity and the sibling of obsession."
                        </div>
                    </div>
                </div>
            </main >

            <V4Footer />
            <V4Dock />
        </div >
    )
}
