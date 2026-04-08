import type { MetadataRoute } from "next"
import { getSearchIndex } from "@/lib/actions"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes = [
    "",
    "/about",
    "/contact",
    "/feedback",
    "/news",
    "/stats",
    "/update",
    "/privacy",
    "/terms",
    "/cookies",
    "/search",
  ]

  const staticEntries: MetadataRoute.Sitemap = baseRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))

  const { data } = await getSearchIndex()
  const dynamicEntries: MetadataRoute.Sitemap =
    (data || [])
      .filter((item) => item.type === "project" || item.type === "news")
      .map((item) => ({
        url: `${siteUrl}${item.href}`,
        lastModified: item.created_at ? new Date(item.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: item.type === "news" ? 0.7 : 0.8,
      })) ?? []

  return [...staticEntries, ...dynamicEntries]
}
