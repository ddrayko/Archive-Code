"use client"

import { useState, useTransition } from "react"
import { subscribeNewsletter } from "@/lib/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [pending, startTransition] = useTransition()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append("email", email)

    startTransition(async () => {
      const result = await subscribeNewsletter(formData)
      if (!result.success) {
        toast.error(result.error || "Subscription failed")
        return
      }
      toast.success(result.alreadySubscribed ? "Already subscribed" : "Subscribed successfully")
      setEmail("")
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        className="h-11 rounded-xl bg-white/5 border-white/10"
      />
      <Button
        type="submit"
        disabled={pending || !email.trim()}
        className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        {pending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  )
}
