"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { News } from "@/lib/types"
import { createNews, updateNews } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Save, Settings2, Image as ImageIcon } from "lucide-react"

interface NewsFormProps {
    news?: News
    onSuccess?: () => void
}

export function NewsForm({ news, onSuccess }: NewsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        try {
            const result = news ? await updateNews(news.id, formData) : await createNews(formData)

            if (!result.success) {
                setError(result.error || "An error occurred")
                setIsLoading(false)
                return
            }

            router.refresh()
            onSuccess?.()
        } catch (err) {
            setError("An unexpected error occurred")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-8 py-4">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary/80">
                        <Settings2 className="h-4 w-4" />
                        <h3 className="font-bold text-xs uppercase tracking-[0.2em]">News Content</h3>
                    </div>

                    <div className="space-y-4 glass p-6 rounded-3xl border-white/5 bg-white/[0.01]">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                            <Input id="title" name="title" defaultValue={news?.title} required className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Content (Markdown supported)</Label>
                            <Textarea id="content" name="content" defaultValue={news?.content} required rows={10} className="rounded-xl border-white/10 bg-white/5 min-h-[200px] text-sm" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Image URL (Optional)</Label>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <Input id="image_url" name="image_url" type="url" defaultValue={news?.image_url || ""} className="h-10 rounded-xl border-white/10 bg-white/5" placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </section>
            </form>

            <div className="mt-auto pt-6 border-t border-white/5 bg-transparent">
                {error && <p className="text-xs text-destructive font-bold mb-3 text-center mb-4">{error}</p>}
                <Button
                    onClick={() => {
                        if (formRef.current) formRef.current.requestSubmit();
                    }}
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? "Saving..." : (
                        <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {news ? "Update news" : "Publish news"}
                        </span>
                    )}
                </Button>
            </div>
        </div>
    )
}
