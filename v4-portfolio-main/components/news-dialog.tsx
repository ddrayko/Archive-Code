"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewsForm } from "@/components/news-form"
import type { News } from "@/lib/types"

interface NewsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    news?: News
    onSuccess?: () => void
}

export function NewsDialog({ open, onOpenChange, news, onSuccess }: NewsDialogProps) {
    const handleSuccess = () => {
        onOpenChange(false)
        onSuccess?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden bg-[#05080C]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem]">
                <div className="px-8 pt-8 pb-4 bg-[#05080C]/40 backdrop-blur-md border-b border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tight text-white">{news ? "Edit news" : "Create news"}</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground">
                            {news ? "Update the content of your news." : "Share a new update with your visitors."}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="flex-1 overflow-hidden px-8 pb-8">
                    <NewsForm news={news} onSuccess={handleSuccess} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
