import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Info } from "lucide-react"

export default function V2Page() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-2xl w-full v4-card p-8 space-y-6 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Code className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Version 2</h1>
                        <p className="text-muted-foreground">Deploy Vercel Error</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                This version has a deployment error on Vercel.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Please visit version 4, which is the most recent and functional version.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to version 4
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}