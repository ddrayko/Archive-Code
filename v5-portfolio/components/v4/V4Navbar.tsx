"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Command, Menu, X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useRouteTransition } from "@/components/route-transition"
import { useSiteSettings } from "@/components/site-settings-provider"
import { useSafeUser } from "@/hooks/use-safe-user"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { VersionSelector } from "@/components/version-selector"

export function V4Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const { loading, progress } = useRouteTransition()
    const { developerName } = useSiteSettings()
    const user = useSafeUser()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = originalOverflow
        }
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [mobileOpen])
    const navItems = [
        { label: "Projects", href: "/#projects" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
    ]
    const isItemActive = (href: string) => {
        if (href === "/#projects") return pathname === "/"
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className={`relative overflow-hidden flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 rounded-2xl transition-all duration-500 ${scrolled ? "v4-glass shadow-2xl" : "bg-transparent"}`}>
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:bg-white group-hover:text-primary"
                        >
                            <Command className="w-5 h-5" />
                        </motion.div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">
                            {developerName}<span className="text-primary group-hover:text-white transition-colors"> Portfolio</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                aria-current={isItemActive(item.href) ? "page" : undefined}
                                className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${isItemActive(item.href) ? "text-white" : "text-muted-foreground hover:text-white"}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex">
                            <VersionSelector />
                        </div>
                        <Button asChild variant="outline" size="sm" className="hidden md:flex rounded-xl glass border-white/5 text-[10px] font-black uppercase tracking-widest px-6 hover:bg-primary hover:text-primary-foreground transition-all">
                            <Link href="/contact">
                                Contact
                            </Link>
                        </Button>

                        {user.hasProvider ? (
                            <>
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button size="sm" className="hidden md:inline-flex rounded-xl text-[10px] font-black uppercase tracking-widest px-6">
                                            Login
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <div className="hidden md:flex items-center gap-2">
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    avatarBox: "w-9 h-9",
                                                },
                                            }}
                                        />
                                    </div>
                                </SignedIn>
                            </>
                        ) : (
                            <Button asChild size="sm" className="hidden md:inline-flex rounded-xl text-[10px] font-black uppercase tracking-widest px-6">
                                <Link href="/sign-in">Login</Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-xl"
                            aria-label="Open menu"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>

                    {loading && scrolled && (
                        <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 via-primary to-cyan-400 transition-transform duration-200 origin-left"
                                style={{ transform: `scaleX(${progress / 100})` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {loading && !scrolled && (
                <div className="fixed top-0 left-0 right-0 h-[2px] z-[120] bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 via-primary to-cyan-400 transition-transform duration-200 origin-left"
                        style={{ transform: `scaleX(${progress / 100})` }}
                    />
                </div>
            )}

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-[120] lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.button
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu overlay"
                        />
                        <motion.aside
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-0 right-0 h-dvh w-[min(90vw,24rem)]"
                            id="mobile-menu"
                            aria-label="Mobile menu"
                        >
                            <div className="v4-glass h-full rounded-l-3xl p-6 border-l border-white/10 shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        Navigation
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl"
                                        onClick={() => setMobileOpen(false)}
                                        aria-label="Close menu"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <nav className="mt-8 grid gap-2" aria-label="Mobile navigation">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            aria-current={isItemActive(item.href) ? "page" : undefined}
                                            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors ${isItemActive(item.href) ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto pt-6 space-y-3">
                                    <VersionSelector />
                                    <Button asChild className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                        <Link href="/contact" onClick={() => setMobileOpen(false)}>
                                            Contact
                                        </Link>
                                    </Button>

                                    {user.hasProvider ? (
                                        <>
                                            <SignedOut>
                                                <SignInButton mode="modal">
                                                    <Button className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setMobileOpen(false)}>
                                                        Login
                                                    </Button>
                                                </SignInButton>
                                            </SignedOut>
                                            <SignedIn>
                                                <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5">
                                                    <div className="text-xs font-semibold text-white">Account</div>
                                                    <UserButton
                                                        afterSignOutUrl="/"
                                                        appearance={{
                                                            elements: { avatarBox: "w-10 h-10" },
                                                        }}
                                                    />
                                                </div>
                                            </SignedIn>
                                        </>
                                    ) : (
                                        <Button asChild className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                                                Login
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
