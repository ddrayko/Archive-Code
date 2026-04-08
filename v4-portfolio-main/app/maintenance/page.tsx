import { Construction } from "lucide-react"
import { getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"


export default async function MaintenancePage() {
    const { isMaintenance, message, progress } = await getMaintenanceMode()

    if (!isMaintenance) {
        redirect("/")
    }

    return (
        <div className="dark min-h-screen relative flex items-center justify-center overflow-hidden bg-[#030712] text-foreground">
            <div className="mesh-bg absolute inset-0 opacity-30 pointer-events-none" />

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "-2s" }} />
            </div>

            <div className="relative z-10 p-6 w-full max-w-2xl">
                <div className="glass p-12 md:p-16 rounded-[3rem] border-white/5 text-center space-y-8 animate-float backdrop-blur-3xl shadow-2xl shadow-black/50">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                        <div className="relative p-6 rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/20 bg-gradient-to-br from-primary/20 to-transparent">
                            <Construction className="h-16 w-16" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="flex justify-center text-5xl md:text-7xl font-bold font-display tracking-tight drop-shadow-2xl">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 pb-2 pr-4 pl-4 select-none">
                                MAINTENANCE
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                            {message || "Our digital realm is currently undergoing cosmic realignment."}
                            <span className="block mt-2 text-primary/80 font-bold tracking-wide uppercase text-sm">System Update in Progress</span>
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden relative">
                            <div
                                className="h-full bg-primary absolute top-0 left-0 transition-all duration-1000"
                                style={{ width: `${progress || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}