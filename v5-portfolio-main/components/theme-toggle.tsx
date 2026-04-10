"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl glass border-white/10 opacity-50">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const current = theme === "system" ? "system" : theme === "dark" ? "dark" : "light"
  const nextTheme = current === "light" ? "dark" : current === "dark" ? "system" : "light"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="h-10 w-10 rounded-xl glass border-white/10 hover:bg-white/5 transition-all duration-500 group"
      title={`Theme: ${current}`}
    >
      <div className="relative h-5 w-5">
        <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${current === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`} />
        <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${current === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
        <Monitor className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${current === "system" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
