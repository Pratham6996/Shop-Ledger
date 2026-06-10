import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopLedger",
  description: "Family business transaction tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
