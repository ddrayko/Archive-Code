import { Cookie, Settings, Info, ToggleLeft, Trash2 } from "lucide-react"
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
        title: `Cookie Policy - ${brand}`,
        description: `Learn about how ${brand} uses cookies and similar technologies.`
    }
}

export default async function CookiePolicyPage() {
    const { developerName } = await getSiteSettings()
    const brand = normalizeDeveloperName(developerName)
    const sections = [
        {
            icon: Info,
            title: "What Are Cookies",
            content: [
                "Cookies are small text files that are placed on your computer or mobile device when you visit a website.",
                "They are widely used to make websites work more efficiently and provide information to the owners of the site.",
                "Cookies help us understand how you use our website and improve your experience."
            ]
        },
        {
            icon: Settings,
            title: "How We Use Cookies",
            content: [
                "Essential cookies: Required for the website to function properly",
                "Performance cookies: Help us understand how visitors interact with our website",
                "Functionality cookies: Remember your preferences and settings",
                "Analytics cookies: Collect information about how you use our website to help us improve it"
            ]
        },
        {
            icon: ToggleLeft,
            title: "Managing Cookies",
            content: [
                "Most web browsers allow you to control cookies through their settings preferences.",
                "You can set your browser to refuse cookies or delete certain cookies.",
                "Please note that if you disable cookies, some features of our website may not function properly.",
                "You can find more information about how to manage cookies in your browser's help section."
            ]
        },
        {
            icon: Trash2,
            title: "Third-Party Cookies",
            content: [
                "We may use third-party services that also set cookies on your device.",
                "These cookies are used for analytics, advertising, and other purposes.",
                "We do not have control over these third-party cookies.",
                "Please refer to the privacy policies of these third-party services for more information."
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
                        <Cookie className="w-3 h-3" />
                        Legal
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">
                        COOKIE <span className="text-primary">POLICY.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Last updated: <span className="text-primary font-bold">January 16, 2026</span>
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-16">
                    <div className="v4-glass p-8 rounded-[2rem] border-white/5">
                        <p className="text-muted-foreground/70 leading-relaxed">
                            This Cookie Policy explains how {brand} uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
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
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Questions About Cookies?</h3>
                        <p className="text-muted-foreground/70 mb-6">
                            If you have any questions about our use of cookies, please contact us at{" "}
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
