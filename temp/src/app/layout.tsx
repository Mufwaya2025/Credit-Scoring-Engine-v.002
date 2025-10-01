import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARC Credit Engine Pro - Secure AI Credit Scoring",
  description: "Advanced AI-powered credit scoring and risk management system with enterprise-grade security.",
  keywords: ["ARC", "Credit Engine", "AI", "Credit Scoring", "Risk Management", "Security"],
  authors: [{ name: "ARC Credit Engine Team" }],
  openGraph: {
    title: "ARC Credit Engine Pro",
    description: "Secure AI-powered credit scoring and risk management system",
    url: "https://arc-credit.com",
    siteName: "ARC Credit Engine Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC Credit Engine Pro",
    description: "Secure AI-powered credit scoring and risk management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
