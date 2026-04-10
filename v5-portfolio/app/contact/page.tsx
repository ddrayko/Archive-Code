import Link from "next/link"
import { ChevronLeft, Mail, MessageSquare, Clock, Lock, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMaintenanceMode, getAvailability } from "@/lib/actions"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Dock } from "@/components/v4/V4Dock"
import { V4Footer } from "@/components/v4/V4Footer"

export const dynamic = 'force-dynamic'

export const revalidate = 0

export default async function ContactPage() {
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const { isAvailable } = await getAvailability()

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-32 pb-24 container max-w-6xl mx-auto px-6 min-h-screen flex flex-col justify-center">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                        <Send className="w-3 h-3" />
                        Direct Channel
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        CONTACT THE <span className="text-primary">ARCHITECT.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 v4-glass p-4 rounded-[4rem] border-white/5 shadow-2xl">
                    <div className="bg-white/5 rounded-[3.5rem] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 space-y-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                <Mail className="h-10 w-10" />
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-4xl font-black tracking-tight text-white uppercase italic leading-none">
                                    Let's Start <br /> <span className="text-primary">Something.</span>
                                </h2>
                                <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                                    High-performance digital products start with a conversation. Let's discuss your objectives.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-8 mt-12 bg-white/5 p-8 rounded-3xl border border-white/5">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Secure Protocol</p>
                                <a href="mailto:info@drayko.xyz" className="text-xl font-bold hover:text-primary transition-colors block tracking-tight">
                                    info@drayko.xyz
                                </a>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Status</p>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? "bg-cyan-400" : "bg-red-400"}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isAvailable ? "bg-cyan-500" : "bg-red-500"}`}></span>
                                    </span>
                                    <span className={`font-black uppercase tracking-widest text-xs ${isAvailable ? "text-white" : "text-red-400"}`}>
                                        {isAvailable ? "Operational" : "Busy Processing"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 self-center">
                        <SignedIn>
                            <ChatInterface isAvailable={isAvailable} />
                        </SignedIn>
                        <SignedOut>
                            <div className="relative py-12">
                                <div className="absolute inset-0 bg-background/40 backdrop-blur-xl rounded-[3rem] z-10 flex items-center justify-center border border-white/10">
                                    <div className="text-center space-y-6 p-8 max-w-xs">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border border-primary/20">
                                            <Lock className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic">Access Denied</h3>
                                        <p className="text-muted-foreground font-medium text-sm">Authentication is required to initialize the direct communication channel.</p>
                                        <SignInButton mode="modal">
                                            <Button className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                                                Login / Register
                                            </Button>
                                        </SignInButton>
                                    </div>
                                </div>
                                <div className="blur-xl opacity-30 pointer-events-none scale-95">
                                    <ChatInterface isAvailable={isAvailable} />
                                </div>
                            </div>
                        </SignedOut>
                    </div>
                </div>
            </main>

            <V4Footer />
            <V4Dock />
        </div>
    )
}