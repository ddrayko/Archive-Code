"use client"

import { useState, useTransition, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateAvailability } from "@/lib/actions"
import { Briefcase, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

interface AvailabilityToggleProps {
    initialState: boolean
}

export function AvailabilityToggle({ initialState }: AvailabilityToggleProps) {
    const [isAvailable, setIsAvailable] = useState(initialState)
    const [isPending, startTransition] = useTransition()

    // Sync state with props
    useEffect(() => {
        setIsAvailable(initialState)
    }, [initialState])

    const handleToggle = (checked: boolean) => {
        setIsAvailable(checked)
        startTransition(async () => {
            const result = await updateAvailability(checked)
            if (result.success) {
                toast.success(checked ? "You are now available" : "You are no longer available")
            } else {
                setIsAvailable(!checked)
                toast.error("Failed to update availability")
            }
        })
    }

    return (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] transition-colors duration-500 ${isAvailable ? "bg-green-500/20" : "bg-red-500/10"}`} />

            <div className="flex items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${isAvailable ? "bg-green-500/10 text-green-500 shadow-glow shadow-green-500/20" : "bg-red-500/10 text-red-500"}`}>
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-lg font-bold text-foreground block">Project Availability</Label>
                        <div className="flex items-center gap-2 text-sm font-medium transition-colors">
                            {isAvailable ? (
                                <span className="text-green-500 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Open to opportunities
                                </span>
                            ) : (
                                <span className="text-red-500/80 flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Currently unavailable
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                    <Switch
                        checked={isAvailable}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                        className="scale-125 data-[state=checked]:bg-green-500"
                    />
                </div>
            </div>
        </div>
    )
}
