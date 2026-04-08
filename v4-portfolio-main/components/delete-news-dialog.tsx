"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteNews } from "@/lib/actions"

interface DeleteNewsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    newsId: string
    newsTitle: string
    onDeleted?: (newsId: string) => void
}

export function DeleteNewsDialog({
    open,
    onOpenChange,
    newsId,
    newsTitle,
    onDeleted,
}: DeleteNewsDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteNews(newsId)

        if (result.success) {
            onDeleted?.(newsId)
            onOpenChange(false)
        }

        setIsDeleting(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#05080C]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">Delete this news item?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Are you sure you want to delete "{newsTitle}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-white/10 bg-white/5">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
