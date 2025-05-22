"use client"

import { Home, Shirt, Wand2, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/gallery", icon: Shirt, label: "Mi Armario" },
    { path: "/suggest", icon: Wand2, label: "Sugerir" },
    { path: "/looks", icon: Heart, label: "Looks" },
    { path: "/guia", icon: MessageSquare, label: "Guía" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path} className="flex flex-col items-center py-1 px-2">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                isActive(item.path)
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive(item.path) ? "font-medium text-primary-600 dark:text-primary-400" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
