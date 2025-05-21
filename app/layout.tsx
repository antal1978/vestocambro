import type React from "react"
import "@/app/globals.css"
import { Inter, Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata = {
  title: "Vestok",
  description: "Laboratorio de looks - Organizá tus prendas y creá looks increíbles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="min-h-screen pt-16 pb-20 md:pb-0">{children}</main>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
