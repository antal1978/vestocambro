"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shirt, Wand2, Upload, BarChart3, Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"

const navigation = [
  { name: "Armario", href: "/gallery", icon: Shirt },
  { name: "Look", href: "/suggest", icon: Wand2 },
  { name: "Subir", href: "/upload", icon: Upload },
  { name: "Estadísticas", href: "/stats", icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        // Eliminamos onNavClick ya que no hay diálogo de ayuda
        onNavClick={() => {}}
      />
    </>
  )
}
