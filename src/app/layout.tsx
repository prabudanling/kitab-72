import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Heading: Cormorant Garamond — elegant, dramatic, world-class titles
const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Serif Body: EB Garamond — warm, senior-friendly, "buku warisan" readability
const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// UI/Labels: Inter — clean, modern, Helvetica Neue equivalent
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KNBMP · PGA-72 — Anatomi Peradaban: 72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat",
  description:
    "72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat — Polymath Grand Architecture. Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih. Dokumen Super-Master | Klasifikasi: Absolut | Horizon: 100 Tahun.",
  keywords: [
    "KNBMP",
    "PGA-72",
    "Koperasi",
    "Ekonomi Rakyat",
    "Kedaulatan",
    "Indonesia",
    "Peradaban",
    "72 Pilar",
    "Desa",
    "Merdeka",
  ],
  authors: [{ name: "Grand Architect's Office" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${ebGaramond.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
