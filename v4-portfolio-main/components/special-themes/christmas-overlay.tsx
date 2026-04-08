"use client"

import { useEffect, useState } from "react"

export function ChristmasOverlay() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        const createSnowflakes = () => {
            const snowflakeCount = 15
            const container = document.getElementById('christmas-snowflakes')
            if (!container) return

            const snowflakeChars = ['❄', '❅', '❆']

            for (let i = 0; i < snowflakeCount; i++) {
                const snowflake = document.createElement('div')
                snowflake.className = 'snowflake'
                snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)]
                snowflake.style.left = `${Math.random() * 100}%`
                snowflake.style.animationDuration = `${8 + Math.random() * 10}s`
                snowflake.style.animationDelay = `${Math.random() * 5}s`
                snowflake.style.fontSize = `${0.8 + Math.random() * 0.7}em`
                snowflake.style.opacity = `${0.6 + Math.random() * 0.4}`
                container.appendChild(snowflake)
            }
        }

        setTimeout(() => {
            createSnowflakes()
        }, 100)

        const messageTimeout = setTimeout(() => {
            const message = document.getElementById('christmas-message')
            if (message) {
                message.style.display = 'block'

                setTimeout(() => {
                    message.style.animation = 'fadeOutUp 1s ease-out forwards'
                }, 5000)
            }
        }, 1000)

        return () => {
            clearTimeout(messageTimeout)
        }
    }, [])

    if (!mounted) return null

    return (
        <>
            <div
                id="christmas-snowflakes"
                className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
                aria-hidden="true"
            />

            <div
                id="christmas-message"
                className="fixed top-8 left-1/2 z-[9999] pointer-events-none"
                style={{
                    display: 'none',
                    transform: 'translateX(-50%)',
                }}
            >
                <div
                    className="px-8 py-4 rounded-2xl shadow-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(196, 30, 58, 0.95), rgba(22, 91, 51, 0.95))',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 0 40px rgba(196, 30, 58, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-4xl" role="img" aria-label="Christmas tree">
                            🎄
                        </span>
                        <div>
                            <h2
                                className="text-3xl font-bold text-white"
                                style={{
                                    textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.3)',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                Merry Christmas 2025!
                            </h2>
                            <p
                                className="text-sm text-white/90 mt-1"
                                style={{
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                Wishing you a wonderful holiday season ?
                            </p>
                        </div>
                        <span className="text-4xl" role="img" aria-label="Gift">
                            🎁
                        </span>
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