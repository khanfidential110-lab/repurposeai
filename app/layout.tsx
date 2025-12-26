import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/hooks/use-auth";
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
  title: "RepurposeAI - AI-Powered Content Repurposing & Scheduling",
  description: "Transform your videos, podcasts, and blogs into platform-perfect content for YouTube, Twitter, Instagram, and more. AI-powered content repurposing tool for creators.",
  keywords: ["content repurposing", "AI", "social media", "YouTube", "Twitter", "Instagram", "TikTok", "content creator", "scheduling"],
  authors: [{ name: "RepurposeAI" }],
  openGraph: {
    title: "RepurposeAI - AI-Powered Content Repurposing",
    description: "Transform one piece of content into endless platform-perfect posts.",
    type: "website",
    locale: "en_US",
    siteName: "RepurposeAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepurposeAI - AI-Powered Content Repurposing",
    description: "Transform one piece of content into endless platform-perfect posts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--background-secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

