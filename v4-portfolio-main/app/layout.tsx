import { Suspense, type ReactNode } from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script"
import dynamic from "next/dynamic"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkThemeProvider } from "@/components/clerk-theme-provider"
import { Toaster } from "sonner"
import { getErrorMode, getSiteSettings } from "@/lib/actions"
import { normalizeDeveloperName } from "@/lib/site-settings"
import { RouteTransitionProvider } from "@/components/route-transition"
import { SiteSettingsProvider } from "@/components/site-settings-provider"
import { PerformanceModeProvider } from "@/components/performance-mode-provider"
import { ErrorModeGate } from "@/components/error-mode-gate"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const SpecialThemeHandler = dynamic(
  () => import("@/components/special-theme-handler").then((mod) => mod.SpecialThemeHandler)
)
const PWAInstaller = dynamic(
  () => import("@/components/pwa-installer").then((mod) => mod.PWAInstaller)
)
const PerformanceFloatingToggle = dynamic(
  () => import("@/components/performance-floating-toggle").then((mod) => mod.PerformanceFloatingToggle)
)

export async function generateMetadata(): Promise<Metadata> {
  const { developerName } = await getSiteSettings()
  const name = normalizeDeveloperName(developerName)

  return {
    title: `${name} - Creative Developer`,
    description: `Portfolio of ${name}, a Creative Developer & Designer specializing in high-performance digital experiences.`,
    manifest: "/manifest.webmanifest",
    generator: "v0.app",
    other: {
      "google-adsense-account": "ca-pub-3145023750951462",
      "monetag": "ad42aaa7976ba5b3bbe06af8ece11ba3"
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const [errorMode, siteSettings] = await Promise.all([getErrorMode(), getSiteSettings()])
  const { developerName } = siteSettings
  const isProd = process.env.NODE_ENV === "production"

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased selection:bg-primary/30 selection:text-primary transition-colors duration-300" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteSettingsProvider developerName={developerName}>
          <PerformanceModeProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme">
              <ClerkThemeProvider>
                <SpecialThemeHandler />
                {isProd && <PWAInstaller />}
                <PerformanceFloatingToggle />
                <Toaster position="top-right" richColors />
                <div className="relative flex min-h-screen flex-col">
                  <div id="main-content" className="flex-1" tabIndex={-1}>
                    <ErrorModeGate enabled={errorMode.isErrorMode} message={errorMode.message}>
                      <Suspense fallback={children}>
                        <RouteTransitionProvider>{children}</RouteTransitionProvider>
                      </Suspense>
                    </ErrorModeGate>
                  </div>
                </div>
              {isProd && (
                <>
                  <Analytics />
                  <SpeedInsights />
                  <Script
                    id="umami"
                    strategy="lazyOnload"
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id="43ced19b-1c79-4c9a-abff-4f4e0b5dd798"
                  />
                  <Script
                    id="gtag-loader"
                    strategy="lazyOnload"
                    src="https://www.googletagmanager.com/gtag/js?id=G-HN2Q6BTFCB"
                  />
                  <Script id="gtag-init" strategy="lazyOnload">
                    {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-HN2Q6BTFCB');`}
                  </Script>
                  <Script id="statcounter-config" strategy="lazyOnload">
                    {`var sc_project=13204241; var sc_invisible=1; var sc_security="4d852cb5";`}
                  </Script>
                  <Script id="statcounter-loader" strategy="lazyOnload" src="https://www.statcounter.com/counter/counter.js" />
                  <noscript>
                    <div className="statcounter" style={{ position: "absolute", left: "-9999px", width: 0, height: 0, overflow: "hidden" }}>
                      <a title="site stats" href="https://statcounter.com/" target="_blank" rel="noreferrer">
                        <img
                          className="statcounter"
                          src="https://c.statcounter.com/13204241/0/4d852cb5/1/"
                          alt="site stats"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </a>
                    </div>
                  </noscript>
                </>
              )}
              </ClerkThemeProvider>
            </ThemeProvider>
          </PerformanceModeProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
