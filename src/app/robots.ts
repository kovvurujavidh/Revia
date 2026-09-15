// Importers/Callers: Next.js metadata route handler for `/robots.txt` requested by search engine bots (Googlebot, Bingbot).
// Affected API: Search Engine Indexing and Crawler direct rules.
// Data Schemas: MetadataRoute.Robots from Next.js.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revia.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/login", "/auth/signup", "/join/"],
        disallow: [
          "/dashboard",
          "/analytics",
          "/customers",
          "/whatsapp",
          "/opportunities",
          "/reports",
          "/admin",
          "/settings",
          "/profile",
          "/add-visit",
          "/onboarding",
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/auth/login", "/auth/signup", "/join/"],
        disallow: [
          "/dashboard",
          "/analytics",
          "/customers",
          "/whatsapp",
          "/opportunities",
          "/reports",
          "/admin",
          "/settings",
          "/profile",
          "/add-visit",
          "/onboarding",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
