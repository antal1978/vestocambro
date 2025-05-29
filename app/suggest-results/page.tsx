"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Heart, CheckCircle2, Sparkles } from "lucide-react"
import { OutfitVisualization } from "@/components/outfit-visualization"
import { ArinPostOutfitChat } from "@/components/arin-post-outfit-chat"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

export default function SuggestResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [suggestedOutfit, setSuggestedOutfit] = useState<ClothingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showVisualization, setShowVisualization] = useState(false)
  const [usageUpdated, setUsageUpdated] = useState(false)

  const occasion = searchParams.get("occasion") || "casual"
  const climate = searchParams.get("climate") || "templado"

  // Generar outfit sugerido
  useEffect(() => {
    const generateOutfit = async () => {
      setIsLoading(true)

      // Simular tiempo de generación
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Cargar prendas del localStorage
      const storedItems = localStorage.getItem("clothingItems")
      if (!storedItems) {
        // Si no hay prendas, redirigir a cargar prendas
        router.push("/upload")
        return
      }

      const items: ClothingItem[] = JSON.parse(storedItems)

      // Algoritmo simple de sugerencia
      const filteredItems = items.filter(
        (item) =>
          item.occasion === occasion ||
          item.occasion === "todo" ||
          item.climate === climate ||
          item.climate === "todo-clima",
      )

      // Seleccionar una prenda de cada categoría
      const upperItems = filteredItems.filter((item) => ["remera", "camisa", "blusa", "sweater"].includes(item.type))
      const lowerItems = filteredItems.filter((item) => ["pantalon", "jean", "falda", "short"].includes(item.type))
      const outerwearItems = filteredItems.filter((item) => item.isOuterwear)
      const footwearItems = filteredItems.filter((item) => item.type === "calzado")

      const outfit: ClothingItem[] = []

      if (upperItems.length > 0) {
        outfit.push(upperItems[Math.floor(Math.random() * upperItems.length)])
      }
      if (lowerItems.length > 0) {
        outfit.push(lowerItems[Math.floor(Math.random() * lowerItems.length)])
      }
      if (climate === "frio" && outerwearItems.length > 0) {
        outfit.push(outerwearItems[Math.floor(Math.random() * outerwearItems.length)])
      }
      if (footwearItems.length > 0) {
        outfit.push(footwearItems[Math.floor(Math.random() * footwearItems.length)])
      }

      setSuggestedOutfit(outfit)
      setIsLoading(false)
    }

    generateOutfit()
  }, [occasion, climate, router])

  const handleRegenerateOutfit = () => {
    setIsLoading(true)
    setSuggestedOutfit([])
    setUsageUpdated(false)

    // Recargar la página para generar nuevo outfit
    window.location.reload()
  }

  const handleRecordUsage = () => {
    // Registrar uso de las prendas
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord = storedUsage ? JSON.parse(storedUsage) : {}
    const today = new Date().toISOString().split("T")[0]

    suggestedOutfit.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = { count: 0, lastUsed: today }
      }
      usageRecord[item.id].count += 1
      usageRecord[item.id].lastUsed = today
    })

    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))
    setUsageUpdated(true)

    toast({
      title: "¡Uso registrado!",
      description: "Se ha actualizado el contador de uso de estas prendas.",
      variant: "success",
    })
  }

  const handleSaveOutfit = () => {
    const storedOutfits = localStorage.getItem("savedOutfits")
    const outfits = storedOutfits ? JSON.parse(storedOutfits) : []

    const newOutfit = {
      id: Date.now().toString(),
      items: suggestedOutfit,
      date: new Date().toLocaleDateString(),
      occasion,
      climate,
    }

    localStorage.setItem("savedOutfits", JSON.stringify([...outfits, newOutfit]))

    toast({
      title: "¡Look guardado!",
      description: "Tu look ha sido guardado en tu colección.",
      variant: "success",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-background">
        <div className="container max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/suggest")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Generando tu look...</h1>
          </div>

          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin mx-auto">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">ARIN está creando tu look perfecto</h2>
              <p className="text-muted-foreground">
                Analizando tu armario y combinando las mejores prendas para {occasion} con clima {climate}...
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-background">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/suggest")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tu look sugerido</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {occasion}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {climate}
              </Badge>
            </div>
          </div>
        </div>

        {/* Outfit Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Look generado por ARIN</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerateOutfit}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generar otro
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowVisualization(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ver completo
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {suggestedOutfit.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg border">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.type}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{item.type}</p>
                    <Badge variant="outline" className="capitalize">
                      {item.color}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <Button onClick={handleRecordUsage} className="gap-2" disabled={usageUpdated}>
            <CheckCircle2 className="h-4 w-4" />
            {usageUpdated ? "Uso registrado" : "Voy a usar este look"}
          </Button>
          <Button variant="outline" onClick={handleSaveOutfit} className="gap-2">
            <Heart className="h-4 w-4" />
            Guardar look
          </Button>
        </div>

        {/* ARIN Post-Outfit Chat */}
        <ArinPostOutfitChat
          outfit={suggestedOutfit}
          onRegenerateOutfit={handleRegenerateOutfit}
          onRecordUsage={handleRecordUsage}
          onSaveOutfit={handleSaveOutfit}
          usageUpdated={usageUpdated}
        />

        {/* Outfit Visualization Modal */}
        <OutfitVisualization
          items={suggestedOutfit}
          isOpen={showVisualization}
          onClose={() => setShowVisualization(false)}
          climate={climate}
          occasion={occasion}
        />
      </div>

      <Toaster />
    </div>
  )
}
