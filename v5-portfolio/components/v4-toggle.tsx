"use client"

import { useState, useTransition, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { updateV4Mode } from "@/lib/actions"
import { Rocket, Loader2, Save, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSiteSettings } from "@/components/site-settings-provider"

interface V4ToggleProps {
    initialState: boolean
    initialMessage: string
    initialProgress: number
    onUpdated?: () => void
}

export function V4Toggle({ initialState, initialMessage, initialProgress, onUpdated }: V4ToggleProps) {
    const [isV4Mode, setIsV4Mode] = useState(initialState)
    const [message, setMessage] = useState(initialMessage)
    const [progress, setProgress] = useState(initialProgress)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const { developerName } = useSiteSettings()

    // Sync state with props if they change
    useEffect(() => {
        setIsV4Mode(initialState)
    }, [initialState])

    useEffect(() => {
        setMessage(initialMessage)
    }, [initialMessage])

    useEffect(() => {
        setProgress(initialProgress)
    }, [initialProgress])

    const handleToggle = (checked: boolean) => {
        setIsV4Mode(checked)
        startTransition(async () => {
            const result = await updateV4Mode(checked, message, progress)
            if (result.success) {
                toast({
                    title: checked ? "V5 Mode Enabled" : "V5 Mode Disabled",
                    description: checked ? "The site is now in V5 teaser mode." : "The site is now live.",
                })
                if (onUpdated) onUpdated()
            } else {
                setIsV4Mode(!checked)
                toast({
                    title: "Error",
                    description: "Failed to update V5 mode.",
                    variant: "destructive",
                })
            }
        })
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateV4Mode(isV4Mode, message, progress)
            if (result.success) {
                toast({
                    title: "Settings Saved",
                    description: "V5 teaser settings updated successfully.",
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
                    <div className={`p-3 rounded-xl ${isV4Mode ? "bg-blue-500/20 text-blue-400" : "bg-muted/20 text-muted-foreground"} transition-colors`}>
                        <Rocket className="h-6 w-6" />
                    </div>
                    <div>
                        <Label className="text-base font-bold text-foreground">V5 Teaser Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            {isV4Mode ? "V5 announcement is live." : "Standard site is live."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Switch checked={isV4Mode} onCheckedChange={handleToggle} disabled={isPending} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Teaser Message</Label>
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Enter teaser message (e.g. ${developerName} v5 is coming...)`}
                            className="bg-white/5 border-white/10 text-foreground"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Development Progress ({progress}%)</Label>
                    </div>
                    <Slider
                        value={[progress]}
                        onValueChange={(val) => setProgress(val[0])}
                        max={100}
                        step={1}
                        className="py-4"
                    />
                </div>

                <Button onClick={handleSave} disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Save V5 Settings
                </Button>
            </div>
        </div>
    )
}
