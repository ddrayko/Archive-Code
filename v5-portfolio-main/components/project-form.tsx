"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project, ChangelogEntry } from "@/lib/types"
import { createProject, updateProject } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Calendar, GitBranch, ListPlus, Settings2, Sparkles, LayoutGrid, History, Save, ChevronUp, ChevronDown, Play, Pause } from "lucide-react"

interface ProjectFormProps {
  project?: Project
  onSuccess?: () => void
}

type FormTab = "details" | "updates"

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FormTab>("details")

  const [inDev, setInDev] = useState(project?.in_development || false)
  const [developmentStatus, setDevelopmentStatus] = useState<'active' | 'paused'>(project?.development_status || 'active')
  const [isCompleted, setIsCompleted] = useState(project?.is_completed || false)
  const [isArchived, setIsArchived] = useState(project?.is_archived || false)
  const [progress, setProgress] = useState(project?.development_progress || 0)
  const [requiresAuth, setRequiresAuth] = useState(project?.requires_auth || false)
  const [changelog, setChangelog] = useState<ChangelogEntry[]>(project?.changelog || [])
  const formRef = useRef<HTMLFormElement>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("changelog", JSON.stringify(changelog))
    formData.set("in_development", inDev.toString())
    formData.set("development_status", developmentStatus)
    formData.set("is_completed", isCompleted.toString())
    formData.set("is_archived", isArchived.toString())
    formData.set("development_progress", progress.toString())
    formData.set("requires_auth", requiresAuth.toString())

    try {
      const result = project ? await updateProject(project.id, formData) : await createProject(formData)

      if (!result.success) {
        setError(result.error || "An error occurred")
        setIsLoading(false)
        return
      }

      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const addChangelogEntry = () => {
    const newEntry: ChangelogEntry = {
      id: crypto.randomUUID(),
      version: "",
      date: new Date().toISOString().split("T")[0],
      changes: [""],
    }
    setChangelog([newEntry, ...changelog])
  }

  const removeChangelogEntry = (id: string) => {
    setChangelog(changelog.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof ChangelogEntry, value: any) => {
    setChangelog(
      changelog.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
  }

  const moveChangelogEntry = (index: number, direction: 'up' | 'down') => {
    const newChangelog = [...changelog]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newChangelog.length) {
      [newChangelog[index], newChangelog[targetIndex]] = [newChangelog[targetIndex], newChangelog[index]]
      setChangelog(newChangelog)
    }
  }

  const addChange = (entryId: string) => {
    setChangelog(
      changelog.map((entry) =>
        entry.id === entryId ? { ...entry, changes: [...entry.changes, ""] } : entry
      )
    )
  }

  const removeChange = (entryId: string, index: number) => {
    setChangelog(
      changelog.map((entry) =>
        entry.id === entryId
          ? { ...entry, changes: entry.changes.filter((_, i) => i !== index) }
          : entry
      )
    )
  }

  const updateChange = (entryId: string, index: number, value: string) => {
    setChangelog(
      changelog.map((entry) =>
        entry.id === entryId
          ? {
            ...entry,
            changes: entry.changes.map((change, i) => (i === index ? value : change)),
          }
          : entry
      )
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-30 bg-[#05080C]/90 backdrop-blur-xl border-b border-white/5 pb-4 mb-6">
        <div className="relative grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-[350px] mx-auto overflow-hidden">
          <div
            className="absolute h-[calc(100%-8px)] top-1 rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all duration-300 ease-out z-0"
            style={{
              left: activeTab === "details" ? "4px" : "calc(50% + 0px)",
              width: "calc(50% - 4px)"
            }}
          />

          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${activeTab === "details" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            1. PROJECT INFO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${activeTab === "updates" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <History className="h-3.5 w-3.5" />
            2. ADD UPDATES
          </button>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-8">
        <div className={`space-y-8 animate-in slide-in-from-left-8 fade-in duration-500 fill-mode-both ${activeTab !== "details" ? "hidden" : ""}`}>
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary/80">
              <Settings2 className="h-4 w-4" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em]">Core Settings</h3>
            </div>

            <div className="space-y-4 glass p-6 rounded-3xl border-white/5 bg-white/[0.01]">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                <Input id="title" name="title" defaultValue={project?.title} required className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                <Textarea id="description" name="description" defaultValue={project?.description} required rows={2} className="rounded-xl border-white/10 bg-white/5 min-h-[80px] text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Image URL</Label>
                  <Input id="image_url" name="image_url" type="url" defaultValue={project?.image_url || ""} className="h-10 rounded-xl border-white/10 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Tags</Label>
                  <Input id="tags" name="tags" defaultValue={project?.tags?.join(", ")} className="h-10 rounded-xl border-white/10 bg-white/5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_url" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Demo link</Label>
                  <Input id="project_url" name="project_url" type="url" defaultValue={project?.project_url || ""} className="h-10 rounded-xl border-white/10 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_url" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">GitHub Repo</Label>
                  <Input id="github_url" name="github_url" type="url" defaultValue={project?.github_url || ""} className="h-10 rounded-xl border-white/10 bg-white/5" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 pb-4">
            <div className="flex items-center gap-2 text-primary/80">
              <Sparkles className="h-4 w-4" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em]">Visibility Status</h3>
            </div>

            <div className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">In Development Mode</Label>
                  <p className="text-[9px] text-muted-foreground uppercase">Show development progress</p>
                </div>
                <Switch checked={inDev} onCheckedChange={setInDev} className="scale-75" />
              </div>

              {inDev && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Completion Percentage</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Slider value={[progress]} max={100} onValueChange={(val) => setProgress(val[0])} />
                  </div>

                  <div className="px-4 py-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Development Status</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDevelopmentStatus('active')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all ${developmentStatus === 'active'
                          ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                          : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                      >
                        <Play className="h-4 w-4" />
                        En cours
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevelopmentStatus('paused')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all ${developmentStatus === 'paused'
                          ? 'bg-orange-500/20 border-2 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                      >
                        <Pause className="h-4 w-4" />
                        En pause
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <Label className="text-sm font-bold">Finished</Label>
                  <Switch checked={isCompleted} onCheckedChange={setIsCompleted} className="scale-75" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <Label className="text-sm font-bold">Archived</Label>
                  <Switch checked={isArchived} onCheckedChange={setIsArchived} className="scale-75" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <Label className="text-sm font-bold">Requires Auth</Label>
                  <Switch checked={requiresAuth} onCheckedChange={setRequiresAuth} className="scale-75" />
                </div>
              </div>
            </div>
          </section>
        </div>


        <div className={`space-y-6 animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both ${activeTab !== "updates" ? "hidden" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary/80">
              <GitBranch className="h-4 w-4" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em]">Change Registry</h3>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addChangelogEntry} className="h-8 rounded-lg border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Plus className="h-3 w-3 mr-1" /> New Log
            </Button>
          </div>

          <div className="space-y-6 pb-4">
            {changelog.length === 0 ? (
              <div className="text-center p-12 glass rounded-3xl border-dashed border-white/10 text-muted-foreground/30">
                <History className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No release logs found</p>
              </div>
            ) : (
              changelog.map((entry, index) => (
                <div key={entry.id} className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01] space-y-4 group">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-end">
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/20 disabled:opacity-10 transition-all duration-300 shadow-sm"
                        disabled={index === 0}
                        onClick={() => moveChangelogEntry(index, 'up')}
                      >
                        <ChevronUp className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/20 disabled:opacity-10 transition-all duration-300 shadow-sm"
                        disabled={index === changelog.length - 1}
                        onClick={() => moveChangelogEntry(index, 'down')}
                      >
                        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1">Version</Label>
                      <Input
                        placeholder="v1.0.0"
                        value={entry.version}
                        onChange={(e) => updateEntry(entry.id, "version", e.target.value)}
                        className="h-9 rounded-lg border-white/10 bg-white/5 font-mono text-primary text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                        className="h-9 rounded-lg border-white/10 bg-white/5 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive/30 hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                      onClick={() => removeChangelogEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Modifications</span>
                      <button
                        type="button"
                        onClick={() => addChange(entry.id)}
                        className="text-primary hover:underline text-[9px] font-bold uppercase tracking-widest"
                      >
                        + Add Line
                      </button>
                    </div>

                    <div className="space-y-2">
                      {entry.changes.map((change, index) => (
                        <div key={index} className="flex gap-2 items-center group/line">
                          <div className="w-1 h-1 rounded-full bg-primary/20" />
                          <Input
                            placeholder="New feature added..."
                            value={change}
                            onChange={(e) => updateChange(entry.id, index, e.target.value)}
                            className="flex-1 h-8 border-none bg-transparent hover:bg-white/5 focus:bg-white/5 text-xs px-2"
                          />
                          <button
                            type="button"
                            onClick={() => removeChange(entry.id, index)}
                            className="opacity-0 group-hover/line:opacity-100 text-destructive/30 hover:text-destructive p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </form>

      <div className="mt-auto pt-6 border-t border-white/5 bg-transparent">
        {error && <p className="text-xs text-destructive font-bold mb-3 text-center mb-4">{error}</p>}
        <Button
          onClick={() => {
            if (formRef.current) formRef.current.requestSubmit();
          }}
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all"
        >
          {isLoading ? "Saving..." : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {project ? "Update Project" : "Create Project"}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}