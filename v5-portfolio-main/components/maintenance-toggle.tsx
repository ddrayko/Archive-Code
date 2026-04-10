"use client"

import { useState, useTransition, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { updateMaintenanceMode } from "@/lib/actions"
import { Construction, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MaintenanceToggleProps {
    initialState: boolean
    initialMessage: string
    initialProgress: number
    onUpdated?: () => void
}

export function MaintenanceToggle({ initialState, initialMessage, initialProgress, onUpdated }: MaintenanceToggleProps) {
    const [isMaintenance, setIsMaintenance] = useState(initialState)
    const [message, setMessage] = useState(initialMessage)
    const [progress, setProgress] = useState(initialProgress)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    useEffect(() => {
        setIsMaintenance(initialState)
    }, [initialState])

    useEffect(() => {
        setMessage(initialMessage)
    }, [initialMessage])

    useEffect(() => {
        setProgress(initialProgress)
    }, [initialProgress])

    const handleToggle = (checked: boolean) => {
        setIsMaintenance(checked)
        startTransition(async () => {
            const result = await updateMaintenanceMode(checked, message, progress)
            if (result.success) {
                toast({
                    title: checked ? "Maintenance Enabled" : "Maintenance Disabled",
                    description: checked ? "The site is now in maintenance mode." : "The site is now live.",
                })
                if (onUpdated) onUpdated()
            } else {
                setIsMaintenance(!checked)
                toast({
                    title: "Error",
                    description: "Failed to update maintenance mode.",
                    variant: "destructive",
                })
            }
        })
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateMaintenanceMode(isMaintenance, message, progress)
            if (result.success) {
                toast({
                    title: "Settings Saved",
                    description: "Maintenance settings updated successfully.",
                })
                if (onUpdated) onUpdated()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save settings.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <div className="glass p-6 rounded-3xl border-white/5 flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isMaintenance ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"} transition-colors`}>
                        <Construction className="h-6 w-6" />
                    </div>
                    <div>
                        <Label className="text-base font-bold text-foreground">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            {isMaintenance ? "Site is locked." : "Site is live."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Switch checked={isMaintenance} onCheckedChange={handleToggle} disabled={isPending} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Custom Message</Label>
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter maintenance message..."
                            className="bg-white/5 border-white/10 text-foreground"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Progress Bar ({progress}%)</Label>
                    </div>
                    <Slider
                        value={[progress]}
                        onValueChange={(val) => setProgress(val[0])}
                        max={100}
                        step={1}
                        className="py-4"
                    />
                </div>

                <Button onClick={handleSave} disabled={isPending} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    )
}