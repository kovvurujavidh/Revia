// Importers/Callers: Next.js dynamic OpenGraph image route `/opengraph-image` requested by social media scrapers, search engines, and WhatsApp preview bots.
// Affected API: Next.js ImageResponse API.
// Data Schemas: ImageResponse from `next/og`.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Revia - AI Customer Retention Engine & WhatsApp Marketing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow background */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "25%",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(108, 77, 255, 0.25) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo and Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6C4DFF 0%, #3B82F6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              color: "white",
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 900,
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #6C4DFF 0%, #3B82F6 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Revia
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "54px",
            fontWeight: 900,
            color: "#fafafa",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "960px",
            marginBottom: "24px",
          }}
        >
          Turn One-Time Visitors Into Lifelong Regulars
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          AI-Powered Visit Rhythm Tracking & 1-Click WhatsApp Return Campaigns for Restaurants, Cafés, Salons, Gyms & Retail.
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(108, 77, 255, 0.15)",
              border: "1px solid rgba(108, 77, 255, 0.4)",
              padding: "10px 22px",
              borderRadius: "9999px",
              color: "#a855f7",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            ✨ 1-Click WhatsApp Dispatch
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(22, 163, 74, 0.15)",
              border: "1px solid rgba(22, 163, 74, 0.4)",
              padding: "10px 22px",
              borderRadius: "9999px",
              color: "#4ade80",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            📈 +32% Repeat Visit Rate
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
