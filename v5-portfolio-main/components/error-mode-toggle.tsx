"use client"

import { useEffect, useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updateErrorMode } from "@/lib/actions"

interface ErrorModeToggleProps {
  initialState: boolean
  initialMessage: string
  onUpdated?: () => void
}

export function ErrorModeToggle({ initialState, initialMessage, onUpdated }: ErrorModeToggleProps) {
  const [isErrorMode, setIsErrorMode] = useState(initialState)
  const [message, setMessage] = useState(initialMessage)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    setIsErrorMode(initialState)
  }, [initialState])

  useEffect(() => {
    setMessage(initialMessage)
  }, [initialMessage])

  const handleToggle = (checked: boolean) => {
    setIsErrorMode(checked)
    startTransition(async () => {
      const result = await updateErrorMode(checked, message)
      if (result.success) {
        toast({
          title: checked ? "Error Mode Enabled" : "Error Mode Disabled",
          description: checked
            ? "The site is showing the overload screen."
            : "The site is back to normal.",
        })
        if (onUpdated) onUpdated()
      } else {
        setIsErrorMode(!checked)
        toast({
          title: "Error",
          description: "Unable to update error mode.",
          variant: "destructive",
        })
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateErrorMode(isErrorMode, message)
      if (result.success) {
        toast({
          title: "Message saved",
          description: "The overload message has been updated.",
        })
        if (onUpdated) onUpdated()
      } else {
        toast({
          title: "Error",
          description: "Unable to save the message.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="glass p-6 rounded-3xl border-white/5 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isErrorMode ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"} transition-colors`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <Label className="text-base font-bold text-foreground">Error Mode</Label>
            <p className="text-sm text-muted-foreground">
              {isErrorMode ? "Overload screen active." : "Normal mode."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Switch checked={isErrorMode} onCheckedChange={handleToggle} disabled={isPending} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Custom message</Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message shown on all pages..."
            className="bg-white/5 border-white/10 text-foreground"
          />
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full">
          <Save className="mr-2 h-4 w-4" />Save</Button>
      </div>
    </div>
  )
}
