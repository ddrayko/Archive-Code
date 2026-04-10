"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Save, History, ChevronUp, ChevronDown } from "lucide-react"
import { getFirestoreClient } from "@/lib/firebase/client"
import { doc, getDoc, setDoc } from "firebase/firestore"
import type { SiteUpdate, ChangelogEntry } from "@/lib/types"
import { toast } from "sonner"

interface UpdateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UpdateDialog({ open, onOpenChange, onSuccess }: UpdateDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [updateData, setUpdateData] = useState<SiteUpdate>({
        next_update_date: "",
        no_update_planned: false,
        planned_features: [],
        changelog: [],
        updated_at: new Date().toISOString()
    })

    useEffect(() => {
        if (open) {
            fetchUpdateData()
        }
    }, [open])

    const fetchUpdateData = async () => {
        const db = getFirestoreClient()
        const docRef = doc(db, "update-p", "main")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            setUpdateData(prev => ({
                ...prev,
                ...data,
                planned_features: data.planned_features || [],
                changelog: data.changelog || []
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const db = getFirestoreClient()
            await setDoc(doc(db, "update-p", "main"), {
                ...updateData,
                updated_at: new Date().toISOString()
            })
            toast.success("Site update info saved successfully")
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            console.error("Error saving update info:", error)
            toast.error("Failed to save update info")
        } finally {
            setIsLoading(false)
        }
    }

    const addChangelogEntry = () => {
        const newEntry: ChangelogEntry = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            version: "",
            date: new Date().toISOString().split('T')[0],
            changes: [""]
        }
        setUpdateData({
            ...updateData,
            changelog: [newEntry, ...updateData.changelog]
        })
    }

    const removeChangelogEntry = (id: string) => {
        setUpdateData({
            ...updateData,
            changelog: updateData.changelog.filter(entry => entry.id !== id)
        })
    }

    const updateEntry = (id: string, field: keyof ChangelogEntry, value: any) => {
        setUpdateData({
            ...updateData,
            changelog: updateData.changelog.map(entry =>
                entry.id === id ? { ...entry, [field]: value } : entry
            )
        })
    }

    const addChange = (entryId: string) => {
        setUpdateData({
            ...updateData,
            changelog: updateData.changelog.map(entry =>
                entry.id === entryId ? { ...entry, changes: [...entry.changes, ""] } : entry
            )
        })
    }

    const updateChange = (entryId: string, index: number, value: string) => {
        setUpdateData({
            ...updateData,
            changelog: updateData.changelog.map(entry =>
                entry.id === entryId ? {
                    ...entry,
                    changes: entry.changes.map((c, i) => i === index ? value : c)
                } : entry
            )
        })
    }

    const removeChange = (entryId: string, index: number) => {
        setUpdateData({
            ...updateData,
            changelog: updateData.changelog.map(entry =>
                entry.id === entryId ? {
                    ...entry,
                    changes: entry.changes.filter((_, i) => i !== index)
                } : entry
            )
        })
    }

    const moveEntryUp = (index: number) => {
        if (index === 0) return
        const newChangelog = [...updateData.changelog]
        const temp = newChangelog[index]
        newChangelog[index] = newChangelog[index - 1]
        newChangelog[index - 1] = temp
        setUpdateData({ ...updateData, changelog: newChangelog })
    }

    const moveEntryDown = (index: number) => {
        if (index === updateData.changelog.length - 1) return
        const newChangelog = [...updateData.changelog]
        const temp = newChangelog[index]
        newChangelog[index] = newChangelog[index + 1]
        newChangelog[index + 1] = temp
        setUpdateData({ ...updateData, changelog: newChangelog })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[1200px] sm:!max-w-[1200px] !w-[95vw] !h-[92vh] p-0 overflow-hidden glass border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl flex flex-col gap-0">
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 md:p-14 space-y-12">
                        <DialogHeader className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                    <History className="h-8 w-8" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <DialogTitle className="text-4xl font-black tracking-tight font-display text-gradient">SYSTEM EVOLUTION</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium text-lg">
                                        Architect the future iterations of the digital ecosystem.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-12">
                            {/* Timing Section */}
                            <div className="grid gap-8 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <History className="h-24 w-24" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold tracking-tight">Deployment Window</h3>
                                        <p className="text-muted-foreground font-medium">Synchronize the countdown for the next major release.</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:border-primary/20 transition-all">
                                        <Checkbox
                                            id="no_update"
                                            checked={updateData.no_update_planned}
                                            onCheckedChange={(checked) => setUpdateData({ ...updateData, no_update_planned: !!checked })}
                                            className="h-5 w-5 rounded-md border-white/20 data-[state=checked]:bg-primary shrink-0"
                                        />
                                        <Label htmlFor="no_update" className="text-[10px] md:text-sm font-bold cursor-pointer pr-2 uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">No plans</Label>
                                    </div>
                                </div>

                                {!updateData.no_update_planned && (
                                    <div className="space-y-4 pt-6 mt-6 border-t border-white/5 relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <History className="h-4 w-4 text-primary/70" />
                                            <Label className="text-xs uppercase tracking-widest font-black text-primary/70">Scheduled Release Date</Label>
                                        </div>
                                        <div className="relative group/date">
                                            <Input
                                                type="datetime-local"
                                                value={updateData.next_update_date || ""}
                                                onChange={(e) => setUpdateData({ ...updateData, next_update_date: e.target.value })}
                                                className="rounded-2xl border-white/10 glass h-16 text-xl font-bold px-6 focus:ring-primary shadow-2xl transition-all bg-white/5"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover/date:opacity-100 pointer-events-none transition-opacity" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic ml-1 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            Enables the countdown on the public "Update" page.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Changelog Section */}
                            <div className="space-y-8">
                                <div className="flex items-end justify-between px-2">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase font-display">Historical Records</h3>
                                        <p className="text-muted-foreground font-medium">Document the transformation history of the platform.</p>
                                    </div>
                                    <Button type="button" onClick={addChangelogEntry} variant="outline" size="lg" className="rounded-2xl glass border-white/10 hover:bg-primary hover:text-primary-foreground transition-all px-8 h-14 font-bold shadow-xl shadow-primary/10">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Initialize Version
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {updateData.changelog.map((entry, index) => (
                                        <div key={entry.id} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8 relative group hover:bg-white/[0.04] transition-all duration-500">
                                            {/* Control Bar */}
                                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => moveEntryUp(index)}
                                                            disabled={index === 0}
                                                            className="text-muted-foreground hover:text-primary transition-all rounded-xl h-10 w-10 disabled:opacity-30 bg-white/5"
                                                        >
                                                            <ChevronUp className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => moveEntryDown(index)}
                                                            disabled={index === updateData.changelog.length - 1}
                                                            className="text-muted-foreground hover:text-primary transition-all rounded-xl h-10 w-10 disabled:opacity-30 bg-white/5"
                                                        >
                                                            <ChevronDown className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-0.5 ml-2">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Sequence</p>
                                                        <p className="text-xl md:text-3xl font-black font-display tracking-widest text-primary/80">#{updateData.changelog.length - index}</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={() => removeChangelogEntry(entry.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-all rounded-2xl h-12 px-6 bg-white/5 hover:bg-destructive/10 border border-transparent hover:border-destructive/20 font-bold"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Version
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <Label className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">Version Title</Label>
                                                    <Input
                                                        placeholder="v4.0.0"
                                                        value={entry.version}
                                                        onChange={(e) => updateEntry(entry.id, "version", e.target.value)}
                                                        className="rounded-2xl border-white/5 glass h-14 text-xl font-bold px-6 focus:ring-primary"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">Release Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={entry.date}
                                                        onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                                                        className="rounded-2xl border-white/5 glass h-14 text-lg font-medium px-6 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <Label className="text-xs uppercase tracking-[0.2em] font-black text-primary/80">Innovation Breakdown</Label>
                                                    <Button type="button" onClick={() => addChange(entry.id)} variant="link" size="sm" className="h-auto p-0 text-primary hover:text-primary/70 font-black text-xs uppercase tracking-widest transition-all">
                                                        Add Changelog Point
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {entry.changes.map((change, idx) => (
                                                        <div key={idx} className="flex gap-4">
                                                            <Input
                                                                value={change}
                                                                onChange={(e) => updateChange(entry.id, idx, e.target.value)}
                                                                placeholder="Implemented new features..."
                                                                className="rounded-2xl border-white/5 bg-white/5 h-14 px-6 font-medium focus:bg-white/10 transition-all border-l-4 border-l-primary/30"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeChange(entry.id, idx)}
                                                                className="h-14 w-14 text-muted-foreground hover:text-destructive rounded-2xl bg-white/5 hover:bg-destructive/10 transition-all shrink-0"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 md:p-10 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
                        <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-6">
                            <p className="text-sm text-muted-foreground font-medium hidden md:block">
                                Modifications will be synchronized with the database record.
                            </p>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-14 px-8 font-bold text-muted-foreground">
                                    Discard Changes
                                </Button>
                                <Button type="submit" disabled={isLoading} className="rounded-2xl h-14 px-12 bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-sm grow sm:grow-0">
                                    <Save className="mr-3 h-5 w-5" />
                                    {isLoading ? "Synchronizing..." : "Commit Updates"}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
