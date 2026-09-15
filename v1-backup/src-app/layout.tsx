import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revia | Turn Visitors Into Loyal Customers",
  description:
    "Revia - The customer retention engine for restaurants, cafes, hotels, salons, gyms, and small businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#09090b] text-[#fafafa] antialiased overflow-x-hidden ${inter.className}`}>
        <AppProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
