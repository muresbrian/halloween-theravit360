import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🎃 HALLOWEEN THERAVIT360 2026 | Boletos Oficiales",
  description:
    "La fiesta más oscura, cinematográfica y exclusiva del año. Aparta tu boleto digital oficial con código QR individual.",
  openGraph: {
    title: "🎃 HALLOWEEN THERAVIT360 2026",
    description: "Fiesta de terror inmersivo, DJs estelares y mixología de autor. Boletos oficiales limitados.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#09090c] text-zinc-100 antialiased selection:bg-[#ff5722] selection:text-white">
        {children}
      </body>
    </html>
  );
}
