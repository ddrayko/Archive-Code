"use client"

import { useEffect, useState } from "react"

export function NewYearOverlay() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        const createParticles = () => {
            const particleCount = 5
            const container = document.getElementById('new-year-particles')
            if (!container) return

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div')
                particle.className = 'golden-particle'
                particle.style.left = `${Math.random() * 100}%`
                particle.style.animationDelay = `${Math.random() * 15}s`
                particle.style.animationDuration = `${20 + Math.random() * 10}s`
                container.appendChild(particle)
            }
        }

        const createConfetti = () => {
            const confettiCount = 2
            const container = document.getElementById('new-year-confetti')
            if (!container) return

            const colors = ['#FFD700', '#FFA500']

            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div')
                confetti.className = 'golden-confetti'
                confetti.style.left = `${(i + 1) * 33}%`
                confetti.style.backgroundColor = colors[i % colors.length]
                confetti.style.animationDelay = `${i * 2.5}s`
                confetti.style.animationDuration = `${8 + Math.random() * 4}s`
                confetti.style.width = `8px`
                confetti.style.height = `8px`
                confetti.style.borderRadius = '50%'
                container.appendChild(confetti)
            }
        }

        setTimeout(() => {
            createParticles()
            createConfetti()
        }, 100)
    }, [])

    if (!mounted) return null

    return (
        <>
            <div
                id="new-year-particles"
                className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
                aria-hidden="true"
            />

            <div
                id="new-year-confetti"
                className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
                aria-hidden="true"
            />

            <div
                className="fixed top-8 left-1/2 z-[9999] pointer-events-none"
                style={{
                    transform: 'translateX(-50%)',
                    animation: 'fadeIn 1s ease-out, fadeOutUp 1s ease-out 4s forwards'
                }}
            >
                <div className="new-year-text text-center px-8 py-4 rounded-2xl backdrop-blur-sm bg-black/20 border border-[#FFD700]/30">
                    <div className="text-4xl md:text-6xl font-black tracking-tight">
                        HAPPY NEW YEAR 2026
                    </div>
                    <div className="text-lg md:text-xl mt-2 text-[#FFF4A3] font-semibold">
                        Best wishes for the new year!
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeOutUp {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-50px);
                    }
                }
            `}</style>
        </>
    )
}