"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { ErrorModeScreen } from "@/components/error-mode-screen"

interface ErrorModeGateProps {
  enabled: boolean
  message?: string
  children: ReactNode
}

export function ErrorModeGate({ enabled, message, children }: ErrorModeGateProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  if (!isAdminRoute && enabled) {
    return <ErrorModeScreen message={message} pathname={pathname} />
  }

  return <>{children}</>
}
