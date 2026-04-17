import type { Metadata } from "next";
import { DM_Serif_Display, Libre_Baskerville, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Heading: DM Serif Display — selalu bold, tegak, sangat jelas, elegan
const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Serif Body: Libre Baskerville — tegak, jelas, bold kuat, ramah mata senior
const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${dmSerif.variable} ${libreBaskerville.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
