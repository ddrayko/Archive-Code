"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Code, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouteTransition } from "@/components/route-transition"

type Version = "v1" | "v2" | "v3" | "v4" | "v5"

const VERSIONS: Array<{
    id: Version
    label: string
    available: boolean
    description: string
    icon: typeof Code
    href: string
}> = [
    { id: "v5", label: "Version 5", available: true, description: "Current", icon: Sparkles, href: "/" },
    { id: "v4", label: "Version 4", available: true, description: "v4.drayko.xyz", icon: Code, href: "https://v4.drayko.xyz" },
    { id: "v3", label: "Version 3", available: true, description: "v3.drayko.xyz", icon: Code, href: "https://v3.drayko.xyz" },
    { id: "v2", label: "Version 2", available: true, description: "v2.drayko.xyz", icon: Code, href: "https://v2.drayko.xyz" },
    { id: "v1", label: "Version 1", available: true, description: "v1.drayko.xyz", icon: Code, href: "https://v1.drayko.xyz" },
]

const VERSION_STORAGE_KEY = "portfolio-version"

export function VersionSelector() {
    const { startTransition } = useRouteTransition()
    const [currentVersion, setCurrentVersion] = useState<Version>("v5")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY) as Version | null
            if (savedVersion && VERSIONS.find(v => v.id === savedVersion)?.available) {
                setCurrentVersion(savedVersion)
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return

        try {
            const host = window.location.hostname
            if (host.includes("v4.")) setCurrentVersion("v4")
            else if (host.includes("v3.")) setCurrentVersion("v3")
            else if (host.includes("v2.")) setCurrentVersion("v2")
            else if (host.includes("v1.")) setCurrentVersion("v1")
            else setCurrentVersion("v5")
        } catch {
            setCurrentVersion("v5")
        }
    }, [mounted])

    const handleVersionChange = (version: Version) => {
        if (!VERSIONS.find(v => v.id === version)?.available) {
            return
        }

        setCurrentVersion(version)
        try {
            localStorage.setItem(VERSION_STORAGE_KEY, version)
        } catch (error) {
            console.error("Error saving to localStorage:", error)
        }

        const target = VERSIONS.find(v => v.id === version)?.href
        if (!target) return
        if (version === "v5") {
            startTransition(target)
        } else {
            window.location.assign(target)
        }
    }

    const currentVersionInfo = VERSIONS.find(v => v.id === currentVersion)

    if (!mounted) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl glass border-white/5 text-[10px] font-black uppercase tracking-widest px-4 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                    {currentVersionInfo?.icon && (
                        <currentVersionInfo.icon className="w-3 h-3 mr-2" />
                    )}
                    {currentVersionInfo?.label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest">
                    Select version
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {VERSIONS.map((version) => {
                    const Icon = version.icon
                    const isSelected = currentVersion === version.id
                    const isDisabled = !version.available

                    return (
                        <DropdownMenuItem
                            key={version.id}
                            onClick={() => handleVersionChange(version.id)}
                            disabled={isDisabled}
                            className={cn(
                                "cursor-pointer flex items-center justify-between text-xs font-medium",
                                isDisabled && "opacity-50 cursor-not-allowed",
                                isSelected && "bg-primary/10"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5" />
                                <div className="flex flex-col">
                                    <span>{version.label}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {version.description}
                                    </span>
                                </div>
                            </div>
                            {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
