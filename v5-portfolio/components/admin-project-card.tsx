"use client"

import { useState } from "react"
import type { Project } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Settings2, ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProjectDialog } from "@/components/project-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"

interface AdminProjectCardProps {
  project: Project
  onDeleted?: (projectId: string) => void
  onUpdated?: () => void
}

export function AdminProjectCard({ project, onDeleted, onUpdated }: AdminProjectCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="group relative rounded-3xl overflow-hidden glass border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col h-full bg-card/20">
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 rounded-full glass border-white/10 backdrop-blur-md">
            <Settings2 className="h-4 w-4 text-primary animate-spin-slow" />
          </div>
        </div>

        <div className="relative w-full aspect-video bg-muted/20 overflow-hidden border-b border-white/5">
          {project.image_url ? (
            <>
              <Image src={project.image_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors duration-500">
              <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/5 group-hover:border-primary/20 transition-all duration-500">
                <ImageOff className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/40 transition-colors duration-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 group-hover:text-primary/40 transition-colors duration-500">
                No preview image
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold tracking-tight text-foreground/90">{project.title}</h4>
              {project.in_development && (
                <Link href="/tags-info" className="hover:scale-110 transition-transform duration-300">
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] animate-pulse cursor-pointer">
                    Dev Mode
                  </Badge>
                </Link>
              )}
              {project.is_completed && (
                <Link href="/tags-info" className="hover:scale-110 transition-transform duration-300">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] cursor-pointer">
                    Finished
                  </Badge>
                </Link>
              )}
              {project.is_archived && (
                <Link href="/tags-info" className="hover:scale-110 transition-transform duration-300">
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] cursor-pointer">
                    Archived
                  </Badge>
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full bg-white/5 border-white/5 text-[9px] uppercase tracking-tighter">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3 pt-4 mt-auto">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="flex-1 rounded-full border border-white/10 glass hover:bg-white/10 hover:text-foreground font-bold transition-all">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="flex-1 rounded-full shadow-lg shadow-destructive/20 font-bold transition-all">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} onSuccess={onUpdated} />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={project.id}
        projectTitle={project.title}
        onDeleted={onDeleted}
      />
    </>
  )
}
