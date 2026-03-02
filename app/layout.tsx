import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VOIDHOOK | Underground Tech Collective",
  description: "High-performance, minimal, and premium tech collective for the underground.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background selection:bg-primary/30 selection:text-primary whitespace-pre-line`}
      >
        <Providers>
          <Navbar />
          <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
