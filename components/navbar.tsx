"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shirt, Home, Wand2, Heart, BarChart3, Menu, X, MessageSquare } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  // Cambiar el nombre en la barra de navegación principal
  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/gallery", icon: Shirt, label: "Mi Armario" },
    { path: "/suggest", icon: Wand2, label: "Sugerir Look" },
    { path: "/looks", icon: Heart, label: "Looks" },
    { path: "/stats", icon: BarChart3, label: "Estadísticas" },
    { path: "/guia", icon: MessageSquare, label: "Guía" },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-3 transition-all duration-200",
                  isActive(item.path) ? "bg-primary-500 text-white" : "hover:bg-primary-50 hover:text-primary-600",
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b animate-fade-in">
          <nav className="container py-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center p-3 rounded-md transition-colors",
                      isActive(item.path)
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                        : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
