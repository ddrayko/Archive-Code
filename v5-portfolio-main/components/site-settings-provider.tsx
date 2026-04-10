"use client"

import { createContext, useContext, useMemo } from "react"
import { DEFAULT_DEVELOPER_NAME, normalizeDeveloperName } from "@/lib/site-settings"

type SiteSettingsContextValue = {
  developerName: string
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  developerName: DEFAULT_DEVELOPER_NAME,
})

export function SiteSettingsProvider({
  developerName,
  children,
}: {
  developerName?: string | null
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({ developerName: normalizeDeveloperName(developerName) }),
    [developerName]
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
