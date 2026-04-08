"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Clock3, Loader2, Search, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"

import type { Feedback } from "@/lib/types"
import { deleteFeedback, markFeedbackAsCorrected } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdminFeedbackListProps {
  initialFeedbacks: Feedback[]
}

export function AdminFeedbackList({ initialFeedbacks }: AdminFeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "corrected">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false
      }

      const query = search.toLowerCase()
      if (!query) {
        return true
      }

      return [item.name, item.email, item.positive_points, item.negative_points, item.additional_comment]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [feedbacks, search, statusFilter])

  const countNew = feedbacks.filter((item) => item.status === "new").length

  const handleToggleStatus = async (item: Feedback) => {
    const nextIsCorrected = item.status !== "corrected"
    setUpdatingId(item.id)

    try {
      const result = await markFeedbackAsCorrected(item.id, nextIsCorrected)
      if (!result.success) {
        toast.error("Update failed")
        return
      }

      setFeedbacks((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: nextIsCorrected ? "corrected" : "new",
                corrected_at: nextIsCorrected ? new Date().toISOString() : null,
              }
            : entry
        )
      )

      toast.success(nextIsCorrected ? "Feedback marked as fixed" : "Feedback marked as new again")
    } catch (error) {
      console.error("Feedback status update error:", error)
      toast.error("An error occurred")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteFeedback = async (item: Feedback) => {
    const confirmed = window.confirm("Delete this feedback permanently?")
    if (!confirmed) return

    setDeletingId(item.id)
    try {
      const result = await deleteFeedback(item.id)
      if (!result.success) {
        toast.error("Delete failed")
        return
      }

      setFeedbacks((prev) => prev.filter((entry) => entry.id !== item.id))
      toast.success("Feedback deleted")
    } catch (error) {
      console.error("Feedback delete error:", error)
      toast.error("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="v4-card rounded-[2rem] border-white/5 p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{feedbacks.length} total</Badge>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/20">{countNew} new</Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback"
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>All</Button>
            <Button size="sm" variant={statusFilter === "new" ? "default" : "outline"} onClick={() => setStatusFilter("new")}>New</Button>
            <Button size="sm" variant={statusFilter === "corrected" ? "default" : "outline"} onClick={() => setStatusFilter("corrected")}>Fixed</Button>
          </div>
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="v4-card rounded-[2rem] border-white/5 p-12 text-center text-muted-foreground">
          No feedback to display.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredFeedbacks.map((item) => {
            const createdAt = new Date(item.created_at)
            const createdLabel = Number.isNaN(createdAt.getTime())
              ? "Unknown date"
              : formatDistanceToNow(createdAt, { addSuffix: true, locale: enUS })

            const isCorrected = item.status === "corrected"

            return (
              <article key={item.id} className="v4-card rounded-[2rem] border-white/5 p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold truncate">{item.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.email || "No email"}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock3 className="w-3.5 h-3.5" />
                      {createdLabel}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.rating}/5</Badge>
                    {isCorrected ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">Fixed</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/20">New</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary/80 mb-1">Strengths</p>
                    <p className="text-foreground/90 whitespace-pre-wrap">{item.positive_points}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary/80 mb-1">Needs improvement</p>
                    <p className="text-foreground/90 whitespace-pre-wrap">{item.negative_points}</p>
                  </div>

                  {item.additional_comment ? (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary/80 mb-1">Comment</p>
                      <p className="text-foreground/90 whitespace-pre-wrap">{item.additional_comment}</p>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant={isCorrected ? "outline" : "default"}
                    onClick={() => handleToggleStatus(item)}
                    disabled={updatingId === item.id || deletingId === item.id}
                    className="w-full"
                  >
                    {updatingId === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : isCorrected ? (
                      "Mark as new"
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as fixed
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteFeedback(item)}
                    disabled={deletingId === item.id || updatingId === item.id}
                    className="w-full"
                  >
                    {deletingId === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

