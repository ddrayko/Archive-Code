"use client"

import { useState } from "react"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment, deleteComment, toggleCommentLike } from "@/lib/actions"
import type { NewsComment } from "@/lib/types"
import { toast } from "sonner"
import { ArrowUpDown, Heart, MessageCircle, Send, Trash2, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import Image from "next/image"

interface NewsCommentsProps {
    newsId: string
    initialComments: NewsComment[]
}

export function NewsComments({ newsId, initialComments }: NewsCommentsProps) {
    const { user, isLoaded } = useUser()
    const [comments, setComments] = useState(initialComments)
    const [content, setContent] = useState("")
    const [honeypot, setHoneypot] = useState("")
    const [sortBy, setSortBy] = useState<"newest" | "top">("newest")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (!content.trim()) return

        setIsSubmitting(true)
        const result = await addComment(newsId, content, honeypot)

        if (result.success) {
            // Optimistic update or just refresh
            // Since revalidatePath is used, we might want to just clear and local update
            const newComment: NewsComment = {
                id: Math.random().toString(), // Temp ID
                news_id: newsId,
                user_id: user.id,
                user_name: user.fullName || user.username || "Anonymous",
                user_image: user.imageUrl,
                content: content,
                created_at: new Date().toISOString(),
            }
            setComments([newComment, ...comments])
            setContent("")
            setHoneypot("")
            toast.success("Comment added!")
        } else {
            toast.error(result.error || "An error occurred")
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        const result = await deleteComment(commentId, newsId)
        if (result.success) {
            setComments(comments.filter(c => c.id !== commentId))
            toast.success("Comment deleted")
        } else {
            toast.error(result.error || "An error occurred")
        }
    }

    const handleLike = async (commentId: string) => {
        if (!user) return
        const result = await toggleCommentLike(newsId, commentId)
        if (!result.success) {
            toast.error(result.error || "Could not like comment")
            return
        }

        setComments((prev) =>
            prev.map((comment) => {
                if (comment.id !== commentId) return comment
                const currentLikes = comment.likes || []
                const hasLiked = currentLikes.includes(user.id)
                return {
                    ...comment,
                    likes: hasLiked ? currentLikes.filter((id) => id !== user.id) : [...currentLikes, user.id],
                }
            })
        )
    }

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === "top") {
            const likesA = a.likes?.length || 0
            const likesB = b.likes?.length || 0
            if (likesA !== likesB) return likesB - likesA
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return (
        <section id="comments" className="space-y-12">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">Discussion</h3>
            </div>

            <div className="v4-glass p-8 rounded-[2.5rem] border-white/10 space-y-8">
                {!isLoaded ? (
                    <div className="h-20 animate-pulse bg-white/5 rounded-2xl" />
                ) : user ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                <Image src={user.imageUrl} alt={user.fullName || "User"} fill className="object-cover" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Posting as {user.firstName}</span>
                        </div>
                        <Textarea
                            placeholder="Share your thoughts on this update..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[120px] rounded-3xl border-white/10 bg-white/5 focus:bg-white/10 transition-colors p-6 text-sm"
                            required
                        />
                        <input
                            type="text"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="rounded-full h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? "Sending..." : (
                                    <span className="flex items-center gap-2">
                                        <Send className="h-3.5 w-3.5" />Post comment</span>
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="p-10 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.01] text-center space-y-6">
                        <div className="space-y-2">
                            <p className="text-lg font-bold uppercase italic tracking-tight">Join the conversation</p>
                            <p className="text-muted-foreground text-sm font-medium">Sign in to share your thoughts.</p>
                        </div>
                        <SignInButton mode="modal">
                            <Button className="rounded-full h-12 px-8 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-white/90">Sign in</Button>
                        </SignInButton>
                    </div>
                )}

                <div className="space-y-8 pt-8 border-t border-white/5">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setSortBy((prev) => (prev === "newest" ? "top" : "newest"))}
                        >
                            <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                            {sortBy === "newest" ? "Newest" : "Top"}
                        </Button>
                    </div>
                    {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground font-medium py-10 italic">
                            No comments yet. Be the first to respond!
                        </p>
                    ) : (
                        sortedComments.map((comment) => (
                            <div key={comment.id} className="flex gap-6 group">
                                <div className="grow-0">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden glass border-white/10 relative">
                                        {comment.user_image ? (
                                            <Image src={comment.user_image} alt={comment.user_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-muted-foreground">
                                                <User className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-x-3">
                                            <span className="text-sm font-black uppercase tracking-tight text-white">{comment.user_name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: enUS })}
                                            </span>
                                        </div>
                                        {user?.id === comment.user_id && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 rounded-lg text-muted-foreground/0 group-hover:text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                                        {comment.content}
                                    </p>
                                    <div className="pt-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 rounded-lg text-xs"
                                            onClick={() => handleLike(comment.id)}
                                            disabled={!user}
                                        >
                                            <Heart className={`h-3.5 w-3.5 mr-1 ${(comment.likes || []).includes(user?.id || "") ? "fill-current text-primary" : ""}`} />
                                            {(comment.likes || []).length}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
