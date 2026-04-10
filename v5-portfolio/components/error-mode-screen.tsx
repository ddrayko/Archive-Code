import { AlertTriangle } from "lucide-react"
import { Footer } from "react-day-picker"
import { V4Footer } from "./v4/V4Footer"

interface ErrorModeScreenProps {
  message?: string
  pathname?: string
}

export function ErrorModeScreen({ message, pathname }: ErrorModeScreenProps) {
  const isHome = pathname === "/"
  const fallbackMessage =
    "The site is overloaded or under temporary maintenance. Please try again in a few minutes. If the issue persists, feel free to contact me at hello@drayko.xyz."

  return (
    <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 sm:px-6">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl v4-glass rounded-[2.5rem] p-8 sm:p-12 border border-white/10 shadow-2xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
          Overload detected
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {message && message.trim().length > 0 ? message : fallbackMessage}
        </p>
      </div>
    </div>
  )
}

<V4Footer />
