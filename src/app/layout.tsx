import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dassah's-Prism",
  description: "Refract overwhelming noise into divine clarity. Your cognitive architecture, optimized.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "e6jGjBArh4BltMG2MGWLqlH9-b8-sRuEfMF_dyceQ4w",
  },
  openGraph: {
    title: "Dassah's-Prism",
    description: "Sovereignty Reclaimed. Turn noise into focus in seconds.",
    url: "https://dassahs-mindbridge-rjeiohdc3-phidotaxis-3372s-projects.vercel.app",
    siteName: "Dassah's-Prism",
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
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  );
}
