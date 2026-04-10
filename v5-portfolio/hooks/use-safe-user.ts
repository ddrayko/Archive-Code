"use client"

import { useUser as useClerkUser, type UserResource } from "@clerk/nextjs"

type SafeUser = {
  hasProvider: boolean
  isLoaded: boolean
  isSignedIn: boolean | null
  user: UserResource | null
}

/**
 * A defensive wrapper around Clerk's useUser that falls back to a
 * guest user when the ClerkProvider isn't available (e.g. during
 * static prerendering without env keys). This keeps build-time
 * rendering from crashing while preserving real auth in the browser.
 */
export function useSafeUser(): SafeUser {
  try {
    const user = useClerkUser()
    return { hasProvider: true, ...user }
  } catch {
    return {
      hasProvider: false,
      isLoaded: true,
      isSignedIn: null,
      user: null,
    }
  }
}
