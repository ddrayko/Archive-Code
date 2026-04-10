"use client"

import { useState } from "react"
import type { News } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Calendar, ImageOff, Heart, MessageCircle } from "lucide-react"
import Image from "next/image"
import { NewsDialog } from "@/components/news-dialog"
import { DeleteNewsDialog } from "@/components/delete-news-dialog"
import { format } from "date-fns"

interface AdminNewsCardProps {
    news: News
    onDeleted?: (newsId: string) => void
    onUpdated?: () => void
}

export function AdminNewsCard({ news, onDeleted, onUpdated }: AdminNewsCardProps) {
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    return (
        <>
            <div className="group relative rounded-3xl overflow-hidden glass border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col h-full bg-card/20">
                <div className="relative w-full aspect-video bg-muted/20 overflow-hidden border-b border-white/5">
                    {news.image_url ? (
                        <>
                            <Image src={news.image_url} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors duration-500">
                            <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/5 group-hover:border-primary/20 transition-all duration-500">
                                <ImageOff className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/40 transition-colors duration-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(news.created_at), "dd MMM yyyy")}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                    <Heart className="h-3 w-3" />
                                    {news.likes?.length || 0}
                                </div>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold tracking-tight text-foreground/90 line-clamp-1">{news.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                            {news.content}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 mt-auto">
                        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="flex-1 rounded-full border border-white/10 glass hover:bg-white/10 hover:text-foreground font-bold transition-all">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="flex-1 rounded-full shadow-lg shadow-destructive/20 font-bold transition-all">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <NewsDialog open={editOpen} onOpenChange={setEditOpen} news={news} onSuccess={onUpdated} />
            <DeleteNewsDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                newsId={news.id}
                newsTitle={news.title}
                onDeleted={onDeleted}
            />
        </>
    )
}
