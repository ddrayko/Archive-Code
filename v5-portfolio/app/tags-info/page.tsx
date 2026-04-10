import Link from "next/link"
import { Tags, Rocket, CheckCircle2, Archive, Timer, Code2, AlertCircle, Play, Pause } from "lucide-react"
import { getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"

export const dynamic = "force-dynamic"

export default async function TagsInfoPage() {
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const tagCategories = [
        {
            id: "active",
            name: "Active",
            icon: Rocket,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            iconColor: "text-blue-400",
            description: "The project is in a stable, active release.",
            details: [
                "The project is fully functional and in a stable release",
                "Regular updates are still delivered",
                "New features may be added",
                "The project is actively maintained and improved"
            ]
        },
        {
            id: "in-development",
            name: "In Development",
            icon: Play,
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
            iconColor: "text-green-400",
            description: "The project is currently in active development with steady progress.",
            details: [
                "The project is under active construction",
                "Regular updates are delivered",
                "The progress bar keeps moving",
                "The project will reach a stable release soon"
            ]
        },
        {
            id: "paused",
            name: "Paused",
            icon: Pause,
            color: "from-orange-500 to-amber-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
            iconColor: "text-orange-400",
            description: "Project development is temporarily paused.",
            details: [
                "The project is under construction but temporarily suspended",
                "No updates are being delivered for now",
                "The progress bar is frozen",
                "Development will resume later"
            ]
        },
        {
            id: "completed",
            name: "Completed",
            icon: CheckCircle2,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20",
            iconColor: "text-emerald-400",
            description: "This tag means the project is fully completed and functional.",
            details: [
                "The project is fully functional and stable",
                "All planned features have been implemented",
                "The project will no longer receive major or minor updates",
                "Bug fixes and security updates only when necessary"
            ]
        },
        {
            id: "archived",
            name: "Archived",
            icon: Archive,
            color: "from-gray-500 to-slate-500",
            bgColor: "bg-gray-500/10",
            borderColor: "border-gray-500/20",
            iconColor: "text-gray-400",
            description: "This tag indicates the project has been archived and is no longer maintained.",
            details: [
                "The project will no longer receive updates",
                "The project is not finished and is incomplete",
                "Some features may not be operational",
                "The source code remains available for reference or fork (if possible)"
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-32 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                        <Tags className="w-3 h-3" />
                        Project Status Guide
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        UNDERSTANDING <span className="text-primary">TAGS.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Each project is labeled with a <span className="text-primary font-bold">status tag</span> to keep you informed about its current state.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-6">
                    {tagCategories.map((tag, index) => {
                        const IconComponent = tag.icon
                        return (
                            <div
                                key={tag.id}
                                className="v4-glass p-8 md:p-10 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
                            >
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tag.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />

                                <div className="relative z-10">
                                    <div className="flex items-start gap-6 mb-8">
                                        <div className={`w-16 h-16 rounded-2xl ${tag.bgColor} border ${tag.borderColor} flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-xl`}>
                                            <IconComponent className={`h-8 w-8 ${tag.iconColor}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-black tracking-tight mb-3 uppercase italic">{tag.name}</h2>
                                            <p className="text-lg text-muted-foreground/70 font-medium leading-relaxed">
                                                {tag.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pl-[88px]">
                                        {tag.details.map((detail, idx) => (
                                            <div key={idx} className="flex items-start gap-3 group/item">
                                                <div className={`w-2 h-2 rounded-full ${tag.bgColor} border ${tag.borderColor} mt-1.5 flex-shrink-0 group-hover/item:scale-150 transition-transform`} />
                                                <p className="text-muted-foreground/60 font-medium leading-relaxed text-sm">
                                                    {detail}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="max-w-4xl mx-auto mt-16">
                    <div className="v4-glass p-8 rounded-[2rem] border-white/5 bg-primary/5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                                <AlertCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-black uppercase tracking-tight">Good to know</h3>
                                <p className="text-muted-foreground/70 font-medium leading-relaxed">
                                    Tags are updated regularly to reflect each project's current state.
                                    If you have questions about a specific project, feel free to <Link href="/contact" className="text-primary hover:underline font-bold">contact me</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-16 text-center">
                    <div className="v4-glass p-12 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Rocket className="h-12 w-12 text-primary mx-auto animate-pulse relative z-10" />
                        <h3 className="text-3xl font-black tracking-tight uppercase italic relative z-10">Ready to explore my projects?</h3>
                        <p className="text-lg text-muted-foreground/70 font-medium max-w-xl mx-auto relative z-10">
                            Discover all my projects and their current statuses.
                        </p>
                        <div className="pt-4 relative z-10">
                            <Link
                                href="/#projects"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20"
                            >
                                <Code2 className="h-4 w-4" />
                                View projects
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <V4Footer />
            <V4Dock />
        </div>
    )
}