"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, AlertTriangle, CheckCircle2, GitBranch } from "lucide-react"
import { checkForUpdates, performSystemUpdate } from "@/lib/system"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemUpdateCard() {
    const [status, setStatus] = useState<"idle" | "checking" | "available" | "uptodate" | "dirty" | "error" | "updating">("idle")
    const [message, setMessage] = useState("")
    const [commitsBehind, setCommitsBehind] = useState(0)

    const check = async () => {
        setStatus("checking")
        setMessage("Connecting to GitHub...")

        try {
            const result = await checkForUpdates()

            if (!result.success) {
                setStatus("error")
                setMessage(result.error || "Failed to check updates")
                return
            }

            if (result.isDirty) {
                setStatus("dirty")
                setMessage("Local modifications detected. Updates are disabled to prevent conflicts.")
            } else if (result.hasUpdates) {
                setStatus("available")
                setCommitsBehind(result.commitsBehind || 0)
                setMessage(`${result.commitsBehind} new update(s) available.`)
            } else {
                setStatus("uptodate")
                setMessage("System is running the latest version.")
            }
        } catch (e) {
            setStatus("error")
            setMessage("Network error or git misconfiguration.")
        }
    }

    const update = async () => {
        setStatus("updating")
        toast.info("Starting update process...")

        try {
            const result = await performSystemUpdate()
            if (result.success) {
                toast.success("System updated successfully!")
                setMessage("Update complete. Restarting application...")
                setTimeout(() => window.location.reload(), 2000)
            } else {
                setStatus("error")
                setMessage(result.message)
                toast.error(result.message)
            }
        } catch (e) {
            setStatus("error")
            setMessage("Critical update failure.")
            toast.error("Critical failure during update.")
        }
    }

    useEffect(() => {
        check()
    }, [])

    return (
        <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            {/* Background Gradient Animation */}
            <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-1000 pointer-events-none",
                status === "available" ? "bg-primary/5 opacity-100" : "",
                status === "dirty" ? "bg-orange-500/5 opacity-100" : ""
            )} />

            <div className="flex items-center gap-4 relative z-10 max-w-lg">
                <div className={cn(
                    "p-3 rounded-xl shrink-0 transition-colors duration-500",
                    status === "idle" || status === "checking" ? "bg-white/5 text-muted-foreground" : "",
                    status === "uptodate" ? "bg-green-500/10 text-green-500" : "",
                    status === "available" ? "bg-primary/10 text-primary animate-pulse" : "",
                    status === "dirty" ? "bg-orange-500/10 text-orange-500" : "",
                    status === "error" ? "bg-red-500/10 text-red-500" : "",
                )}>
                    {status === "checking" && <RefreshCw className="h-6 w-6 animate-spin" />}
                    {status === "uptodate" && <CheckCircle2 className="h-6 w-6" />}
                    {status === "available" && <Download className="h-6 w-6" />}
                    {status === "dirty" && <AlertTriangle className="h-6 w-6" />}
                    {status === "error" && <AlertTriangle className="h-6 w-6" />}
                    {status === "idle" && <GitBranch className="h-6 w-6" />}
                    {status === "updating" && <RefreshCw className="h-6 w-6 animate-spin" />}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                            System Core
                        </p>
                        {status === "available" && (
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                        )}
                    </div>
                    <p className="text-lg font-bold text-foreground/90 font-sans">
                        {status === "checking" ? "Checking repository..." :
                            status === "updating" ? "Installing updates..." :
                                message || "Manage core system version."}
                    </p>
                    {status === "dirty" && (
                        <p className="text-xs text-orange-400 font-medium mt-1">
                            Warning: Custom file changes found. Auto-update blocked.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
                <Button
                    onClick={check}
                    variant="ghost"
                    size="icon"
                    disabled={status === "checking" || status === "updating"}
                    className="rounded-xl h-12 w-12 hover:bg-white/10"
                    title="Check again"
                >
                    <RefreshCw className={cn("h-4 w-4", status === "checking" ? "animate-spin" : "")} />
                </Button>

                {status === "available" ? (
                    <Button
                        onClick={update}
                        className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Install v4.{commitsBehind}
                    </Button>
                ) : (
                    <Button
                        disabled
                        variant="outline"
                        className="rounded-xl h-12 px-6 glass border-white/10 opacity-50 cursor-not-allowed"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Up to Date
                    </Button>
                )}
            </div>
        </div>
    )
}
