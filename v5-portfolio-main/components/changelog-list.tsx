"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import type { ChangelogEntry } from "@/lib/types"

interface ChangelogListProps {
    entries: ChangelogEntry[]
}

export function ChangelogList({ entries }: ChangelogListProps) {
    const [mounted, setMounted] = useState(false)
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setMounted(true)
        setNow(new Date())
    }, [])

    if (!mounted || !now) {
        return (
            <div className="space-y-8">
                {entries.map((_, idx) => (
                    <div key={idx} className="glass p-12 rounded-[2rem] border-white/5 h-48 animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-8 md:before:left-1/2 before:w-[1px] before:bg-white/5">
            {entries.length === 0 ? (
                <div className="v4-glass p-12 rounded-[2.5rem] border-white/5 text-center text-muted-foreground font-medium italic">
                    No transformation records found.
                </div>
            ) : (
                entries.map((entry, idx) => {
                    const isScheduled = new Date(entry.date) > now

                    return (
                        <div key={entry.id} className={`relative flex items-center justify-center group ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-20 group-hover:scale-150 transition-transform duration-500 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />

                            <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                                <div className="v4-glass p-8 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all duration-500 group-hover:translate-y-[-5px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-primary font-black font-sans text-2xl tracking-tighter uppercase italic">{entry.version}</span>
                                        <div className="flex items-center gap-2">
                                            {isScheduled && (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/20 animate-pulse">
                                                    Scheduled
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-muted-foreground bg-white/5 px-3 py-1 rounded-full">{entry.date}</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-4">
                                        {entry.changes.map((change, cIdx) => (
                                            <li key={cIdx} className="flex gap-3 text-sm text-foreground/70 font-medium leading-relaxed">
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/60 mt-0.5" />
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="hidden md:block w-1/2" />
                        </div>
                    )
                })
            )}
        </div>
    )
}