"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const NewYearOverlay = dynamic(
    () => import("./special-themes/new-year-overlay").then(mod => ({ default: mod.NewYearOverlay })),
    { ssr: false }
)

const ChristmasOverlay = dynamic(
    () => import("./special-themes/christmas-overlay").then(mod => ({ default: mod.ChristmasOverlay })),
    { ssr: false }
)

interface ThemeConfig {
    id: string
    name: string
    description: string
    startDate: {
        day: number
        month: number
        year: number
        hour: number
        minute: number
        second: number
    }
    endDate: {
        day: number
        month: number
        year: number
        hour: number
        minute: number
        second: number
    }
}

interface ActiveThemes {
    newYear: boolean
    christmas: boolean
}

const AVAILABLE_THEMES: ThemeConfig[] = [
    {
        id: "new-year",
        name: "New Year",
        description: "New Year seasonal visual theme",
        startDate: { day: 25, month: 12, year: 2025, hour: 0, minute: 0, second: 0 },
        endDate: { day: 7, month: 1, year: 2026, hour: 23, minute: 59, second: 59 },
    },
    {
        id: "christmas",
        name: "Christmas",
        description: "Christmas seasonal visual theme",
        startDate: { day: 15, month: 12, year: 2025, hour: 0, minute: 0, second: 0 },
        endDate: { day: 31, month: 12, year: 2025, hour: 23, minute: 59, second: 59 },
    },
]

const THEMES_CACHE_KEY = "special-themes-config-v1"
const THEMES_CACHE_TTL_MS = 1000 * 60 * 60 * 6

function toDate(input: ThemeConfig["startDate"]): Date {
    return new Date(input.year, input.month - 1, input.day, input.hour, input.minute, input.second)
}

function isPotentiallyActiveWindow(now: Date, themes: ThemeConfig[]): boolean {
    const month = now.getMonth() + 1
    if (month === 12 || month === 1) return true

    return themes.some((theme) => {
        const startDate = toDate(theme.startDate)
        const endDate = toDate(theme.endDate)
        const diffToStart = Math.abs(startDate.getTime() - now.getTime())
        const diffToEnd = Math.abs(endDate.getTime() - now.getTime())
        const oneMonthMs = 1000 * 60 * 60 * 24 * 31
        return diffToStart <= oneMonthMs || diffToEnd <= oneMonthMs
    })
}

function readCachedThemes(now: number): ThemeConfig[] | null {
    try {
        const cachedRaw = localStorage.getItem(THEMES_CACHE_KEY)
        if (!cachedRaw) return null
        const cached = JSON.parse(cachedRaw) as { themes?: ThemeConfig[]; savedAt?: number }
        if (!Array.isArray(cached.themes) || typeof cached.savedAt !== "number") return null
        if (now - cached.savedAt > THEMES_CACHE_TTL_MS) return null
        return cached.themes
    } catch {
        return null
    }
}

function writeCachedThemes(themes: ThemeConfig[]) {
    try {
        localStorage.setItem(
            THEMES_CACHE_KEY,
            JSON.stringify({
                themes,
                savedAt: Date.now(),
            })
        )
    } catch {
        // Ignore storage errors.
    }
}

export function SpecialThemeHandler() {
    const [activeThemes, setActiveThemes] = useState<ActiveThemes>({
        newYear: false,
        christmas: false
    })

    useEffect(() => {
        const checkThemes = async () => {
            const now = new Date()
            let themes: ThemeConfig[] = AVAILABLE_THEMES

            try {
                const cachedThemes = readCachedThemes(now.getTime())
                if (cachedThemes) {
                    themes = cachedThemes
                } else if (isPotentiallyActiveWindow(now, AVAILABLE_THEMES)) {
                    const { getFirestoreClient } = await import("@/lib/firebase/client")
                    const { doc, getDoc } = await import("firebase/firestore")

                    const db = getFirestoreClient()
                    const docRef = doc(db, "special-themes", "config")
                    const docSnap = await getDoc(docRef)

                    if (docSnap.exists()) {
                        const data = docSnap.data() as { themes?: ThemeConfig[] }
                        if (Array.isArray(data.themes)) {
                            const mergedThemes = AVAILABLE_THEMES.map((defaultTheme) => {
                                const savedTheme = data.themes?.find((theme) => theme.id === defaultTheme.id)
                                return savedTheme || defaultTheme
                            })
                            themes = mergedThemes
                            writeCachedThemes(themes)
                        }
                    }
                }

                const newYearTheme = themes.find(t => t.id === 'new-year')
                const christmasTheme = themes.find(t => t.id === 'christmas')

                let isNewYearActive = false
                if (newYearTheme) {
                    const startDate = toDate(newYearTheme.startDate)
                    const endDate = toDate(newYearTheme.endDate)
                    isNewYearActive = now >= startDate && now <= endDate
                }

                let isChristmasActive = false
                if (christmasTheme) {
                    const startDate = toDate(christmasTheme.startDate)
                    const endDate = toDate(christmasTheme.endDate)
                    isChristmasActive = now >= startDate && now <= endDate
                }

                if (isNewYearActive) {
                    document.documentElement.classList.remove("special-christmas")
                    document.documentElement.classList.add("special-new-year")

                    if (!document.getElementById('new-year-theme-css')) {
                        const link = document.createElement('link')
                        link.id = 'new-year-theme-css'
                        link.rel = 'stylesheet'
                        link.href = '/styles/special-themes/new-year.css'
                        document.head.appendChild(link)
                    }

                    const christmasLink = document.getElementById('christmas-theme-css')
                    if (christmasLink) christmasLink.remove()

                    setActiveThemes({ newYear: true, christmas: false })
                } else if (isChristmasActive) {
                    document.documentElement.classList.remove("special-new-year")
                    document.documentElement.classList.add("special-christmas")

                    if (!document.getElementById('christmas-theme-css')) {
                        const link = document.createElement('link')
                        link.id = 'christmas-theme-css'
                        link.rel = 'stylesheet'
                        link.href = '/styles/special-themes/christmas.css'
                        document.head.appendChild(link)
                    }

                    const newYearLink = document.getElementById('new-year-theme-css')
                    if (newYearLink) newYearLink.remove()

                    setActiveThemes({ newYear: false, christmas: true })
                } else {
                    document.documentElement.classList.remove("special-new-year", "special-christmas")

                    const newYearLink = document.getElementById('new-year-theme-css')
                    const christmasLink = document.getElementById('christmas-theme-css')
                    if (newYearLink) newYearLink.remove()
                    if (christmasLink) christmasLink.remove()

                    setActiveThemes({ newYear: false, christmas: false })
                }
            } catch (e) {
                console.error('Error reading themes config from Firebase:', e)
            }
        }

        checkThemes()
        const interval = setInterval(checkThemes, THEMES_CACHE_TTL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <>
            {activeThemes.newYear && <NewYearOverlay />}
            {activeThemes.christmas && <ChristmasOverlay />}
        </>
    )
}
