"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectForm } from "@/components/project-form"
import type { Project } from "@/lib/types"

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSuccess?: () => void
}

export function ProjectDialog({ open, onOpenChange, project, onSuccess }: ProjectDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[#05080C]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem]">
        <div className="px-8 pt-8 pb-4 bg-[#05080C]/40 backdrop-blur-md border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-white">{project ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              {project ? "Update the project details below." : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-hidden px-8 pb-8">
          <ProjectForm project={project} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}