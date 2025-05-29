"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shirt, Home, Wand2, Heart, BarChart3, BookOpen, Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { ArinHelpDialog } from "@/components/arin-help-dialog"

const navigation = [
  { name: "Inicio", href: "/", icon: Home, helpContext: "inicio" },
  { name: "Mi Armario", href: "/gallery", icon: Shirt, helpContext: "mi-armario" },
  { name: "Sugerir Look", href: "/suggest", icon: Wand2, helpContext: "sugerir-look" },
  { name: "Looks", href: "/looks", icon: Heart, helpContext: "looks" },
  { name: "Estadísticas", href: "/stats", icon: BarChart3, helpContext: "estadisticas" },
  { name: "Guía", href: "/guia", icon: BookOpen, helpContext: "guia" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [currentHelpContext, setCurrentHelpContext] = useState("")

  const handleNavClick = (helpContext: string, href: string, e: React.MouseEvent) => {
    // Si es la página actual, mostrar ayuda en lugar de navegar
    if (pathname === href) {
      e.preventDefault()
      setCurrentHelpContext(helpContext)
      setHelpDialogOpen(true)
    }
  }

  const handleHelpAction = (action: string) => {
    // Manejar acciones específicas basadas en el contexto
    console.log("Acción de ayuda:", action, "Contexto:", currentHelpContext)

    // Aquí puedes agregar lógica específica para cada acción
    switch (action) {
      case "Guíame paso a paso":
        // Iniciar tutorial guiado
        break
      case "Subir mi primera prenda":
        window.location.href = "/upload"
        break
      case "¡Sí, crear mi look!":
        // Continuar con el flujo normal de sugerencias
        break
      // Agregar más casos según necesites
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 ml-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.helpContext, item.href, e)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <ThemeToggle />

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
        onNavClick={handleNavClick}
      />

      {/* Help Dialog */}
      <ArinHelpDialog
        isOpen={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        helpContext={currentHelpContext}
        onAction={handleHelpAction}
      />
    </>
  )
}
