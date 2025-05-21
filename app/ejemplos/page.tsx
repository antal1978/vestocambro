"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Progress } from "@/components/ui/progress"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

// Actualizar las prendas de ejemplo para usar URLs de imágenes confiables
const sampleClothes: Omit<ClothingItem, "id">[] = [
  // Prendas parte superior
  {
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&q=80",
    type: "camiseta",
    color: "blanco",
    occasion: "casual",
    climate: "caluroso",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop&q=80",
    type: "camiseta",
    color: "negro",
    occasion: "casual",
    climate: "caluroso",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300&h=300&fit=crop&q=80",
    type: "camiseta",
    color: "azul",
    occasion: "casual",
    climate: "caluroso",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop&q=80",
    type: "camisa",
    color: "blanco",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&q=80",
    type: "camisa",
    color: "azul",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=300&h=300&fit=crop&q=80",
    type: "camisa",
    color: "rojo",
    occasion: "fiesta",
    climate: "templado",
    isOuterwear: false,
  },

  // Prendas parte inferior
  {
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop&q=80",
    type: "pantalon",
    color: "negro",
    occasion: "casual",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&q=80",
    type: "pantalon",
    color: "azul",
    occasion: "casual",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop&q=80",
    type: "pantalon",
    color: "gris",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&h=300&fit=crop&q=80",
    type: "falda",
    color: "negro",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=300&h=300&fit=crop&q=80",
    type: "falda",
    color: "rojo",
    occasion: "fiesta",
    climate: "caluroso",
    isOuterwear: false,
  },

  // Vestidos
  {
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop&q=80",
    type: "vestido",
    color: "negro",
    occasion: "fiesta",
    climate: "templado",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=300&h=300&fit=crop&q=80",
    type: "vestido",
    color: "azul",
    occasion: "fiesta",
    climate: "caluroso",
    isOuterwear: false,
  },

  // Abrigos
  {
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop&q=80",
    type: "campera",
    color: "negro",
    occasion: "casual",
    climate: "frio",
    isOuterwear: true,
  },
  {
    image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=300&h=300&fit=crop&q=80",
    type: "campera",
    color: "marron",
    occasion: "casual",
    climate: "frio",
    isOuterwear: true,
  },
  {
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop&q=80",
    type: "blazer",
    color: "azul",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: true,
  },
  {
    image: "https://images.unsplash.com/photo-1555069519-127aadedf1ee?w=300&h=300&fit=crop&q=80",
    type: "blazer",
    color: "negro",
    occasion: "trabajo",
    climate: "templado",
    isOuterwear: true,
  },
  {
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=300&h=300&fit=crop&q=80",
    type: "cardigan",
    color: "gris",
    occasion: "casual",
    climate: "templado",
    isOuterwear: true,
  },
  {
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop&q=80",
    type: "tapado",
    color: "negro",
    occasion: "formal",
    climate: "frio",
    isOuterwear: true,
  },

  // Calzado
  {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop&q=80",
    type: "calzado",
    color: "negro",
    occasion: "formal",
    climate: "todo-clima",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&h=300&fit=crop&q=80",
    type: "calzado",
    color: "marron",
    occasion: "trabajo",
    climate: "todo-clima",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop&q=80",
    type: "calzado",
    color: "blanco",
    occasion: "casual",
    climate: "todo-clima",
    isOuterwear: false,
  },

  // Accesorios
  {
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300&h=300&fit=crop&q=80",
    type: "accesorio",
    color: "rojo",
    occasion: "casual",
    climate: "frio",
    isOuterwear: false,
  },
  {
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=300&h=300&fit=crop&q=80",
    type: "accesorio",
    color: "negro",
    occasion: "casual",
    climate: "frio",
    isOuterwear: false,
  },
]

export default function EjemplosPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [existingItems, setExistingItems] = useState<ClothingItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Cargar prendas existentes
    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      setExistingItems(JSON.parse(storedItems))
    }
  }, [])

  const handleLoadSamples = async () => {
    setLoading(true)
    setProgress(0)

    try {
      // Obtener prendas existentes
      const storedItems = localStorage.getItem("clothingItems")
      const existingItems: ClothingItem[] = storedItems ? JSON.parse(storedItems) : []

      // Crear nuevas prendas con IDs únicos
      const newItems: ClothingItem[] = sampleClothes.map((item) => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      }))

      // Simular carga progresiva
      for (let i = 0; i < newItems.length; i++) {
        // Esperar un poco para simular carga
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Actualizar progreso
        setProgress(((i + 1) / newItems.length) * 100)
      }

      // Guardar todas las prendas (existentes + nuevas)
      localStorage.setItem("clothingItems", JSON.stringify([...existingItems, ...newItems]))

      toast({
        title: "¡Prendas cargadas!",
        description: `Se han añadido ${newItems.length} prendas de ejemplo a tu guardarropa.`,
      })
    } catch (error) {
      toast({
        title: "Error al cargar prendas",
        description: "Ocurrió un error al cargar las prendas de ejemplo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearWardrobe = () => {
    localStorage.removeItem("clothingItems")
    localStorage.removeItem("savedOutfits")
    setExistingItems([])

    toast({
      title: "Guardarropa limpiado",
      description: "Se han eliminado todas las prendas y looks guardados.",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Prendas de Ejemplo</h1>
        <Link href="/gallery">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a la galería
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cargar prendas de ejemplo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Carga un conjunto de prendas de ejemplo para probar las combinaciones de looks. Estas prendas incluyen
            diferentes tipos, colores, climas y ocasiones.
          </p>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-muted-foreground text-center">Cargando prendas... {Math.round(progress)}%</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sampleClothes.slice(0, 10).map((item, index) => (
              <div key={index} className="relative overflow-hidden rounded-md aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image || "/placeholder.svg"} alt={item.type} className="object-cover w-full h-full" />
                <div className="absolute bottom-0 left-0 right-0 p-1 text-xs text-center text-white bg-black/50 truncate">
                  {item.type} {item.color}
                </div>
              </div>
            ))}
            <div className="relative overflow-hidden rounded-md aspect-square flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">+{sampleClothes.length - 10} más</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleLoadSamples} disabled={loading} className="w-full sm:w-auto gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Cargar {sampleClothes.length} prendas de ejemplo
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearWardrobe}
            disabled={loading || existingItems.length === 0}
            className="w-full sm:w-auto gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar guardarropa
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resumen de prendas de ejemplo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Camisetas:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Camisas:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Pantalones:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Faldas:</span> <Badge variant="outline">2</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Vestidos:</span> <Badge variant="outline">2</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Abrigos:</span> <Badge variant="outline">6</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Calzado:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Accesorios:</span> <Badge variant="outline">2</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por clima</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Caluroso:</span> <Badge variant="outline">5</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Templado:</span> <Badge variant="outline">10</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Frío:</span> <Badge variant="outline">5</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Todo clima:</span> <Badge variant="outline">3</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por color</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Negro:</span> <Badge variant="outline">8</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Blanco:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Azul:</span> <Badge variant="outline">5</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Rojo:</span> <Badge variant="outline">3</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Gris:</span> <Badge variant="outline">2</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Marrón:</span> <Badge variant="outline">2</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
