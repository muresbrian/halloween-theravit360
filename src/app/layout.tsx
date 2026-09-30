import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://halloween-theravit360.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "🎃 HALLOWEEN THERAVIT360 2026 | Boletos Oficiales",
  description:
    "La fiesta más oscura, cinematográfica y exclusiva del año en Theravit 360°. Aparta tu boleto digital oficial con código QR individual.",
  applicationName: "Halloween Theravit 360",
  authors: [{ name: "Theravit 360°" }],
  openGraph: {
    title: "🎃 HALLOWEEN THERAVIT360 2026 | Boletos Oficiales",
    description:
      "La fiesta más oscura, cinematográfica y exclusiva del año en Theravit 360°. Aparta tu boleto digital oficial con código QR individual.",
    url: siteUrl,
    siteName: "Halloween Theravit 360",
    images: [
      {
        url: "/images/og-share.jpg",
        width: 682,
        height: 1024,
        alt: "Halloween Theravit360 2026 - Gran Carpa del Circo",
      },
    ],
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎃 HALLOWEEN THERAVIT360 2026 | Boletos Oficiales",
    description:
      "La fiesta más oscura, cinematográfica y exclusiva del año en Theravit 360°. Aparta tu boleto digital oficial con código QR individual.",
    images: ["/images/og-share.jpg"],
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
