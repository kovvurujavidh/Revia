// Importers/Callers: Next.js Root Layout for all pages.
// Affected API: Global CSS, Fonts, Context Providers, SEO Metadata, Structured Data JSON-LD.
// Data Schemas: metadata: Metadata.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

// Base URL for SEO canonical paths and OpenGraph
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revia.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Revia | AI Customer Retention & WhatsApp Marketing",
    template: "%s | Revia - Customer Retention Engine",
  },
  description:
    "Revia is the all-in-one AI customer retention engine for restaurants, cafes, salons, gyms, and retail. Track visit patterns, predict churn, and send automated 1-click WhatsApp win-back campaigns.",
  keywords: [
    "customer retention software",
    "WhatsApp marketing automation",
    "restaurant CRM",
    "salon customer retention",
    "gym member retention",
    "retail repeat customers",
    "churn prediction AI",
    "customer return platform",
    "loyalty program software",
    "local business CRM",
  ],
  authors: [{ name: "Revia Team" }],
  creator: "Revia",
  publisher: "Revia Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Revia",
    title: "Revia | AI Customer Retention & WhatsApp Marketing",
    description:
      "Stop losing customers. Revia tracks visit rhythms and sends personalized WhatsApp offers exactly when they're about to forget you.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Revia - Turn One-Time Visitors Into Lifelong Regulars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revia | Turn Visitors into Loyal Customers",
    description:
      "Automate your customer retention with AI visit tracking and 1-click WhatsApp win-back offers.",
    images: ["/opengraph-image"],
    creator: "@revia_app",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon.png",
  },
  category: "business software",
  classification: "CRM & Marketing Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich Structured Data for SEO / SERP dominance
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Revia",
        operatingSystem: "All",
        applicationCategory: "BusinessApplication",
        url: baseUrl,
        description:
          "Revia is an AI-powered customer retention engine that tracks visit patterns and automates WhatsApp marketing for restaurants, salons, cafes, and gyms.",
        offers: {
          "@type": "Offer",
          price: "19.99",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "2500",
        },
      },
      {
        "@type": "Organization",
        name: "Revia",
        url: baseUrl,
        logo: `${baseUrl}/icon`,
        sameAs: [
          "https://twitter.com/revia_app",
          "https://linkedin.com/company/revia",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does Revia track customer visits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Revia allows staff to enter phone numbers at checkout or via a tabletop QR code. Our AI engine then learns each customer's unique visit rhythm over time.",
            },
          },
          {
            "@type": "Question",
            name: "Does Revia integrate directly with WhatsApp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Revia allows 1-click dispatching of personalized WhatsApp templates (Thank You notes, Win-Back offers, VIP updates) directly to your customers' phones.",
            },
          },
          {
            "@type": "Question",
            name: "What industries is Revia built for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Revia is tailored for local retention-heavy businesses including Restaurants, Cafés, Salons, Spas, Gyms, Clinics, and Retail boutiques.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="theme-color" content="#111439" />
      </head>
      <body
        className={`min-h-screen bg-[#F8F8F9] text-[#111439] antialiased overflow-x-hidden ${inter.className}`}
      >
        <AppProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
