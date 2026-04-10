"use client"

import { PerformanceToggle } from "@/components/performance-toggle"

export function PerformanceFloatingToggle() {
  return (
    <div className="fixed left-4 bottom-4 z-[130]">
      <PerformanceToggle />
    </div>
  )
}
