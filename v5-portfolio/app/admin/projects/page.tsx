"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import { CalendarDays, Home, LayoutDashboard, Save, Trash2, Settings } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getFirestoreClient } from "@/lib/firebase/client"
import type { ChangelogEntry, Project, ProjectAdminData, ProjectEvent, ProjectEventType, ProjectUpdateEntry, ProjectUpdateStatus } from "@/lib/types"

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

const defaultAdminData = (projectId: string): ProjectAdminData => ({
  projectId,
  notes: "",
  updates: [],
  events: [],
  last_updated: new Date().toISOString(),
})

const formatDate = (value?: string | null) => {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
}

const todayYmd = () => new Date().toISOString().slice(0, 10)

const updateStatusLabel: Record<ProjectUpdateStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  in_progress: "In progress",
  done: "Done",
}

const eventTypeLabel: Record<ProjectEventType, string> = {
  launch: "Launch",
  update: "Update",
  milestone: "Milestone",
  sunset: "End of service",
}

type OpsMode = "single" | "general"

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
const ymd = (d: Date) => d.toISOString().slice(0, 10)
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const [opsMode, setOpsMode] = useState<OpsMode>("single")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isProjectConfirmed, setIsProjectConfirmed] = useState(false)
  const [dataByProject, setDataByProject] = useState<Record<string, ProjectAdminData>>({})
  const [saving, setSaving] = useState(false)
  const [projectChangelogById, setProjectChangelogById] = useState<Record<string, ChangelogEntry[]>>({})
  const [allAdminData, setAllAdminData] = useState<ProjectAdminData[]>([])
  const [loadingGeneral, setLoadingGeneral] = useState(false)
  const [generalMonth, setGeneralMonth] = useState<Date>(() => startOfMonth(new Date()))

  const currentProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  )
  const currentData = selectedProjectId ? dataByProject[selectedProjectId] : undefined
  const currentChangelog = selectedProjectId ? (projectChangelogById[selectedProjectId] || []) : []

  const projectTitleById = useMemo(() => {
    const map: Record<string, string> = {}
    projects.forEach((p) => {
      map[p.id] = p.title
    })
    return map
  }, [projects])

  const latestUpdates = useMemo(() => {
    if (opsMode !== "general") return []
    const items: Array<{ projectId: string; projectTitle: string; entry: ChangelogEntry }> = []
    projects.forEach((p) => {
      const list = (p.changelog || []) as ChangelogEntry[]
      list.forEach((entry) => items.push({ projectId: p.id, projectTitle: p.title, entry }))
    })
    items.sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime())
    return items.slice(0, 12)
  }, [projects, opsMode])

  const latestEvents = useMemo(() => {
    if (opsMode !== "general") return []
    const items: Array<{ projectId: string; projectTitle: string; event: ProjectEvent }> = []
    allAdminData.forEach((row) => {
      const projectTitle = projectTitleById[row.projectId] || row.projectId
      ;(row.events || []).forEach((event) => items.push({ projectId: row.projectId, projectTitle, event }))
    })
    items.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
    return items.slice(0, 12)
  }, [allAdminData, opsMode, projectTitleById])

  const generalCalendarDays = useMemo(() => {
    if (opsMode !== "general") {
      const mStart = startOfMonth(generalMonth)
      const mEnd = endOfMonth(generalMonth)
      return { days: [] as Date[], mStart, mEnd }
    }
    const mStart = startOfMonth(generalMonth)
    const mEnd = endOfMonth(generalMonth)
    // Monday-start week grid
    const startWeekday = (mStart.getDay() + 6) % 7 // 0=Mon ... 6=Sun
    const gridStart = addDays(mStart, -startWeekday)
    const days: Date[] = []
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i))
    return { days, mStart, mEnd }
  }, [generalMonth, opsMode])

  const eventsByYmd = useMemo(() => {
    if (opsMode !== "general") return new Map<string, Array<{ projectTitle: string; event: ProjectEvent }>>()
    const map = new Map<string, Array<{ projectTitle: string; event: ProjectEvent }>>()
    allAdminData.forEach((row) => {
      const projectTitle = projectTitleById[row.projectId] || row.projectId
      ;(row.events || []).forEach((event) => {
        const key = ymd(new Date(event.date))
        const arr = map.get(key) || []
        arr.push({ projectTitle, event })
        map.set(key, arr)
      })
    })
    // Stable ordering inside each day
    for (const [key, arr] of map) {
      arr.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime())
      map.set(key, arr)
    }
    return map
  }, [allAdminData, opsMode, projectTitleById])

  // Drafts
  const [notesDraft, setNotesDraft] = useState("")
  const [updateDraft, setUpdateDraft] = useState<{ title: string; summary: string; status: ProjectUpdateStatus; target_date: string }>({
    title: "",
    summary: "",
    status: "planned",
    target_date: "",
  })
  const [eventDraft, setEventDraft] = useState<{ title: string; type: ProjectEventType; date: string; note: string }>({
    title: "",
    type: "launch",
    date: "",
    note: "",
  })

  const fetchProjects = async () => {
    setLoadingProjects(true)
    const db = getFirestoreClient()
    const q = query(collection(db, "portfolio"), orderBy("created_at", "desc"))
    const snap = await getDocs(q)
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Project[]
    setProjects(list)
    setLoadingProjects(false)
  }

  const fetchAllAdminData = async () => {
    setLoadingGeneral(true)
    try {
      const db = getFirestoreClient()
      const snap = await getDocs(collection(db, "project-admin"))
      const rows = snap.docs.map((d) => ({ ...defaultAdminData(d.id), ...d.data() })) as ProjectAdminData[]
      setAllAdminData(rows)
    } catch (e) {
      console.error("[admin/projects] load general failed", e)
      toast.error("Failed to load general mode")
      setAllAdminData([])
    } finally {
      setLoadingGeneral(false)
    }
  }

  const loadProjectData = async (projectId: string) => {
    const db = getFirestoreClient()
    const ref = doc(db, "project-admin", projectId)
    const snap = await getDoc(ref)

    const payload = snap.exists()
      ? ({ ...defaultAdminData(projectId), ...snap.data() } as ProjectAdminData)
      : defaultAdminData(projectId)

    setDataByProject((prev) => ({ ...prev, [projectId]: payload }))
    setNotesDraft(payload.notes || "")
  }

  const loadProjectChangelog = async (projectId: string) => {
    const db = getFirestoreClient()
    const ref = doc(db, "portfolio", projectId)
    const snap = await getDoc(ref)
    const changelog = (snap.exists() ? (snap.data().changelog as ChangelogEntry[] | undefined) : undefined) || []
    setProjectChangelogById((prev) => ({ ...prev, [projectId]: changelog }))
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (opsMode !== "general") return
    fetchAllAdminData()
  }, [opsMode])

  useEffect(() => {
    if (!selectedProjectId) return
    if (!isProjectConfirmed) return
    if (dataByProject[selectedProjectId]) {
      setNotesDraft(dataByProject[selectedProjectId].notes || "")
    } else {
      loadProjectData(selectedProjectId)
    }

    loadProjectChangelog(selectedProjectId)
  }, [selectedProjectId, dataByProject, isProjectConfirmed])

  const persist = async (projectId: string, next: ProjectAdminData, success?: string) => {
    setSaving(true)
    try {
      const db = getFirestoreClient()
      await setDoc(
        doc(db, "project-admin", projectId),
        { ...next, projectId, last_updated: new Date().toISOString() },
        { merge: true }
      )
      setDataByProject((prev) => ({ ...prev, [projectId]: next }))
      if (success) toast.success(success)
    } catch (e) {
      console.error("[admin/projects] persist failed", e)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  const saveNotes = async () => {
    if (!selectedProjectId || !currentData) return
    await persist(selectedProjectId, { ...currentData, notes: notesDraft }, "Notes saved")
  }

  const addUpdate = async () => {
    if (!selectedProjectId || !currentData) return
    if (!updateDraft.title.trim()) return toast.warning("Missing title")
    if (!updateDraft.summary.trim()) return toast.warning("Missing summary")

    // Create a changelog entry so it shows up in the normal admin dashboard project updates tab.
    const changes = updateDraft.summary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const changelogEntry: ChangelogEntry = {
      id: uid(),
      version: updateDraft.title.trim(),
      // The admin panel form expects a date string compatible with <input type="date">.
      date: updateDraft.target_date || todayYmd(),
      changes: changes.length ? changes : [updateDraft.summary.trim()],
    }

    const entry: ProjectUpdateEntry = {
      id: changelogEntry.id,
      title: changelogEntry.version,
      summary: changelogEntry.changes.join(" "),
      status: updateDraft.status,
      target_date: updateDraft.target_date || null,
      created_at: new Date().toISOString(),
    }

    // 1) Save to project-admin (status/meta)
    await persist(selectedProjectId, { ...currentData, updates: [entry, ...(currentData.updates || [])] })

    // 2) Save to portfolio/{projectId}.changelog so the normal admin panel sees it.
    try {
      const db = getFirestoreClient()
      const nextChangelog = [changelogEntry, ...currentChangelog]
      await updateDoc(doc(db, "portfolio", selectedProjectId), { changelog: nextChangelog })
      setProjectChangelogById((prev) => ({ ...prev, [selectedProjectId]: nextChangelog }))
      toast.success("Roadmap updated (dashboard sync OK)")
    } catch (e) {
      console.error("[admin/projects] changelog sync failed", e)
      toast.error("Roadmap added, but dashboard sync failed")
    }

    setUpdateDraft({ title: "", summary: "", status: "planned", target_date: "" })
  }

  const setUpdateStatus = async (id: string, status: ProjectUpdateStatus) => {
    if (!selectedProjectId || !currentData) return
    const existing = (currentData.updates || []).find((u) => u.id === id)
    let updates: ProjectUpdateEntry[]

    if (existing) {
      updates = (currentData.updates || []).map((u) => (u.id === id ? { ...u, status } : u))
    } else {
      // Status is stored in project-admin; changelog lives in portfolio.
      // When a changelog entry exists but no meta row exists yet, create it.
      const c = currentChangelog.find((x) => x.id === id)
      const title = c?.version || "Update"
      const summary = (c?.changes || []).join(" ") || ""
      updates = [
        {
          id,
          title,
          summary,
          status,
          target_date: c?.date || null,
          created_at: new Date().toISOString(),
        },
        ...(currentData.updates || []),
      ]
    }

    await persist(selectedProjectId, { ...currentData, updates }, "Status updated")
  }

  const deleteUpdate = async (id: string) => {
    if (!selectedProjectId || !currentData) return
    const updates = (currentData.updates || []).filter((u) => u.id !== id)
    await persist(selectedProjectId, { ...currentData, updates })

    // Keep dashboard changelog in sync.
    try {
      const db = getFirestoreClient()
      const nextChangelog = currentChangelog.filter((c) => c.id !== id)
      await updateDoc(doc(db, "portfolio", selectedProjectId), { changelog: nextChangelog })
      setProjectChangelogById((prev) => ({ ...prev, [selectedProjectId]: nextChangelog }))
      toast.success("Deleted (dashboard sync OK)")
    } catch (e) {
      console.error("[admin/projects] changelog delete sync failed", e)
      toast.error("Deleted, but dashboard sync failed")
    }
  }

  const addEvent = async () => {
    if (!selectedProjectId || !currentData) return
    if (!eventDraft.title.trim()) return toast.warning("Missing title")
    if (!eventDraft.date) return toast.warning("Missing date")

    const event: ProjectEvent = {
      id: uid(),
      title: eventDraft.title.trim(),
      type: eventDraft.type,
      date: new Date(eventDraft.date).toISOString(),
      note: eventDraft.note.trim() || "",
    }

    const events = [...(currentData.events || []), event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    await persist(selectedProjectId, { ...currentData, events }, "Calendar updated")
    setEventDraft({ title: "", type: "launch", date: eventDraft.date, note: "" })
  }

  const deleteEvent = async (id: string) => {
    if (!selectedProjectId || !currentData) return
    const events = (currentData.events || []).filter((e) => e.id !== id)
    await persist(selectedProjectId, { ...currentData, events }, "Supprime")
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none z-0" />
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
              <p className="font-semibold leading-tight">Project management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
              <Link href="/admin/configure">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Site
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8 space-y-6">
        <Card className="v4-card">
          <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Mode</p>
              <p className="font-semibold">Project Ops</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={opsMode === "single" ? "default" : "outline"}
                onClick={() => setOpsMode("single")}
                className="rounded-full"
              >
                Single project
              </Button>
              <Button
                variant={opsMode === "general" ? "default" : "outline"}
                onClick={() => setOpsMode("general")}
                className="rounded-full"
              >
                General
              </Button>
            </div>
          </CardContent>
        </Card>

        {opsMode === "general" ? (
          <>
          <Card className="v4-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Overview</CardTitle>
              <CardDescription>Latest updates and latest events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Latest updates</p>
                    <Badge variant="secondary">{latestUpdates.length}</Badge>
                  </div>
                  {latestUpdates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No updates.</p>
                  ) : (
                    <div className="space-y-2">
                      {latestUpdates.map(({ projectId, projectTitle, entry }) => (
                        <div key={`${projectId}:${entry.id}`} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold">{entry.version}</p>
                              <p className="text-sm text-muted-foreground">
                                {projectTitle} | {formatDate(entry.date)}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {(entry.changes || []).join(" | ")}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setOpsMode("single")
                                setSelectedProjectId(projectId)
                                setIsProjectConfirmed(true)
                              }}
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Latest events</p>
                    <Badge variant="secondary">{latestEvents.length}</Badge>
                  </div>
                  {loadingGeneral ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : latestEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events.</p>
                  ) : (
                    <div className="space-y-2">
                      {latestEvents.map(({ projectId, projectTitle, event }) => (
                        <div key={`${projectId}:${event.id}`} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {projectTitle} | {eventTypeLabel[event.type]} | {formatDate(event.date)}
                              </p>
                              {event.note ? (
                                <p className="text-sm text-muted-foreground line-clamp-2">{event.note}</p>
                              ) : null}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setOpsMode("single")
                                setSelectedProjectId(projectId)
                                setIsProjectConfirmed(true)
                              }}
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="v4-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Calendar</CardTitle>
              <CardDescription>All events (grid view).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setGeneralMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)))}
                  >
                    Prev
                  </Button>
                  <Badge variant="secondary">
                    {generalMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Badge>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setGeneralMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)))}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="px-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {generalCalendarDays.days.map((day) => {
                  const key = ymd(day)
                  const isInMonth = day.getMonth() === generalMonth.getMonth()
                  const dayEvents = eventsByYmd.get(key) || []
                  const isToday = sameDay(day, new Date())

                  return (
                    <div
                      key={key}
                      className={[
                        "min-h-24 rounded-lg border p-2 space-y-1",
                        isInMonth ? "bg-background/40" : "opacity-50",
                        isToday ? "border-primary" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{day.getDate()}</span>
                        {dayEvents.length ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {dayEvents.length}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((row) => (
                          <div
                            key={`${row.projectTitle}:${row.event.id}`}
                            className="w-full text-left text-[11px] rounded-md px-2 py-1 border border-white/10"
                          >
                            <span className="font-semibold">{eventTypeLabel[row.event.type]}</span>
                            <span className="text-muted-foreground">: {row.event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 ? (
                          <p className="text-[11px] text-muted-foreground px-2">+{dayEvents.length - 3} more</p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          </>
        ) : opsMode === "single" && !isProjectConfirmed ? (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Which project are you working on?</CardTitle>
              <CardDescription>Choose a project, then Notes, Roadmap, and Calendar will appear.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={loadingProjects}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder={loadingProjects ? "Loading..." : "Choose a project"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedProjectId ? "Great, we will use this one." : "Selection required."}
                </p>
                <Button onClick={() => setIsProjectConfirmed(true)} disabled={!selectedProjectId}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : opsMode === "single" ? (
          <>
            <Card className="v4-card">
              <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Current project</p>
                  <p className="font-semibold truncate">{currentProject?.title || "-"}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="project" className="text-xs">
                      Switch
                    </Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={loadingProjects}>
                      <SelectTrigger className="w-full sm:w-[320px] h-10">
                        <SelectValue placeholder={loadingProjects ? "Loading..." : "Choose a project"} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant="secondary" className="h-10 flex items-center justify-center px-3">
                    Last sync: {formatDate(currentData?.last_updated)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full md:w-[520px]">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

          <TabsContent value="notes">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Internal notes</CardTitle>
                <CardDescription>One field, write and save. Simple.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Ideas, risks, links, quick todo..."
                  className="min-h-[240px]"
                  disabled={!currentProject}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Project: {currentProject ? currentProject.title : "-"}
                  </p>
                  <Button onClick={saveNotes} disabled={!currentProject || saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <Card className="v4-card">
                <CardHeader className="space-y-1">
                  <CardTitle>New update</CardTitle>
                  <CardDescription>Create an entry (synced with the dashboard).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="u-title">Title</Label>
                    <Input
                      id="u-title"
                      value={updateDraft.title}
                      onChange={(e) => setUpdateDraft((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: v1.2, auth refactor, public beta..."
                      disabled={!currentProject}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="u-date">Target date (optional)</Label>
                    <Input
                      id="u-date"
                      type="date"
                      value={updateDraft.target_date}
                      onChange={(e) => setUpdateDraft((p) => ({ ...p, target_date: e.target.value }))}
                      disabled={!currentProject}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="u-summary">Summary</Label>
                    <Textarea
                      id="u-summary"
                      value={updateDraft.summary}
                      onChange={(e) => setUpdateDraft((p) => ({ ...p, summary: e.target.value }))}
                      placeholder="One or two sentences."
                      className="min-h-[96px]"
                      disabled={!currentProject}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="u-status">Status</Label>
                    <Select
                      value={updateDraft.status}
                      onValueChange={(v) => setUpdateDraft((p) => ({ ...p, status: v as ProjectUpdateStatus }))}
                      disabled={!currentProject}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(updateStatusLabel).map(([k, label]) => (
                          <SelectItem key={k} value={k}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={addUpdate} disabled={!currentProject || saving}>
                      Add
                    </Button>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card className="v4-card">
                <CardHeader className="space-y-1">
                  <CardTitle>Published updates</CardTitle>
                  <CardDescription>List based on the project changelog.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                  {currentChangelog.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries.</p>
                  ) : (
                    currentChangelog.map((c) => {
                      const meta = (currentData?.updates || []).find((u) => u.id === c.id)
                      const status: ProjectUpdateStatus = meta?.status || "planned"
                      const summary = (c.changes || []).join(" | ")
                      return (
                        <div key={c.id} className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold">{c.version}</p>
                              <p className="text-sm text-muted-foreground">{summary}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteUpdate(c.id)} disabled={saving}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Status: {updateStatusLabel[status]}</Badge>
                            <Badge variant="secondary">Date: {formatDate(c.date)}</Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(["idea", "planned", "in_progress", "done"] as ProjectUpdateStatus[]).map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={status === s ? "default" : "outline"}
                                onClick={() => setUpdateStatus(c.id, s)}
                                disabled={saving || !currentData}
                              >
                                {updateStatusLabel[s]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="v4-card">
                <CardHeader className="space-y-1">
                  <CardTitle>New event</CardTitle>
                  <CardDescription>Add an event (date + type + note).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="e-title">Title</Label>
                    <Input
                      id="e-title"
                      value={eventDraft.title}
                      onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: public launch, end of v1 support..."
                      disabled={!currentProject}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e-date">Date</Label>
                    <Input
                      id="e-date"
                      type="date"
                      value={eventDraft.date}
                      onChange={(e) => setEventDraft((p) => ({ ...p, date: e.target.value }))}
                      disabled={!currentProject}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="e-type">Type</Label>
                    <Select
                      value={eventDraft.type}
                      onValueChange={(v) => setEventDraft((p) => ({ ...p, type: v as ProjectEventType }))}
                      disabled={!currentProject}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeLabel).map(([k, label]) => (
                          <SelectItem key={k} value={k}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e-note">Note (optional)</Label>
                    <Input
                      id="e-note"
                      value={eventDraft.note}
                      onChange={(e) => setEventDraft((p) => ({ ...p, note: e.target.value }))}
                      placeholder="Lien, checklist..."
                      disabled={!currentProject}
                    />
                  </div>
                  <Button onClick={addEvent} disabled={!currentProject || saving}>
                    Add
                  </Button>
                </div>
                </CardContent>
              </Card>

              <Card className="v4-card">
                <CardHeader className="space-y-1">
                  <CardTitle>Planned events</CardTitle>
                  <CardDescription>Sorted by date.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(currentData?.events || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events.</p>
                  ) : (
                    (currentData?.events || [])
                      .slice()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((e) => (
                        <div key={e.id} className="rounded-lg border p-4 flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold">{e.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {eventTypeLabel[e.type]} | {formatDate(e.date)}{e.note ? ` | ${e.note}` : ""}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteEvent(e.id)} disabled={saving}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
          </>
        ) : null}
      </main>
    </div>
  )
}

