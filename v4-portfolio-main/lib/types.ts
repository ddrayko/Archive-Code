export interface Project {
  id: string
  title: string
  slug: string
  description: string
  image_url: string | null
  tags: string[]
  project_url: string | null
  github_url: string | null
  created_at: string
  updated_at: string
  in_development?: boolean
  development_status?: 'active' | 'paused'
  development_progress?: number
  is_completed?: boolean
  is_archived?: boolean
  changelog?: ChangelogEntry[]
  requires_auth?: boolean
}

export type ProjectUpdateStatus = 'idea' | 'planned' | 'in_progress' | 'done'
export type ProjectEventType = 'launch' | 'update' | 'sunset' | 'milestone'

export interface ProjectUpdateEntry {
  id: string
  title: string
  summary: string
  status: ProjectUpdateStatus
  target_date?: string | null
  created_at: string
  impact?: 'low' | 'medium' | 'high'
}

export interface ProjectEvent {
  id: string
  title: string
  type: ProjectEventType
  date: string
  note?: string
}

export interface ProjectAdminData {
  projectId: string
  notes: string
  updates: ProjectUpdateEntry[]
  events: ProjectEvent[]
  last_updated: string
}

export interface Admin {
  id: string
  email: string
  created_at: string
}

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  changes: string[]
}

export interface SiteUpdate {
  id?: string
  next_update_date: string | null
  no_update_planned: boolean
  planned_features: string[];
  changelog: ChangelogEntry[];
  latest_update_text?: string;
  updated_at: string;
}



export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'admin'
  createdAt: string
}

export interface Conversation {
  id: string
  userName: string
  userEmail: string
  subject: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived'
  read: boolean // Read by admin
  messages: ChatMessage[]
  replied?: boolean
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  read: boolean
  replied?: boolean
}

export interface News {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  likes: string[] // User IDs (Clerk IDs)
  author_id: string
}

export interface NewsComment {
  id: string
  news_id: string
  user_id: string
  user_name: string
  user_image?: string
  content: string
  created_at: string
  likes?: string[]
}

export interface SearchItem {
  id: string
  type: "project" | "news" | "page"
  title: string
  description: string
  href: string
  tags?: string[]
  created_at?: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface Feedback {
  id: string
  name: string
  email: string
  rating: number
  positive_points: string
  negative_points: string
  additional_comment: string
  status: "new" | "corrected"
  created_at: string
  corrected_at?: string | null
}

