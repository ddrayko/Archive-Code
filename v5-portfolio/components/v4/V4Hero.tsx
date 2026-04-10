"use client"

import { motion } from "framer-motion"
import { useRef, useEffect } from "react"
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSiteSettings } from "@/components/site-settings-provider"
import type { SystemStatusLevel } from "@/lib/status-summary"

interface V4HeroProps {
    badgeText?: string
    badgeHref?: string
    badgeStatus?: SystemStatusLevel
}

export function V4Hero({
    badgeText = "Experience v4.0.0 is Live",
    badgeHref = "/update",
    badgeStatus = "operational",
}: V4HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { developerName } = useSiteSettings()
    const badgeClassName =
        badgeStatus === "outage"
            ? "border-red-500/35 text-red-300 hover:border-red-400/70"
            : badgeStatus === "degraded"
                ? "border-orange-500/35 text-orange-300 hover:border-orange-400/70"
                : "border-emerald-500/35 text-emerald-300 hover:border-emerald-400/70"

    useEffect(() => {
        let frameId: number | null = null
        let lastX = 0
        let lastY = 0

        const updateMouseGradient = () => {
            frameId = null
            if (!containerRef.current) return
            containerRef.current.style.setProperty("--mouse-x", `${lastX}px`)
            containerRef.current.style.setProperty("--mouse-y", `${lastY}px`)
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            lastX = e.clientX - rect.left
            lastY = e.clientY - rect.top
            if (frameId === null) {
                frameId = requestAnimationFrame(updateMouseGradient)
            }
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [])

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] sm:min-h-screen flex items-start xl:items-center justify-center overflow-hidden bg-background py-20 sm:py-24 px-4 sm:px-6"
            style={{
                ["--mouse-x" as string]: "50%",
                ["--mouse-y" as string]: "50%",
            }}
        >
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                style={{
                    background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), oklch(0.7 0.25 260 / 0.08), transparent 40%)"
                }}
            />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[100px]"
                />
            </div>

            <div className="container relative z-10 mx-auto pt-20 sm:pt-24 md:pt-28 xl:pt-0">
                <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link
                            href={badgeHref}
                            className={`group inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${badgeClassName}`}
                        >
                            {badgeStatus === "outage" ? <XCircle className="w-3.5 h-3.5 animate-pulse" /> : null}
                            {badgeStatus === "degraded" ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : null}
                            {badgeStatus === "operational" ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{badgeText}</span>
                        </Link>
                    </motion.div>

                    <div className="space-y-4 max-w-5xl">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1] font-display"
                        >
                            <span className="block text-foreground drop-shadow-sm uppercase">{developerName}</span>
                            <span className="relative inline-block">
                                <span className="block pb-[0.08em] bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent italic uppercase">Portfolio.</span>
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base sm:text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            An independent developer who codes innovative websites and applications.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6 w-full sm:w-auto"
                    >
                        <Button asChild size="lg" className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-2xl shadow-primary/20 text-sm sm:text-md font-bold uppercase tracking-widest w-full sm:w-auto">
                            <Link href="#projects">
                                View Projects
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl border-white/10 glass hover:bg-white/5 text-sm sm:text-md font-bold uppercase tracking-widest transition-all w-full sm:w-auto">
                            <Link href="/contact">
                                Get in touch
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
