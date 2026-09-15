// Importers/Callers: Next.js metadata route `/manifest.webmanifest` requested by mobile browsers and search engines.
// Affected API: PWA Web App Manifest metadata API.
// Data Schemas: MetadataRoute.Manifest from Next.js.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Revia - AI Customer Retention & WhatsApp Marketing",
    short_name: "Revia",
    description:
      "Automated customer retention engine and 1-click WhatsApp win-back campaigns for local businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#111439",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
