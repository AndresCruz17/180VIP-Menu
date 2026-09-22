import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Roboto } from "next/font/google";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

// Fuentes optimizadas con display swap para renderizado instantaneo sin bloqueo de texto
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
  preload: true,
});

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#06050a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://180-vip-menu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "180° VIP - Nightclub Experience | Menú Digital",
    template: "%s | 180° VIP",
  },
  description: "Carta digital exclusiva de licores premium, coctelería, botellas VIP y cartelera de eventos en 180° VIP.",
  keywords: [
    "180 vip",
    "discoteca vip",
    "menu de licores",
    "cocteleria",
    "botellas vip",
    "rumba vip",
    "eventos nocturnos",
    "reserva de palcos",
  ],
  authors: [{ name: "180° VIP" }],
  creator: "180° VIP",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "180° VIP — Nightclub Experience",
    title: "180° VIP - Nightclub Experience | Menú Digital",
    description: "Carta digital exclusiva de licores premium, botellas VIP, coctelería de autor y cartelera de eventos en vivo.",
    images: [
      {
        url: "/logo.png",
        width: 550,
        height: 550,
        alt: "180° VIP Nightclub Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "180° VIP - Nightclub Experience",
    description: "Carta digital exclusiva de licores premium y eventos en vivo.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Microdatos JSON-LD para Google Rich Results (Discoteca / Club Nocturno)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NightClub",
  name: "180° VIP",
  description: "Exclusiva discoteca VIP, carta digital de licores premium, coctelería de autor y shows en vivo.",
  image: `${siteUrl}/logo.png`,
  url: siteUrl,
  priceRange: "$$$",
  servesCuisine: "Licores, Coctelería de Autor, Botellas VIP",
  hasMenu: `${siteUrl}/menu`,
  currenciesAccepted: "COP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Preconexión de alta velocidad al CDN de imágenes de Supabase */}
        <link rel="preconnect" href="https://lssyoeqfmuxzvswypqwn.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://lssyoeqfmuxzvswypqwn.supabase.co" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${bebasNeue.variable} ${roboto.variable} font-body min-h-screen bg-[#06050a] text-white selection:bg-[#ff1b7a] selection:text-white antialiased overflow-x-hidden max-w-full`}>
        <ServiceWorkerRegister />
        <div className="ambient-glow" />
        <main className="relative z-10 min-h-screen flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
