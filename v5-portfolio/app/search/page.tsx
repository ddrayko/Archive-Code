import { SearchIcon } from "lucide-react"
import { getSearchIndex } from "@/lib/actions"
import { V4Navbar } from "@/components/v4/V4Navbar"
import { V4Footer } from "@/components/v4/V4Footer"
import { V4Dock } from "@/components/v4/V4Dock"
import { GlobalSearch } from "@/components/global-search"

export const dynamic = "force-dynamic"

export default async function SearchPage() {
  const { data } = await getSearchIndex()

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary overflow-x-hidden font-sans">
      <div className="noise-v4" />
      <div className="mesh-v4 fixed inset-0 pointer-events-none" />
      <V4Navbar />

      <main className="relative z-10 container mx-auto px-6 pt-40 pb-28">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full v4-glass border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <SearchIcon className="h-3 w-3" />
              Global Search
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              FIND <span className="text-primary">ANYTHING.</span>
            </h1>
          </div>

          <GlobalSearch items={data || []} />
        </div>
      </main>

      <V4Footer />
      <V4Dock />
    </div>
  )
}
