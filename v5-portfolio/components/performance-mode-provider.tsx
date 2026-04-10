"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type PerformanceModeContextValue = {
  performanceMode: boolean
  setPerformanceMode: (value: boolean) => void
}

const PerformanceModeContext = createContext<PerformanceModeContextValue>({
  performanceMode: false,
  setPerformanceMode: () => {},
})

const STORAGE_KEY = "performance-mode"

export function PerformanceModeProvider({ children }: { children: React.ReactNode }) {
  const [performanceMode, setPerformanceModeState] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const enabled = saved === "true"
      setPerformanceModeState(enabled)
      document.documentElement.classList.toggle("performance-mode", enabled)
    } catch {
      // Ignore storage errors.
    }
  }, [])

  const setPerformanceMode = (value: boolean) => {
    setPerformanceModeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value ? "true" : "false")
    } catch {
      // Ignore storage errors.
    }
    document.documentElement.classList.toggle("performance-mode", value)
  }

  const value = useMemo(
    () => ({ performanceMode, setPerformanceMode }),
    [performanceMode]
  )

  return (
    <PerformanceModeContext.Provider value={value}>
      {children}
    </PerformanceModeContext.Provider>
  )
}

export function usePerformanceMode() {
  return useContext(PerformanceModeContext)
}
