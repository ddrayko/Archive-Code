"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Save, X } from "lucide-react"
import { getFirestoreClient } from "@/lib/firebase/client"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { toast } from "sonner"

interface BadgeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function BadgeDialog({ open, onOpenChange, onSuccess }: BadgeDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [text, setText] = useState("")

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        const db = getFirestoreClient()
        const docRef = doc(db, "update-p", "main")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            setText(docSnap.data().latest_update_text || "")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const db = getFirestoreClient()
            const docRef = doc(db, "update-p", "main")
            const docSnap = await getDoc(docRef)

            const currentData = docSnap.exists() ? docSnap.data() : {}

            await setDoc(docRef, {
                ...currentData,
                latest_update_text: text,
                updated_at: new Date().toISOString()
            })

            toast.success("Hero badge updated successfully")
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            console.error("Error saving badge:", error)
            toast.error("Failed to update badge")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden glass border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="p-10 space-y-8">
                        <DialogHeader className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <DialogTitle className="text-3xl font-black tracking-tight font-display text-gradient uppercase">Hero Communication</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium">
                                        Update the headline that appears in the landing page badge.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4">
                                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70 ml-1">Badge Headline Content</Label>
                                <Input
                                    placeholder="e.g. New interface v3 is out! 🚀"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="rounded-2xl border-white/10 glass h-16 text-xl font-bold px-6 focus:ring-primary shadow-inner bg-white/5"
                                />
                                <div className="flex items-start gap-3 px-2 pt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                        Visible on the homepage hero section. Keep it short and impactful for better engagement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                        <div className="flex gap-4 w-full sm:w-auto ml-auto">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-12 px-6 font-bold text-muted-foreground hover:bg-white/5">
                                Discard
                            </Button>
                            <Button type="submit" disabled={isLoading} className="rounded-xl h-12 px-10 bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-widest text-[10px]">
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? "Updating..." : "Push Release"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
