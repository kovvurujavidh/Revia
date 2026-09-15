// Importers/Callers: Next.js metadata route handler for `/sitemap.xml` requested by search engine indexers.
// Affected API: Search Engine Sitemap XML generation API.
// Data Schemas: MetadataRoute.Sitemap from Next.js.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revia.app";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join/demo-business`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
