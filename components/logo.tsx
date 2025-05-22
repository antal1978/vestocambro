import { Shirt } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  variant?: "default" | "simple"
  size?: "sm" | "md" | "lg"
}

export function Logo({ variant = "default", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-700 p-1.5 transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary-500/20">
        <Shirt className={`${sizeClasses[size]} text-white transition-transform duration-300 group-hover:scale-110`} />
      </div>
      {variant === "default" && (
        <span
          className={`font-heading font-bold ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 transition-colors duration-300`}
        >
          ARIN
        </span>
      )}
    </Link>
  )
}
