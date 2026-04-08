import { History, Rocket, Calendar } from "lucide-react"
import { getFirestoreServer } from "@/lib/firebase/server"
import { doc, getDoc } from "firebase/firestore"
import type { SiteUpdate } from "@/lib/types"
import { Countdown } from "@/components/countdown"
import { ChangelogList } from "@/components/changelog-list"
import { getMaintenanceMode } from "@/lib/actions"
import { redirect } from "next/navigation"
import { isLocalRequest } from "@/lib/server-utils"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"

export const dynamic = "force-dynamic"

export default async function UpdatePage() {
    const isLocal = await isLocalRequest()
    if (!isLocal) {
        const { isMaintenance } = await getMaintenanceMode()
        if (isMaintenance) {
            redirect("/maintenance")
        }
    }

    const db = await getFirestoreServer()
    const docRef = doc(db, "update-p", "main")
    const docSnap = await getDoc(docRef)

    const updateData = docSnap.exists()
        ? (docSnap.data() as SiteUpdate)
        : {
            next_update_date: null,
            no_update_planned: true,
            planned_features: [],
            changelog: []
        }

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-32 container max-w-4xl mx-auto px-6 space-y-12">
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                        <History className="w-3 h-3" />
                        Roadmap
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        SYSTEM <span className="text-primary">ROADMAP.</span>
                    </h1>
                </div>

                <section>
                    <div className="v4-glass p-10 md:p-16 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                                <Rocket className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic">NEXT EVOLUTION</h2>
                                <p className="text-muted-foreground/70 font-medium text-lg">Predicting the future of the digital ecosystem.</p>
                            </div>

                            <div className="pt-4 w-full">
                                {updateData.no_update_planned || !updateData.next_update_date ? (
                                    <div className="v4-glass bg-white/5 border-white/10 p-8 rounded-[2.5rem] max-w-md mx-auto">
                                        <div className="flex items-center justify-center gap-3 text-muted-foreground mb-2">
                                            <Calendar className="h-5 w-5" />
                                            <span className="font-bold tracking-widest uppercase text-xs">Status</span>
                                        </div>
                                        <div className="text-2xl font-black tracking-tighter italic text-muted-foreground/50">
                                            No updates planned
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-center gap-3 text-primary">
                                            <Calendar className="h-4 w-4" />
                                            <span className="font-bold tracking-widest uppercase text-xs">Countdown to Deployment</span>
                                        </div>
                                        <Countdown targetDate={updateData.next_update_date} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="text-primary font-bold tracking-widest text-xs uppercase">History</div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic">VERSION LOGS</h2>
                    </div>

                    <ChangelogList entries={updateData.changelog} />
                </section>
            </main>

            <V4Footer />
            <V4Dock />
        </div>
    )
}