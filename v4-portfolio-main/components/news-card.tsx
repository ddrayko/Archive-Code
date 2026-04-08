"use client"

import type { News } from "@/lib/types"
import { Calendar, Heart, ArrowRight, ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

interface NewsCardProps {
    news: News
}

export function NewsCard({ news }: NewsCardProps) {
    return (
        <Link href={`/news/${news.id}`} className="group relative rounded-[2.5rem] overflow-hidden v4-glass border-white/5 hover:border-primary/50 transition-all duration-500 flex flex-col h-full bg-white/[0.02]">
            <div className="relative w-full aspect-[16/10] bg-muted/20 overflow-hidden border-b border-white/5">
                {news.image_url ? (
                    <>
                        <Image src={news.image_url} alt={news.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05080C] via-transparent to-transparent opacity-60" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors duration-500">
                        <div className="p-6 rounded-3xl border border-dashed border-white/10 bg-white/5 group-hover:border-primary/20 transition-all duration-500">
                            <ImageOff className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary/40 transition-colors duration-500" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 space-y-4 flex-1 flex flex-col">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(news.created_at), "dd MMMM yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60">
                            <Heart className="h-3.5 w-3.5" />
                            {news.likes?.length || 0}
                        </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors line-clamp-2 uppercase italic">
                        {news.title}
                    </h3>
                    <p className="text-muted-foreground font-medium line-clamp-3 leading-relaxed">
                        {news.content}
                    </p>
                </div>

                <div className="pt-6 mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary group-hover:gap-4 transition-all">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </Link>
    )
}
