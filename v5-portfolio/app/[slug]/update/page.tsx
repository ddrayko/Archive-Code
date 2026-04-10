import { History, Rocket, Package, Hammer, Archive } from "lucide-react"
import { getProjectBySlug } from "@/lib/actions"
import { notFound, redirect } from "next/navigation"
import { ChangelogList } from "@/components/changelog-list"
import { getMaintenanceMode } from "@/lib/actions"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"

export const dynamic = "force-dynamic"

interface ProjectUpdatePageProps {
    params: {
        slug: string
    }
}

export default async function ProjectUpdatePage({ params }: ProjectUpdatePageProps) {
    const { slug } = await params

    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const project = await getProjectBySlug(slug)

    if (!project) {
        notFound()
    }

    if (project.slug === "my-portfolio-this-web-site" || project.title === "My portfolio (this web site)") {
        redirect("/update")
    }

    const changelog = project.changelog || []

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-32 container max-w-4xl mx-auto px-6 space-y-12">
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                        <History className="w-3 h-3" />
                        Project Updates
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        {project.title}
                    </h1>
                </div>

                {project.is_archived && (
                    <div className="v4-glass p-8 rounded-[2rem] border-indigo-500/20 bg-indigo-500/5 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Archive className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight text-indigo-300">Project Archived</h3>
                            <p className="text-sm text-indigo-200/60 leading-relaxed">This project has reached its final stable state. No further updates are planned.</p>
                        </div>
                    </div>
                )}

                <section>
                    <div className="v4-glass p-10 md:p-16 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Package className="h-40 w-40" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                                    {project.is_archived ? "Legacy Archive" : project.in_development ? "Development Phase" : project.is_completed ? "Stable Release" : "Active Project"}
                                </div>
                                {project.in_development && (
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                        <Hammer className="h-3 w-3" />
                                        {project.development_progress}% Complete
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-muted-foreground/70 font-medium text-lg leading-relaxed max-w-2xl">
                                    Tracing the evolution and milestone releases of the project environment.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 rounded-xl v4-glass border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="text-primary font-bold tracking-widest text-xs uppercase">Lifecycle</div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic">VERSION LOGS</h2>
                    </div>

                    {changelog.length > 0 ? (
                        <ChangelogList entries={changelog} />
                    ) : (
                        <div className="v4-glass p-16 rounded-[2.5rem] border-white/5 text-center space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 mx-auto flex items-center justify-center">
                                <History className="h-10 w-10 text-primary/40" />
                            </div>
                            <div className="space-y-3 max-w-md mx-auto">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">Trace Initializing</h3>
                                <p className="text-muted-foreground/60 text-sm leading-relaxed">
                                    The update tracking system was recently integrated. While this project is active, its historical logs are currently being synchronized.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <V4Footer />
            <V4Dock />
        </div>
    )
}