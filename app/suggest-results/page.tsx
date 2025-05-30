"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SuggestResults() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resultados de la búsqueda</h1>

      <div className="flex items-center mb-4">
        <Input type="text" placeholder="Buscar..." className="flex-1 mr-2" />
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Aquí irían los resultados de la búsqueda */}
        <div className="border rounded-md p-4">Producto 1</div>
        <div className="border rounded-md p-4">Producto 2</div>
        <div className="border rounded-md p-4">Producto 3</div>
        <div className="border rounded-md p-4">Producto 4</div>
        <div className="border rounded-md p-4">Producto 5</div>
        <div className="border rounded-md p-4">Producto 6</div>
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline" className="flex-1 mr-2" onClick={() => router.push("/comprar")}>
          Comprar
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push("/compartir")}>
          Compartir
        </Button>
      </div>
    </div>
  )
}
