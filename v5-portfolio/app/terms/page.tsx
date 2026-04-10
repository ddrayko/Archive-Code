import { FileText, Scale, UserCheck, AlertTriangle, Ban } from "lucide-react"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"
import type { Metadata } from "next"
import { getSiteSettings } from "@/lib/actions"
import { normalizeDeveloperName } from "@/lib/site-settings"

export async function generateMetadata(): Promise<Metadata> {
    const { developerName } = await getSiteSettings()
    const brand = normalizeDeveloperName(developerName)
    return {
        title: `Terms of Service - ${brand}`,
        description: `Read the terms and conditions for using ${brand}'s services.`
    }
}

export default async function TermsPage() {
    const { developerName } = await getSiteSettings()
    const brand = normalizeDeveloperName(developerName)
    const sections = [
        {
            icon: UserCheck,
            title: "Acceptance of Terms",
            content: [
                "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
                "If you do not agree to abide by the above, please do not use this service.",
                "We reserve the right to modify these terms at any time. Your continued use of the website following any changes constitutes acceptance of those changes."
            ]
        },
        {
            icon: Scale,
            title: "Use License",
            content: [
                `Permission is granted to temporarily download one copy of the materials on ${brand}'s website for personal, non-commercial transitory viewing only.`,
                "This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained on the website.",
                `This license shall automatically terminate if you violate any of these restrictions and may be terminated by ${brand} at any time.`
            ]
        },
        {
            icon: AlertTriangle,
            title: "Disclaimer",
            content: [
                `The materials on ${brand}'s website are provided on an 'as is' basis. ${brand} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`,
                `${brand} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.`
            ]
        },
        {
            icon: Ban,
            title: "Limitations",
            content: [
                `In no event shall ${brand} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ${brand}'s website.`,
                "Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you."
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden font-sans selection:bg-primary/30 selection:text-primary">
            <div className="noise-v4" />
            <div className="mesh-v4 fixed inset-0 pointer-events-none" />

            <V4Navbar />

            <main className="relative z-10 pt-40 pb-32 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mx-auto">
                        <FileText className="w-3 h-3" />
                        Legal
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        TERMS OF <span className="text-primary">SERVICE.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Last updated: <span className="text-primary font-bold">January 16, 2026</span>
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-16">
                    <div className="v4-glass p-8 rounded-[2rem] border-white/5">
                        <p className="text-muted-foreground/70 leading-relaxed">
                            Please read these Terms of Service carefully before using our website. These terms govern your access to and use of {brand}'s services. By using our services, you agree to be bound by these terms.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon
                        return (
                            <div key={index} className="v4-glass p-8 rounded-[2rem] border-white/5 group hover:border-primary/30 transition-all duration-500">
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                                        <IconComponent className="h-7 w-7 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase italic pt-2">{section.title}</h2>
                                </div>
                                <ul className="space-y-4 pl-20">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/20 border border-primary/30 mt-2 flex-shrink-0" />
                                            <p className="text-muted-foreground/60 leading-relaxed">{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>

                <div className="max-w-4xl mx-auto mt-16">
                    <div className="v4-glass p-8 rounded-[2rem] border-white/5 bg-primary/5 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Questions About These Terms?</h3>
                        <p className="text-muted-foreground/70 mb-6">
                            If you have any questions about these Terms of Service, please contact us at{" "}
                            <a href="mailto:admin@drayko.xyz" className="text-primary hover:underline font-bold">
                                admin@drayko.xyz
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            <V4Footer />
            <V4Dock />
        </div>
    )
}
