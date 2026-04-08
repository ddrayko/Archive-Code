"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { Loader2, Send, CheckCircle2, Star } from "lucide-react"
import { toast } from "sonner"
import Script from "next/script"

import { submitFeedback } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          theme?: "light" | "dark" | "auto"
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACcfmOPbbmFHrfYq"

export function FeedbackForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [rating, setRating] = useState(5)
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [pendingFormValues, setPendingFormValues] = useState<Record<string, string> | null>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(
      Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => [key, String(value)])
    )
    values.rating = String(rating)
    setPendingFormValues(values)
    setShowTurnstile(true)
  }

  const finalizeSubmit = async (turnstileToken: string) => {
    if (!pendingFormValues) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(pendingFormValues).forEach(([key, value]) => formData.set(key, value))
      formData.set("cf-turnstile-response", turnstileToken)

      const result = await submitFeedback(formData)
      if (!result.success) {
        toast.error(result.error || "Unable to send feedback")
        if (window.turnstile && widgetId) {
          window.turnstile.reset(widgetId)
        }
        return
      }

      toast.success("Feedback sent")
      setIsSuccess(true)
      const formElement = document.getElementById("feedback-form") as HTMLFormElement | null
      formElement?.reset()
      setRating(5)
      setPendingFormValues(null)
      setShowTurnstile(false)
      if (window.turnstile && widgetId) {
        window.turnstile.remove(widgetId)
      }
      setWidgetId(null)
    } catch (error) {
      console.error("Feedback submit error:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!showTurnstile || !isScriptReady || !containerRef.current || !window.turnstile || widgetId) return

    const id = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token: string) => {
        void finalizeSubmit(token)
      },
      "expired-callback": () => {
        toast.error("Verification expired, please try again")
      },
      "error-callback": () => {
        toast.error("Cloudflare verification error")
      },
    })
    setWidgetId(id)
  }, [showTurnstile, isScriptReady, widgetId])

  const closeTurnstile = () => {
    if (isLoading) return
    if (window.turnstile && widgetId) {
      window.turnstile.remove(widgetId)
    }
    setWidgetId(null)
    setShowTurnstile(false)
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-5 py-10">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight">Thanks for your feedback</h3>
          <p className="text-muted-foreground">Your feedback has been saved in the system.</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => setIsSuccess(false)}>
          Send another feedback
        </Button>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
      />

      {isClient && showTurnstile && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-sm v4-glass border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/40">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Cloudflare verification</p>
            <p className="text-sm text-muted-foreground">Complete the security check to send your feedback.</p>
            <div className="min-h-[66px] flex items-center justify-center">
              <div ref={containerRef} />
            </div>
            <Button type="button" variant="ghost" onClick={closeTurnstile} disabled={isLoading} className="w-full">
              Cancel
            </Button>
          </div>
        </div>,
        document.body
      )}

      <form id="feedback-form" onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" name="name" placeholder="Your name" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input id="email" name="email" type="email" placeholder="ton@email.com" className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Overall rating</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-1"
                aria-label={`Give ${value} stars`}
              >
                <Star className={`w-6 h-6 ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="positive_points">What works well</Label>
          <Textarea
            id="positive_points"
            name="positive_points"
            required
            placeholder="Ex: design, fluidity, projects..."
            className="min-h-28 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative_points">What needs improvement</Label>
          <Textarea
            id="negative_points"
            name="negative_points"
            required
            placeholder="Ex: navigation, readability, performance..."
            className="min-h-28 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_comment">Additional comment (optional)</Label>
          <Textarea
            id="additional_comment"
            name="additional_comment"
            placeholder="Add details if needed"
            className="min-h-24 rounded-xl"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send feedback
            </>
          )}
        </Button>
      </form>
    </>
  )
}

