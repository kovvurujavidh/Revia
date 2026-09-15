// Importers/Callers: Next.js dynamic app icon route `/icon` requested by web browsers, search engines, and bookmark bars.
// Affected API: Next.js metadata ImageResponse API.
// Data Schemas: ImageResponse from `next/og`.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #6C4DFF 0%, #3B82F6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
          fontWeight: 900,
        }}
      >
        ⚡
      </div>
    ),
    {
      ...size,
    }
  );
}
