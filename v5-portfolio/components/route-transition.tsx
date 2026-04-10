"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type RouteTransitionState = {
    loading: boolean
    progress: number
    startTransition: (url: string) => void
}

const RouteTransitionContext = createContext<RouteTransitionState | null>(null)

export function useRouteTransition() {
    const context = useContext(RouteTransitionContext)
    return context ?? { loading: false, progress: 0, startTransition: () => { } }
}

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const startTransition = useCallback((url: string) => {
        const nextUrl = new URL(url, window.location.href)
        const currentUrl = new URL(window.location.href)

        if (nextUrl.href === currentUrl.href) return

        setLoading(true)
        setProgress(100)
        router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    }, [router])

    useEffect(() => {
        setLoading(false)
        setProgress(0)
    }, [pathname, searchParams])

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (event.button !== 0) return
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

            const target = event.target as HTMLElement | null
            const anchor = target?.closest("a") as HTMLAnchorElement | null
            if (!anchor) return
            if (anchor.target === "_blank" || anchor.hasAttribute("download")) return

            const href = anchor.getAttribute("href")
            if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return
            if (href.startsWith("#")) return

            const url = new URL(href, window.location.href)
            if (url.origin !== window.location.origin) return

            const currentUrl = new URL(window.location.href)
            const isOnlyHashChange =
                url.pathname === currentUrl.pathname &&
                url.search === currentUrl.search &&
                url.hash !== currentUrl.hash

            if (isOnlyHashChange) return

            event.preventDefault()
            event.stopPropagation()
            startTransition(url.href)
        }

        document.addEventListener("click", handleClick, true)
        return () => document.removeEventListener("click", handleClick, true)
    }, [startTransition])

    return (
        <RouteTransitionContext.Provider value={{ loading, progress, startTransition }}>
            {children}
        </RouteTransitionContext.Provider>
    )
}
