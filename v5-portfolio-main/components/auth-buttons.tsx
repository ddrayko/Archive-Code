"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function AuthButtons() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && userId) {
      // Force a refresh when user signs in to update the UI
      router.refresh()
    }
  }, [isLoaded, userId, router])

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal" fallbackRedirectUrl="/">
          <Button variant="outline" size="sm" className="rounded-xl glass border-white/5 text-[10px] font-black uppercase tracking-widest px-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            Se connecter
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  )
}