import type { Metadata } from "next";
import { Playfair_Display, Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
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
        className={`${playfair.variable} ${inter.variable} ${merriweather.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
