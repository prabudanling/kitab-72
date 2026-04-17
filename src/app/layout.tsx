import type { Metadata } from "next";
import {
  Outfit,
  Lora,
  JetBrains_Mono,
  Cormorant_Garamond,
  Crimson_Pro,
  DM_Sans,
  DM_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// ═══════════════════════════════════════════════════════════
// FONT SYSTEM — GOD TIER LUXURY TYPOGRAPHY
// ═══════════════════════════════════════════════════════════

// PRIMARY SYSTEM
// Heading/Title: Outfit — modern geometric, impactful
const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Serif/Elegant: Lora — classic editorial serif
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Mono/Code: JetBrains Mono — developer-grade monospace
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// ALTERNATIVE ELEGANT SYSTEM (Premium / Heritage Sections)
// Display: Cormorant Garamond — ultra-luxury serif for GOD MODE covers
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Elegant Body: Crimson Pro — rich book-style serif
const crimsonPro = Crimson_Pro({
  variable: "--font-elegant",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// UI: DM Sans — clean, geometric UI font
const dmSans = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Elegant Mono: DM Mono — refined monospace
const dmMono = DM_Mono({
  variable: "--font-code-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KNBMP · PGA-72 — Anatomi Peradaban: 72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat",
  description:
    "72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat — Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih. Dokumen Super-Master | Klasifikasi: Absolut | Horizon: 100 Tahun.",
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
  authors: [{ name: "Dewan Pendiri KNBMP" }],
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
        className={`${outfit.variable} ${lora.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} ${crimsonPro.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
