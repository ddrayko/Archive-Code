"use client"

import { useState, useEffect, useRef } from "react"

interface CountdownProps {
    targetDate: string
}

declare global {
    interface Window {
        Odometer: any
    }
}

export function Countdown({ targetDate }: CountdownProps) {
    const [isClient, setIsClient] = useState(false)
    const [isOdometerReady, setIsOdometerReady] = useState(false)
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    const odometers = useRef<{ [key: string]: any }>({})
    const refs = {
        days: useRef<HTMLDivElement>(null),
        hours: useRef<HTMLDivElement>(null),
        minutes: useRef<HTMLDivElement>(null),
        seconds: useRef<HTMLDivElement>(null)
    }

    useEffect(() => {
        setIsClient(true)

        const loadOdometer = () => {
            if (window.Odometer) {
                setIsOdometerReady(true)
                return
            }

            if (document.querySelector('script[src*="odometer"]')) {
                return
            }

            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.7/themes/odometer-theme-default.css'
            document.head.appendChild(link)

            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.7/odometer.min.js'
            script.async = true
            script.onload = () => {
                setIsOdometerReady(true)
            }
            script.onerror = (e) => console.error("Odometer.js script failed to load:", e)
            document.body.appendChild(script)
        }

        loadOdometer()

        const pollTimer = setInterval(() => {
            if (window.Odometer && !isOdometerReady) {
                setIsOdometerReady(true)
            }
        }, 500)

        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                setTimeLeft(null)
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => {
            clearInterval(timer)
            clearInterval(pollTimer)
        }
    }, [targetDate, isOdometerReady])

    useEffect(() => {
        if (!isOdometerReady || !window.Odometer || !timeLeft) return

        Object.entries(refs).forEach(([key, ref]) => {
            if (ref.current) {
                if (!odometers.current[key]) {
                    odometers.current[key] = new window.Odometer({
                        el: ref.current,
                        value: timeLeft[key as keyof typeof timeLeft],
                        format: 'd',
                        theme: 'default'
                    })
                } else {
                    odometers.current[key].update(timeLeft[key as keyof typeof timeLeft])
                }
            }
        })
    }, [isOdometerReady, timeLeft])

    if (!isClient) {
        return <div className="h-48 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    }

    if (!timeLeft) {
        return (
            <div className="text-2xl font-bold text-muted-foreground animate-pulse text-center">
                UPDATE COMPLETE!
            </div>
        )
    }

    const units = [
        { label: "Days", key: "days" as const },
        { label: "Hours", key: "hours" as const },
        { label: "Minutes", key: "minutes" as const },
        { label: "Seconds", key: "seconds" as const }
    ]

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .odometer.odometer-animating-up .odometer-ribbon-inner,
                .odometer.odometer-animating-down .odometer-ribbon-inner {
                    -webkit-transition-duration: 0.5s !important;
                    -moz-transition-duration: 0.5s !important;
                    -ms-transition-duration: 0.5s !important;
                    -o-transition-duration: 0.5s !important;
                    transition-duration: 0.5s !important;
                }
                .odometer {
                    font-family: 'Outfit', sans-serif !important;
                    font-weight: 900 !important;
                }
            `}} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {units.map((unit) => (
                    <div key={unit.label} className="glass bg-white/5 border-white/10 p-4 md:p-6 rounded-3xl space-y-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="text-3xl md:text-5xl font-black tracking-tighter font-display tabular-nums h-[1.2em] flex items-center justify-center">
                                <div ref={refs[unit.key]}>{timeLeft[unit.key]}</div>
                            </div>
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                                {unit.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}