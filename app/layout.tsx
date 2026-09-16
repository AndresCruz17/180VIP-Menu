import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "180° VIP — Nightclub Experience | Menu Digital",
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
      <body className="min-h-screen bg-[#06050a] text-white selection:bg-[#ff1b7a] selection:text-white antialiased">
        <div className="ambient-glow" />
        <main className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto px-4 py-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}