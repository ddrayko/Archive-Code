import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GraphStats Portfolio",
    short_name: "GraphStats",
    description: "Creative developer portfolio, projects, updates, and public analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/placeholder-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
