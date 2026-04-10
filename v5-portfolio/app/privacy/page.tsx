import { Shield, Lock, Eye, Database, Mail } from "lucide-react"
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
        title: `Privacy Policy - ${brand}`,
        description: `Learn how ${brand} collects, uses, and protects your personal information.`
    }
}

export default async function PrivacyPolicyPage() {
    const { developerName } = await getSiteSettings()
    const brand = normalizeDeveloperName(developerName)
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us.",
                "We automatically collect certain information about your device when you use our services, including IP address, browser type, and usage data.",
                "We use cookies and similar tracking technologies to collect information about your browsing activities."
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "To provide, maintain, and improve our services",
                "To communicate with you about updates, security alerts, and support messages",
                "To monitor and analyze trends, usage, and activities in connection with our services",
                "To detect, prevent, and address technical issues and security threats"
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "We implement appropriate technical and organizational measures to protect your personal information.",
                "We use encryption for data transmission and storage where appropriate.",
                "Access to personal information is restricted to authorized personnel only.",
                "We regularly review and update our security practices to ensure data protection."
            ]
        },
        {
            icon: Mail,
            title: "Your Rights",
            content: [
                "You have the right to access, update, or delete your personal information.",
                "You can opt-out of receiving promotional communications from us.",
                "You can request a copy of the personal data we hold about you.",
                "You can object to the processing of your personal information in certain circumstances."
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
                        <Shield className="w-3 h-3" />
                        Legal
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        PRIVACY <span className="text-primary">POLICY.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Last updated: <span className="text-primary font-bold">January 16, 2026</span>
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-16">
                    <div className="v4-glass p-8 rounded-[2rem] border-white/5">
                        <p className="text-muted-foreground/70 leading-relaxed">
                            This Privacy Policy describes how {brand} ("we", "us", or "our") collects, uses, and shares your personal information when you use our website and services. We are committed to protecting your privacy and ensuring the security of your personal data.
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
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Questions About Privacy?</h3>
                        <p className="text-muted-foreground/70 mb-6">
                            If you have any questions about this Privacy Policy, please contact us at{" "}
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
