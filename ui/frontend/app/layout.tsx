'use client'

import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Header, ApiHealth } from '@/components/Header'
import { ApiHealthContext } from '@/contexts/ApiHealthContext'
import { useState } from "react";

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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [apiHealth, setApiHealth] = useState<ApiHealth>('unknown')

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ApiHealthContext.Provider value={apiHealth}>
          <Header onApiHealthChange={setApiHealth} />
          <main className="container mx-auto p-4 space-y-8">
            {children}
          </main>
          <Toaster />
        </ApiHealthContext.Provider>
      </body>
    </html>
  )
}