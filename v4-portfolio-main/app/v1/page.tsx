"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function V1Page() {
    const router = useRouter()
    
    useEffect(() => {
        window.location.href = "/v1.html"
    }, [])
    
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Redirecting to version 1...</p>
            </div>
        </div>
    )
}