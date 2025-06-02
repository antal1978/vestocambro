import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./clientLayout"

export const metadata: Metadata = {
  title: "ARIN - Tu armario inteligente",
  description: "Organiza tu armario y crea nuevos looks con lo que ya tienes",
  manifest: "/manifest.json",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}


import './globals.css'