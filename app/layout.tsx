import type { Metadata } from "next";
import { Bebas_Neue, Roboto, Montserrat, Inter } from "next/font/google";
import "./globals.css";

// Opcion 1 (Sugerida por ti): Bebas Neue (Titulos) + Roboto (Cuerpo)
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title",
});

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-body",
});

// Opcion 2 (Recomendacion VIP/Elegante): Montserrat (Titulos) + Inter (Cuerpo)
// const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-title" });
// const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "180° VIP - Nightclub Experience | Menu Digital",
  description: "Carta digital exclusiva de licores, cocteleria, botellas y cartelera de eventos en 180° VIP.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${bebasNeue.variable} ${roboto.variable} font-body min-h-screen bg-[#06050a] text-white selection:bg-[#ff1b7a] selection:text-white antialiased`}>
        <div className="ambient-glow" />
        <main className="relative z-10 min-h-screen flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}