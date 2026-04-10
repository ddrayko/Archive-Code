"use client"

import { Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePerformanceMode } from "@/components/performance-mode-provider"

export function PerformanceToggle() {
  const { performanceMode, setPerformanceMode } = usePerformanceMode()

  return (
    <Button
      type="button"
      variant={performanceMode ? "default" : "outline"}
      size="sm"
      onClick={() => setPerformanceMode(!performanceMode)}
      className="rounded-xl text-[10px] font-black uppercase tracking-widest"
    >
      <Gauge className="w-3.5 h-3.5 mr-2" />
      {performanceMode ? "Perf On" : "Perf Off"}
    </Button>
  )
}
