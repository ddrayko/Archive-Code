import { Newspaper } from "lucide-react"
import { getNews, getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"
import { NewsCard } from "@/components/news-card"

export const dynamic = "force-dynamic"

export default async function NewsPage() {
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const { data: news = [] } = await getNews()

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Newspaper className="w-3 h-3" />
                        Latest Updates
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase italic">
                        NEWS <span className="text-primary">&</span> ARTICLES.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        Stay informed about the latest projects, experiments, and
                        <span className="text-white"> technological breakthroughs </span>
                        from the vault.
                    </p>
                </div>

                {news.length === 0 ? (
                    <div className="max-w-xl mx-auto v4-glass p-20 rounded-[3rem] border-white/5 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-muted-foreground/30">
                            <Newspaper className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold uppercase italic tracking-tight">Transmission Silent</p>
                            <p className="text-muted-foreground font-medium">No updates have been transmitted yet. Check back soon for new frequencies.</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <NewsCard key={item.id} news={item} />
                        ))}
                    </div>
                )}
            </main >

            <V4Footer />
            <V4Dock />
        </div >
    )
}
