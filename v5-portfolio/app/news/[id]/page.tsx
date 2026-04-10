import { Newspaper, ArrowLeft, Calendar, User } from "lucide-react"
import { getNewsById, getComments, getMaintenanceMode } from "@/lib/actions"
import { redirect, notFound } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"
import { NewsInteraction } from "@/components/news-interaction"
import { NewsComments } from "@/components/news-comments"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params
    const result = await getNewsById(id)

    if (!result.success || !result.news) {
        return {
            title: "News Not Found",
            description: "The requested article does not exist.",
        }
    }

    const news = result.news
    const description = (news.content || "").slice(0, 160)

    return {
        title: `${news.title} | News`,
        description,
        openGraph: {
            title: news.title,
            description,
            type: "article",
            images: news.image_url ? [{ url: news.image_url }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: news.title,
            description,
            images: news.image_url ? [news.image_url] : [],
        },
    }
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const [newsResult, commentsResult] = await Promise.all([
        getNewsById(id),
        getComments(id)
    ])

    if (!newsResult.success || !newsResult.news) {
        notFound()
    }

    const news = newsResult.news
    const comments = commentsResult.data || []

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-12 mb-16">
                    <Link href="/news" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to frequencies
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(news.created_at), "dd MMMM yyyy", { locale: enUS })}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase italic">
                            {news.title}
                        </h1>
                    </div>

                    {news.image_url && (
                        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden v4-glass border-white/10 shadow-2xl">
                            <Image src={news.image_url} alt={news.title} fill className="object-cover" priority />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05080C] via-transparent to-transparent opacity-40" />
                        </div>
                    )}

                    <div className="v4-glass p-8 md:p-16 rounded-[3rem] border-white/10 shadow-2xl space-y-12">
                        <div className="prose prose-invert prose-p:text-xl prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-white prose-headings:text-white max-w-none">
                            {news.content.split('\n').map((paragraph, i) => (
                                <p key={i} className="mb-6 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <NewsInteraction
                            newsId={news.id}
                            initialLikes={news.likes}
                            commentCount={comments.length}
                        />
                    </div>

                    <NewsComments
                        newsId={news.id}
                        initialComments={comments}
                    />
                </div>
            </main >

            <V4Footer />
            <V4Dock />
        </div >
    )
}
