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
  title: "ReadmeGenerator",
  description: "Gerador de README.md com OpenAI e GitHub Código Aberto",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#000000",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  openGraph: {
    title: "ReadmeGenerator",
    description: "Gerador de README.md com OpenAI e GitHub Código Aberto",
    url: "https://readmegenerator.vercel.app",
    siteName: "ReadmeGenerator",
    images: [
      {
        url: "https://readmegenerator.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReadmeGenerator",
      },
    ],
    locale: "pt_BR",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
