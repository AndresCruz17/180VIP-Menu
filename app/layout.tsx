import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Roboto } from "next/font/google";
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

export const metadata: Metadata = {
  title: "180° VIP - Nightclub Experience | Menú Digital",
  description: "Carta digital exclusiva de licores, coctelería, botellas y cartelera de eventos en 180° VIP.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
      </head>
      <body className={`${bebasNeue.variable} ${roboto.variable} font-body min-h-screen bg-[#06050a] text-white selection:bg-[#ff1b7a] selection:text-white antialiased`}>
        <div className="ambient-glow" />
        <main className="relative z-10 min-h-screen flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
