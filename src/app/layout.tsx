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
// Optimized for mobile: only 2 core fonts load eagerly,
// 5 premium fonts use display:swap (non-blocking)
// ═══════════════════════════════════════════════════════════

// PRIMARY SYSTEM (Core — loads eagerly)
// Heading/Title: Outfit — modern geometric, impactful
const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

// UI: DM Sans — clean, geometric UI font
const dmSans = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// SECONDARY SYSTEM (Deferred — loads after critical path)
// Serif/Elegant: Lora — classic editorial serif
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// Mono/Code: JetBrains Mono — developer-grade monospace
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

// ALTERNATIVE ELEGANT SYSTEM (Deferred — premium content)
// Display: Cormorant Garamond — ultra-luxury serif for GOD MODE covers
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// Elegant Body: Crimson Pro — rich book-style serif
const crimsonPro = Crimson_Pro({
  variable: "--font-elegant",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

// Elegant Mono: DM Mono — refined monospace
const dmMono = DM_Mono({
  variable: "--font-code-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: false,
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

// ═══════════════════════════════════════════════════════════
// CSS-ONLY INSTANT PRELOADER
// Shows before ANY JavaScript loads — pure CSS, zero latency
// ═══════════════════════════════════════════════════════════
const PRELOADER_CSS = `
#knbmp-preloader {
  position: fixed; inset: 0; z-index: 9999;
  background: #0E0004;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  transition: opacity 0.5s ease-out;
}
#knbmp-preloader.fade-out {
  opacity: 0;
  pointer-events: none;
}
#knbmp-preloader .pre-title {
  color: #C5A059;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 8vw, 48px);
  font-weight: 600;
  letter-spacing: 0.12em;
  margin-bottom: 24px;
}
#knbmp-preloader .pre-bar-track {
  width: 180px; height: 2px;
  background: #250008;
  border-radius: 999px;
  overflow: hidden;
}
#knbmp-preloader .pre-bar-fill {
  height: 100%;
  background: #C5A059;
  border-radius: 999px;
  width: 0%;
  animation: preloader-fill 2s ease-out forwards;
}
#knbmp-preloader .pre-text {
  color: #C47080;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 16px;
  opacity: 0;
  animation: preloader-fade-in 0.5s ease-out 0.3s forwards;
}
@keyframes preloader-fill {
  0% { width: 0%; }
  40% { width: 55%; }
  80% { width: 88%; }
  100% { width: 100%; }
}
@keyframes preloader-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Mobile-optimized: smaller bar, faster text */
@media (max-width: 767px) {
  #knbmp-preloader .pre-bar-track { width: 140px; }
  #knbmp-preloader .pre-text { font-size: 9px; letter-spacing: 2px; }
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* CSS-only preloader — renders before ANY JS bundles load */}
        <style dangerouslySetInnerHTML={{ __html: PRELOADER_CSS }} />
        <noscript>
          <style>{`#knbmp-preloader{display:none}`}</style>
        </noscript>
      </head>
      <body
        className={`${outfit.variable} ${dmSans.variable} ${lora.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} ${crimsonPro.variable} ${dmMono.variable} antialiased`}
      >
        {/* CSS-only preloader — instantly visible, removed by React */}
        <div id="knbmp-preloader">
          <div className="pre-title">KNBMP</div>
          <div className="pre-bar-track">
            <div className="pre-bar-fill" />
          </div>
          <div className="pre-text">Memuat Dokumen Peradaban</div>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
