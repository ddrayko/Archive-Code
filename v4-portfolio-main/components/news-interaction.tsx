"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleLikeNews } from "@/lib/actions"
import { useUser, SignInButton } from "@clerk/nextjs"
import { toast } from "sonner"

interface NewsInteractionProps {
    newsId: string
    initialLikes: string[]
    commentCount: number
}

export function NewsInteraction({ newsId, initialLikes, commentCount }: NewsInteractionProps) {
    const { user, isLoaded } = useUser()
    const [likes, setLikes] = useState(initialLikes)
    const [isLiking, setIsLiking] = useState(false)

    const hasLiked = user ? likes.includes(user.id) : false

    const handleLike = async () => {
        if (!user) {
            toast.error("Please sign in to like")
            return
        }

        setIsLiking(true)
        const result = await toggleLikeNews(newsId)

        if (result.success) {
            if (result.liked) {
                setLikes([...likes, user.id])
            } else {
                setLikes(likes.filter(id => id !== user.id))
            }
        } else {
            toast.error(result.error || "An error occurred")
        }
        setIsLiking(false)
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
    }

    return (
        <div className="flex items-center gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`rounded-full h-12 px-6 flex items-center gap-2 transition-all ${hasLiked
                            ? "bg-primary/20 text-primary border border-primary/20"
                            : "v4-glass hover:bg-white/10 text-muted-foreground"
                        }`}
                >
                    <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
                    <span className="font-black text-xs uppercase tracking-widest">{likes.length}</span>
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-full h-12 px-6 flex items-center gap-2 v4-glass hover:bg-white/10 text-muted-foreground"
                >
                    <a href="#comments">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-black text-xs uppercase tracking-widest">{commentCount}</span>
                    </a>
                </Button>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full h-12 w-12 v4-glass hover:bg-white/10 text-muted-foreground ml-auto"
            >
                <Share2 className="h-5 w-5" />
            </Button>
        </div>
    )
}
