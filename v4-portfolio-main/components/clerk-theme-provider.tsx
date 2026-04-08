"use client"

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>
  }

  if (!mounted) {
    return (
      <ClerkProvider>
        {children}
      </ClerkProvider>
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? '#60a5fa' : '#2563eb',
          colorBackground: isDark ? '#0f172a' : '#ffffff',
          colorInputBackground: isDark ? '#1e293b' : '#f8fafc',
          colorInputText: isDark ? '#f1f5f9' : '#0f172a',
          colorText: isDark ? '#f1f5f9' : '#0f172a',
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
