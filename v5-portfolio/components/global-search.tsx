"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { SearchItem } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Newspaper, Layers } from "lucide-react"

export function GlobalSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "project" | "news" | "page">("all")

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => {
        if (!q) return true
        const haystack = `${item.title} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase()
        return haystack.includes(q)
      })
      .slice(0, 80)
  }, [items, query, typeFilter])

  return (
    <section className="space-y-6">
      <div className="v4-glass rounded-3xl border-white/10 p-6 sm:p-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, news, or pages..."
            className="h-12 pl-10 rounded-xl bg-white/5 border-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "project", "news", "page"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border transition-colors ${
                typeFilter === type
                  ? "bg-primary text-primary-foreground border-primary/50"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <div className="v4-glass rounded-3xl border-white/10 p-8 text-center text-muted-foreground">
            No results found.
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="v4-card rounded-2xl border-white/10 p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {item.type === "project" && <Layers className="h-4 w-4 text-primary" />}
                    {item.type === "news" && <Newspaper className="h-4 w-4 text-primary" />}
                    {item.type === "page" && <FileText className="h-4 w-4 text-primary" />}
                    <h3 className="text-lg font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Badge className="rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest">
                  {item.type}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
