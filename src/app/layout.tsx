import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dassah's Prism",
  description: "Refract overwhelming noise into divine clarity. Your cognitive architecture, optimized.",
  openGraph: {
    title: "Dassah's Prism",
    description: "Sovereignty Reclaimed. Turn noise into focus in seconds.",
    url: "https://dassahs-prism.vercel.app",
    siteName: "Dassah's Prism",
    images: [
      {
        url: "https://images.unsplash.com/photo-1559757175-57008173bc7d?auto=format&fit=crop&q=80&w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "Neural Prism - Cognitive Clarity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dassah's Prism",
    description: "Crush the cognitive noise. Anchor your focus.",
    images: ["https://images.unsplash.com/photo-1559757175-57008173bc7d?auto=format&fit=crop&q=80&w=1200&h=630"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
