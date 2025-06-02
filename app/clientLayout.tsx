"use client"

import type React from "react"

import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider" // Asegúrate de que ThemeProvider esté importado

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  // Eliminamos el estado y la lógica para el diálogo de ayuda de ARIN
  // const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)

  return (
    <div className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
        {/* Eliminamos el botón para abrir el diálogo de ayuda de ARIN */}
        {/* <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => setIsHelpDialogOpen(true)}
            aria-label="Abrir ayuda de ARIN"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div> */}
        {/* Eliminamos el diálogo de ayuda de ARIN */}
        {/* {isHelpDialogOpen && (
          <ArinHelpDialog
            isOpen={isHelpDialogOpen}
            onClose={() => setIsHelpDialogOpen(false)}
            helpContext="general" // Proporciona un contexto por defecto
          />
        )} */}
      </ThemeProvider>
    </div>
  )
}
