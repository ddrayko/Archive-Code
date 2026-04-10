"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Plus, LogOut, Home, UserPlus, LayoutDashboard, Database, Shield, Activity, ListFilter, NotebookPen, Settings, Sparkles, Newspaper, Server, BarChart3 } from "lucide-react"
import { AdminProjectCard } from "@/components/admin-project-card"
import { ProjectDialog } from "@/components/project-dialog"
import { AdminDialog } from "@/components/admin-dialog"
import { AdminCard } from "@/components/admin-card"
import { AdminStats } from "@/components/admin-stats"
import { AdminMessages } from "@/components/admin-messages"
import { ThemeToggle } from "@/components/theme-toggle"
import { BadgeDialog } from "@/components/badge-dialog"
import { Separator } from "@/components/ui/separator"
import { AdminNewsCard } from "@/components/admin-news-card"
import { NewsDialog } from "@/components/news-dialog"
import type { Project, Admin, SiteUpdate, News } from "@/lib/types"
import { logoutAdmin } from "@/lib/auth"
import { getAdmins, getMaintenanceMode, getAvailability, getV4Mode, getNews, getErrorMode } from "@/lib/actions"
import { MaintenanceToggle } from "@/components/maintenance-toggle"
import { V4Toggle } from "@/components/v4-toggle"
import { AvailabilityToggle } from "@/components/availability-toggle"
import { ErrorModeToggle } from "@/components/error-mode-toggle"
import { getFirestoreClient } from "@/lib/firebase/client"
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState<"all" | "in_dev" | "finished" | "archived">("all")
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [addAdminOpen, setAddAdminOpen] = useState(false)
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false)
  const [updateData, setUpdateData] = useState<SiteUpdate | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [maintenanceProgress, setMaintenanceProgress] = useState(0)
  const [errorMode, setErrorMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [v4Mode, setV4Mode] = useState(false)
  const [v4Message, setV4Message] = useState("")
  const [v4Progress, setV4Progress] = useState(0)
  const [isAvailable, setIsAvailable] = useState(true)
  const [news, setNews] = useState<News[]>([])
  const [addNewsOpen, setAddNewsOpen] = useState(false)

  const fetchProjects = async () => {
    const db = getFirestoreClient()
    const projectsQuery = query(collection(db, "portfolio"), orderBy("created_at", "desc"))
    const querySnapshot = await getDocs(projectsQuery)

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[]

    setProjects(data)
    setIsLoading(false)
  }

  const fetchAdmins = async () => {
    const result = await getAdmins()
    if (result.success) {
      setAdmins(result.data as Admin[])
    }
  }

  const fetchUpdateData = async () => {
    const db = getFirestoreClient()
    const docRef = doc(db, "update-p", "main")
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setUpdateData(docSnap.data() as SiteUpdate)
    }
  }

  const fetchMaintenanceMode = async () => {
    const result = await getMaintenanceMode()
    if (result.success) {
      setMaintenanceMode(result.isMaintenance)
      setMaintenanceMessage(result.message || "")
      setMaintenanceProgress(result.progress || 0)
    }
  }

  const fetchV4Mode = async () => {
    const result = await getV4Mode()
    if (result.success) {
      setV4Mode(result.isV4Mode)
      setV4Message(result.message || "")
      setV4Progress(result.progress || 0)
    }
  }

  const fetchErrorMode = async () => {
    const result = await getErrorMode()
    if (result.success) {
      setErrorMode(result.isErrorMode)
      setErrorMessage(result.message || "")
    }
  }

  const fetchAvailability = async () => {
    const result = await getAvailability()
    if (result.success && result.isAvailable !== undefined) {
      setIsAvailable(result.isAvailable)
    }
  }

  const fetchNews = async () => {
    const result = await getNews()
    if (result.success) {
      setNews(result.data || [])
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
  }

  const projectFilterCounts = {
    all: projects.length,
    in_dev: projects.filter((project) => project.in_development).length,
    finished: projects.filter((project) => project.is_completed).length,
    archived: projects.filter((project) => project.is_archived).length,
  }

  const filteredProjects = projects.filter((project) => {
    switch (projectFilter) {
      case "in_dev":
        return !!project.in_development
      case "finished":
        return !!project.is_completed
      case "archived":
        return !!project.is_archived
      default:
        return true
    }
  })

  useEffect(() => {
    fetchProjects()
    fetchAdmins()
    fetchUpdateData()
    fetchMaintenanceMode()
    fetchErrorMode()
    fetchV4Mode()
    fetchAvailability()
    fetchNews()
  }, [])

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  const handleProjectUpdated = () => {
    fetchProjects()
  }

  const handleAdminDeleted = () => {
    fetchAdmins()
  }

  const handleLogout = async () => {
    await logoutAdmin()
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary transition-colors duration-500 font-sans">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none z-0" />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md bg-background/60">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 rotate-3">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gradient hidden sm:block">Control Center</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex rounded-full border border-white/10 glass hover:bg-white/10 hover:text-foreground transition-all">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Live Site
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex rounded-full border border-white/10 glass hover:bg-white/10 hover:text-foreground transition-all">
              <Link href="/admin/configure">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex rounded-full border border-white/10 glass hover:bg-white/10 hover:text-foreground transition-all">
              <Link href="/admin/visitors">
                <BarChart3 className="mr-2 h-4 w-4" />
                Visitors
              </Link>
            </Button>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="destructive" size="sm" className="rounded-full shadow-lg shadow-destructive/20">
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-24 container mx-auto px-6">
        <Accordion type="multiple" className="space-y-6">
          {/* CATEGORY 1: WORK & CONTENT */}
          <AccordionItem value="content" className="border-none">
            <AccordionTrigger className="v4-glass px-8 py-6 rounded-[2rem] border border-white/10 hover:no-underline group data-[state=open]:rounded-b-none transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Database className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight italic">Work & Content Hub</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Projects, News & Headline</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="v4-glass px-8 pt-12 pb-16 rounded-b-[2rem] border-x border-b border-white/10 space-y-20">

              <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                      <Database className="h-4 w-4" />
                      Portfolio Management
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">MANAGE PROJECTS</h2>
                    <p className="text-muted-foreground font-medium max-w-xl">
                      Update your latest achievements, showcase your skills, and keep your professional presence sharp.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 self-start md:self-auto">
                    <Button asChild variant="outline" className="rounded-2xl h-14 px-6 border border-white/10 glass hover:bg-white/10 hover:text-foreground transition-all">
                      <Link href="/admin/projects">
                        <NotebookPen className="mr-2 h-5 w-5" />
                        Project Ops
                      </Link>
                    </Button>
                    <Button onClick={() => setAddProjectOpen(true)} className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 group">
                      <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                      New Project Entry
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-64 rounded-3xl glass border-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="glass p-20 rounded-[3.5rem] border-white/5 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-muted-foreground">
                      <Database className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold">No projects archived</p>
                      <p className="text-muted-foreground">Deploy your first project to start building your legacy.</p>
                    </div>
                    <Button onClick={() => setAddProjectOpen(true)} variant="outline" className="rounded-full glass border-white/10">
                      <Plus className="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <AdminProjectCard
                        key={project.id}
                        project={project}
                        onDeleted={handleProjectDeleted}
                        onUpdated={handleProjectUpdated}
                      />
                    ))}
                  </div>
                )}
              </section>

              <Separator className="bg-white/5" />

              <section className="space-y-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                      <ListFilter className="h-4 w-4" />
                      Global View
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">PROJECTS OVERVIEW</h2>
                    <p className="text-muted-foreground font-medium max-w-xl">
                      View all projects in one place with quick status filters.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: "all", label: "All", count: projectFilterCounts.all },
                      { id: "in_dev", label: "In Dev", count: projectFilterCounts.in_dev },
                      { id: "finished", label: "Finished", count: projectFilterCounts.finished },
                      { id: "archived", label: "Archived", count: projectFilterCounts.archived },
                    ] as const).map((filter) => (
                      <Button
                        key={filter.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setProjectFilter(filter.id)}
                        className={cn(
                          "rounded-full border border-white/10 glass px-4 text-xs font-bold uppercase tracking-widest transition-all",
                          projectFilter === filter.id
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                        )}
                      >
                        {filter.label}
                        <span className={cn(
                          "ml-2 rounded-full px-2 py-0.5 text-[10px]",
                          projectFilter === filter.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-white/10 text-muted-foreground"
                        )}>
                          {filter.count}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-[2.5rem] border-white/5 bg-white/[0.02] overflow-hidden">
                  {isLoading ? (
                    <div className="p-12 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 rounded-2xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-muted-foreground">
                        <Database className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-bold">No project found</p>
                        <p className="text-muted-foreground text-sm">
                          Adjust filters to display matching projects.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Table className="text-xs">
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                          <TableHead className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Project</TableHead>
                          <TableHead className="py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
                          <TableHead className="py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tags</TableHead>
                          <TableHead className="py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Last update</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map((project) => {
                          const tags = project.tags || []
                          const visibleTags = tags.slice(0, 3)
                          const extraTags = tags.length - visibleTags.length
                          const updatedAt = project.updated_at || project.created_at

                          return (
                            <TableRow key={project.id} className="border-white/5 hover:bg-white/[0.04]">
                              <TableCell className="px-6 py-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-foreground/90">{project.title}</p>
                                  <p className="text-[10px] text-muted-foreground/70">{project.slug || "-"}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  {project.in_development && (
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                                      In Dev
                                    </Badge>
                                  )}
                                  {project.in_development && project.development_status === "paused" && (
                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">
                                      Paused
                                    </Badge>
                                  )}
                                  {project.is_completed && (
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                                      Finished
                                    </Badge>
                                  )}
                                  {project.is_archived && (
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px]">
                                      Archived
                                    </Badge>
                                  )}
                                  {!project.in_development && !project.is_completed && !project.is_archived && (
                                    <Badge variant="secondary" className="bg-white/10 text-muted-foreground border-white/10 text-[10px]">
                                      Active
                                    </Badge>
                                  )}
                                  {project.in_development && typeof project.development_progress === "number" && (
                                    <span className="text-[10px] text-muted-foreground">{project.development_progress}%</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {visibleTags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="rounded-full bg-white/5 border-white/10 text-[9px] uppercase tracking-tighter">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {extraTags > 0 && (
                                    <span className="text-[10px] text-muted-foreground">+{extraTags}</span>
                                  )}
                                  {tags.length === 0 && (
                                    <span className="text-[10px] text-muted-foreground">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-[10px] text-muted-foreground">
                                {formatDate(updatedAt)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </section>

              <Separator className="bg-white/5" />

              <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                      <Newspaper className="h-4 w-4" />
                      News Hub
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">MANAGE NEWS</h2>
                    <p className="text-muted-foreground font-medium max-w-xl">
                      Keep your audience engaged with the latest news, updates, and announcements.
                    </p>
                  </div>
                  <Button onClick={() => setAddNewsOpen(true)} className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 group self-start md:self-auto">
                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    New Article
                  </Button>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-64 rounded-3xl glass border-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : news.length === 0 ? (
                  <div className="glass p-20 rounded-[3.5rem] border-white/5 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-muted-foreground">
                      <Newspaper className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold">No news published</p>
                      <p className="text-muted-foreground">Start by writing your first article to share with your audience.</p>
                    </div>
                    <Button onClick={() => setAddNewsOpen(true)} variant="outline" className="rounded-full glass border-white/10">
                      <Plus className="mr-2 h-4 w-4" />
                      Write News
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {news.map((item) => (
                      <AdminNewsCard
                        key={item.id}
                        news={item}
                        onDeleted={() => fetchNews()}
                        onUpdated={() => fetchNews()}
                      />
                    ))}
                  </div>
                )}
              </section>

            </AccordionContent>
          </AccordionItem>

          {/* CATEGORY 2: ENGAGEMENT & PULSE */}
          <AccordionItem value="engagement" className="border-none">
            <AccordionTrigger className="v4-glass px-8 py-6 rounded-[2rem] border border-white/10 hover:no-underline group data-[state=open]:rounded-b-none transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight italic">Engagement & Pulse</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Stats & Communications</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="v4-glass px-8 pt-12 pb-16 rounded-b-[2rem] border-x border-b border-white/10 space-y-20">

              <section className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                    <Activity className="h-4 w-4" />
                    Performance Overview
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">NETWORK PULSE</h2>
                  <p className="text-muted-foreground font-medium max-w-xl">
                    Real-time insights into traffic, security, and performance across the global edge network.
                  </p>
                </div>
                <AdminStats />
              </section>

              <Separator className="bg-white/5" />

              <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                      <Activity className="h-4 w-4" />
                      Communications
                    </div>
                    <div className="flex items-baseline gap-4">
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tight">MESSAGES</h2>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-xl">
                      Manage incoming contact requests and respond to opportunities.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <AvailabilityToggle initialState={isAvailable} />
                  </div>
                </div>

                <AdminMessages />

<Separator className="bg-white/5" />

              </section>
                    <section className="space-y-12">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                            <Settings className="h-4 w-4" />
                            Feedbacks
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">USERS FEEDBACKS</h2>
                          <p className="text-muted-foreground font-medium max-w-xl text-sm">
                            Review user feedback and adjust your portfolio to better meet your audience's needs.
                          </p>
                        </div>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Settings className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">View Feedbacks</p>
                            <p className="text-lg font-bold text-foreground/90 font-sans">
                              Open Feedbacks Section
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl h-12 px-6 glass border-white/10 hover:bg-white/10 hover:text-foreground transition-all shrink-0 text-sm">
                          <Link href="/admin/feedback">
                            <Settings className="mr-2 h-4 w-4" />
                            Open Feedbacks
                          </Link>
                        </Button>
                      </div>
                    </section>
            </AccordionContent>
          </AccordionItem>

          {/* CATEGORY 3: SYSTEM & IDENTITY */}
          <AccordionItem value="system" className="border-none">
            <AccordionTrigger className="v4-glass px-8 py-6 rounded-[2rem] border border-white/10 hover:no-underline group data-[state=open]:rounded-b-none transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight italic">System & Identity</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Status & Identity</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="v4-glass px-8 pt-12 pb-16 rounded-b-[2rem] border-x border-b border-white/10">
              <Accordion type="multiple" className="space-y-6">
                {/* SUB-CATEGORY 3.1: IDENTITY & HERO */}
                <AccordionItem value="identity-hero" className="border-white/5 bg-white/[0.01] rounded-[2rem] overflow-hidden border">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline group hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase tracking-widest italic">Identity & Hero</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-0.5">Branding & Headline</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pt-8 pb-12 space-y-16">
                    <section className="space-y-12">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                            <Settings className="h-4 w-4" />
                            Control Center
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">GLOBAL CONFIGURATION</h2>
                          <p className="text-muted-foreground font-medium max-w-xl text-sm">
                            Manage your portfolio's identity and core settings that reflect across the entire platform.
                          </p>
                        </div>
                        <Button asChild className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 self-start md:self-auto transition-all text-sm">
                          <Link href="/admin/configure">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure Identity
                          </Link>
                        </Button>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Settings className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Identity & Branding</p>
                            <p className="text-lg font-bold text-foreground/90 font-sans">
                              Change your public name and other global parameters.
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl h-12 px-6 glass border-white/10 hover:bg-white/10 hover:text-foreground transition-all shrink-0 text-sm">
                          <Link href="/admin/configure">
                            <Settings className="mr-2 h-4 w-4" />
                            Open Settings
                          </Link>
                        </Button>
                      </div>
                    </section>

                    <Separator className="bg-white/5" />

                    <section className="space-y-12">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                            <Sparkles className="h-4 w-4" />
                            Hero Communications
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">HOMEPAGE BADGE</h2>
                          <p className="text-muted-foreground font-medium max-w-xl text-sm">
                            Update the headline message that visitors see first when landing on your portfolio.
                          </p>
                        </div>
                        <Button
                          onClick={() => setBadgeDialogOpen(true)}
                          className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all self-start md:self-auto text-sm"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Update Headline
                        </Button>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] relative overflow-hidden group">
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Sparkles className="h-6 w-6 text-primary shadow-glow shadow-primary/20" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Current Live Badge Content</p>
                            <p className="text-xl md:text-2xl font-bold text-foreground/90 italic">
                              "{updateData?.latest_update_text || "Fix database bug and new interface (v3!)"}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </AccordionContent>
                </AccordionItem>

                {/* SUB-CATEGORY 3.2: INFRASTRUCTURE */}
                <AccordionItem value="infrastructure" className="border-white/5 bg-white/[0.01] rounded-[2rem] overflow-hidden border">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline group hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Server className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase tracking-widest italic">Platform Control</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-0.5">Status & Operations</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pt-8 pb-12 space-y-12">
                    <section className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                          <Shield className="h-4 w-4" />
                          Availability Control
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">PLATFORM STATUS</h2>
                        <p className="text-muted-foreground font-medium max-w-xl text-sm">
                          Manage global site states. Activate maintenance mode or preview upcoming version announcements.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex items-center justify-center">
                          <MaintenanceToggle initialState={maintenanceMode} initialMessage={maintenanceMessage} initialProgress={maintenanceProgress} onUpdated={fetchMaintenanceMode} />
                        </div>

                        <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex items-center justify-center">
                          <ErrorModeToggle initialState={errorMode} initialMessage={errorMessage} onUpdated={fetchErrorMode} />
                        </div>

                        <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex items-center justify-center">
                          <V4Toggle initialState={v4Mode} initialMessage={v4Message} initialProgress={v4Progress} onUpdated={fetchV4Mode} />
                        </div>
                      </div>
                    </section>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </AccordionContent>
          </AccordionItem>

          {/* CATEGORY 4: SECURITY & ACCESS */}
          <AccordionItem value="security" className="border-none">
            <AccordionTrigger className="v4-glass px-8 py-6 rounded-[2rem] border border-white/10 hover:no-underline group data-[state=open]:rounded-b-none transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight italic">Security & Access</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Admin Management</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="v4-glass px-8 pt-12 pb-16 rounded-b-[2rem] border-x border-b border-white/10 space-y-20">

              <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                      <Shield className="h-4 w-4" />
                      Access Control
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">PLATFORM ADMINS</h2>
                    <p className="text-muted-foreground font-medium max-w-xl">
                      Secure your dashboard by managing authorized personnel with access to the core portfolio data.
                    </p>
                  </div>
                  <Button onClick={() => setAddAdminOpen(true)} variant="ghost" className="rounded-2xl h-14 px-8 border border-white/10 glass hover:bg-white/10 hover:text-foreground self-start md:self-auto transition-all">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Admin
                  </Button>
                </div>

                {admins.length === 0 ? (
                  <div className="glass p-20 rounded-[3.5rem] border-white/5 text-center">
                    <p className="text-muted-foreground font-medium italic">Scanning for authorized accounts...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                      <AdminCard key={admin.id} admin={admin} onDeleted={handleAdminDeleted} />
                    ))}
                  </div>
                )}
              </section>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <ProjectDialog open={addProjectOpen} onOpenChange={setAddProjectOpen} onSuccess={fetchProjects} />
      <AdminDialog open={addAdminOpen} onOpenChange={setAddAdminOpen} onSuccess={fetchAdmins} />
      <BadgeDialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen} onSuccess={fetchUpdateData} />
      <NewsDialog open={addNewsOpen} onOpenChange={setAddNewsOpen} onSuccess={fetchNews} />
    </div>
  )
}

