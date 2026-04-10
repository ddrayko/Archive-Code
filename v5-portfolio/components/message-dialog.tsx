"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ContactMessage } from "@/lib/types"
import { markMessageAsRead, markMessageAsReplied, deleteMessage } from "@/lib/actions"
import { useState, useEffect } from "react"
import { Mail, Trash2, CheckCircle2, User, Calendar, Clock, Reply, Check } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"

interface MessageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    message: ContactMessage | null
    onSuccess?: () => void
}

export function MessageDialog({ open, onOpenChange, message, onSuccess }: MessageDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    // Auto-mark as read when opened
    useEffect(() => {
        if (open && message && !message.read) {
            // We don't await this to not block UI
            markMessageAsRead(message.id).then(() => {
                if (onSuccess) onSuccess()
            })
        }
    }, [open, message])

    if (!message) return null

    const handleReply = async () => {
        // Open mail client
        window.open(`mailto:${message.email}?subject=Re: ${message.subject}&body=\n\n\n--------------------------------\nOn ${message.created_at}, ${message.name} wrote:\n${message.message}`)
    }

    const handleMarkReplied = async () => {
        setIsLoading(true)
        const result = await markMessageAsReplied(message.id)
        if (result.success) {
            toast.success("Message marked as replied")
            onSuccess?.()
            onOpenChange(false)
        } else {
            toast.error("Failed to update")
        }
        setIsLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this message?")) return

        setIsLoading(true)
        const result = await deleteMessage(message.id)
        if (result.success) {
            toast.success("Message deleted")
            onSuccess?.()
            onOpenChange(false)
        } else {
            toast.error("Failed to delete")
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-[#05080C]/95 backdrop-blur-2xl border border-white/10 p-0 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-white/5 border-b border-white/5 p-6 flex justify-between items-start">
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Message from {message.name}
                        </DialogTitle>
                        <DialogDescription>
                            Received on {format(new Date(message.created_at), "MMM d, yyyy 'at' HH:mm", { locale: enUS })}
                        </DialogDescription>
                    </div>
                    <div className="flex gap-2">
                        {message.replied && (
                            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Replied
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />From</div>
                                <div className="font-medium text-sm truncate" title={message.email}>{message.email}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />Subject</div>
                                <div className="font-medium text-sm truncate" title={message.subject}>{message.subject}</div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 min-h-[150px] text-sm leading-relaxed whitespace-pre-wrap">
                            {message.message}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 sm:justify-between gap-4">
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={isLoading}>
                        <Trash2 className="h-4 w-4 mr-2" />Delete</Button>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReply} className="border-white/10 hover:bg-white/5">
                            <Reply className="h-4 w-4 mr-2" />
                            Reply by Email
                        </Button>

                        {!message.replied && (
                            <Button onClick={handleMarkReplied} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Check className="h-4 w-4 mr-2" />Mark as resolved</Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}