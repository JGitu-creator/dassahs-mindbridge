import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Lexend, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SessionSync from "@/components/SessionSync";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-reading" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Dassah's Prism | The Prism Engine & Prism Play",
  description: "The Prism Engine: refract overwhelming noise into clear focus with Dassah's Prism, and turn Canvas coursework dread into play with Prism Play.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dassahs-prism.vercel.app"),
  alternates: {
    canonical: "https://dassahs-prism.vercel.app",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: [
      "e6jGjBArh4BltMG2MGWLqlH9-b8-sRuEfMF_dyceQ4w",
      "YEfuEJS5zA9GRMvseo0Dp0HU70i_1fJdsXf0kmLuMQ0",
    ],
  },
  openGraph: {
    title: "Dassah's Prism | The Prism Engine & Prism Play",
    description: "Turn overwhelming noise into clear focus in seconds, and turn study dread into play.",
    url: "https://dassahs-prism.vercel.app",
    siteName: "Dassah's Prism",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Dassah's Prism - Cognitive Clarity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dassah's-Prism",
    description: "Crush the cognitive noise. Anchor your focus.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${lexend.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className={`${inter.className} h-full`}>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-P9WZRQB6"
          strategy="afterInteractive"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTM-P9WZRQB6');
          `}
        </Script>
        <SessionSync />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
