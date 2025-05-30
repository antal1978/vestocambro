import Link from "next/link"
import { Shirt } from "lucide-react"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <Shirt className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-primary-600">ARIN</span>
    </Link>
  )
}
