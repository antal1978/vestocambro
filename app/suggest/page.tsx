"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Shirt, Sparkles, ArrowRight } from "lucide-react"
import { OutfitVisualization } from "@/components/outfit-visualization"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { loadExampleItems } from "@/lib/example-items"
import { getSuggestedLooks } from "@/lib/outfit-suggestion-algorithm"
import type { ClothingItem } from "@/types/ClothingItem"
import { Loader2 } from "lucide-react"

const SuggestPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const baseItemId = searchParams.get("baseItem")

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([])
  const [baseItem, setBaseItem] = useState<ClothingItem | null>(null)
  const [generatedOutfit, setGeneratedOutfit] = useState<ClothingItem[]>([])
  const [isOutfitDialogOpen, setIsOutfitDialogOpen] = useState(false)
  const [usageUpdated, setUsageUpdated] = useState(false)
  const [outfitSaved, setOutfitSaved] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    "initial" | "dayOrNight" | "activity" | "climate" | "style" | "visualization" | "post-chat" | "no-results"
  >("initial") // Añadido 'no-results'
  const [selectedDayNight, setSelectedDayNight] = useState<"day" | "night" | "both" | "">("")
  const [selectedActivity, setSelectedActivity] = useState("")
  const [selectedClimate, setSelectedClimate] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false)
  const [noOutfitReason, setNoOutfitReason] = useState<string | null>(null) // Nuevo estado para el mensaje

  useEffect(() => {
    loadExampleItems()

    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      const items = JSON.parse(storedItems)
      setWardrobeItems(items)

      if (baseItemId) {
        const item = items.find((item: ClothingItem) => item.id === baseItemId)
        if (item) {
          setBaseItem(item)
        }
      }
    }
  }, [baseItemId])

  useEffect(() => {
    if (wardrobeItems.length > 0 && currentStep === "initial") {
      setCurrentStep("dayOrNight")
    }
  }, [wardrobeItems, currentStep])

  const handleOutfitGenerated = (outfit: ClothingItem[], occasion: string, climate: string) => {
    setGeneratedOutfit(outfit)
    setIsOutfitDialogOpen(true)
    setCurrentStep("visualization")
    setIsLoadingOutfit(false)
    setNoOutfitReason(null) // Resetear el mensaje de no resultados
  }

  const handleOutfitDialogClose = () => {
    setIsOutfitDialogOpen(false)
    setCurrentStep("post-chat")
  }

  const handleRecordUsage = () => {
    const clothingUsage = localStorage.getItem("clothingUsage")
    const usageRecord = clothingUsage ? JSON.parse(clothingUsage) : {}

    generatedOutfit.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = { count: 0, lastUsed: "" }
      }
      usageRecord[item.id].count++
      usageRecord[item.id].lastUsed = new Date().toISOString()
    })

    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    const usedLooks = localStorage.getItem("usedLooks")
    const lookHistory = usedLooks ? JSON.parse(usedLooks) : []

    lookHistory.push({
      id: Date.now().toString(),
      items: generatedOutfit,
      date: new Date().toISOString(),
      occasion: selectedActivity,
      climate: selectedClimate,
    })

    localStorage.setItem("usedLooks", JSON.stringify(lookHistory))
    setUsageUpdated(true)
  }

  const handleSaveOutfit = () => {
    const savedLooks = localStorage.getItem("savedLooks")
    const looks = savedLooks ? JSON.parse(savedLooks) : []

    const newLook = {
      id: Date.now().toString(),
      name: `Look para ${selectedActivity} (${selectedClimate})`,
      items: generatedOutfit,
      occasion: selectedActivity,
      climate: selectedClimate,
      style: selectedStyle,
      dateCreated: new Date().toISOString(),
      isFavorite: false,
    }

    looks.push(newLook)
    localStorage.setItem("savedLooks", JSON.stringify(looks))
    setOutfitSaved(true)
  }

  const handleRegenerateOutfit = () => {
    setCurrentStep("dayOrNight")
    setGeneratedOutfit([])
    setIsOutfitDialogOpen(false)
    setUsageUpdated(false)
    setOutfitSaved(false)
    setSelectedDayNight("")
    setSelectedActivity("")
    setSelectedClimate("")
    setSelectedStyle("")
    setNoOutfitReason(null) // Resetear el mensaje de no resultados
  }

  const handleDayNightSelection = (choice: "day" | "night" | "both") => {
    setSelectedDayNight(choice)
    setCurrentStep("activity")
  }

  const handleActivitySelection = (activity: string) => {
    setSelectedActivity(activity)
    setCurrentStep("climate")
  }

  const handleClimateSelection = (climate: string) => {
    setSelectedClimate(climate)
    setCurrentStep("style")
  }

  const handleStyleSelection = (style: string) => {
    setSelectedStyle(style)
    setIsLoadingOutfit(true)
    const looks = getSuggestedLooks(wardrobeItems, selectedActivity, selectedClimate, style, 1)
    if (looks.length > 0) {
      handleOutfitGenerated(looks[0], selectedActivity, selectedClimate)
    } else {
      // Si no se generó ningún look, mostrar mensaje de no resultados
      setGeneratedOutfit([])
      setIsLoadingOutfit(false)
      setNoOutfitReason(
        "¡Ups! No pudimos encontrar un look que cumpla con todas las condiciones. Intenta con otras opciones o añade más prendas a tu armario.",
      )
      setCurrentStep("no-results") // Cambiar a un paso de no resultados
    }
  }

  if (wardrobeItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">¡Empecemos a crear tu armario!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="py-8">
              <Shirt className="h-24 w-24 mx-auto text-primary/30" />
              <p className="mt-4 text-muted-foreground">
                Parece que aún no tienes prendas en tu armario. Añade algunas para que ARIN pueda sugerirte looks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/upload")} className="gap-2">
                <Shirt className="h-4 w-4" />
                Añadir mi primera prenda
              </Button>
              <Button variant="outline" onClick={() => router.push("/gallery")}>
                Ver mi armario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sugerir Look</h1>
          <p className="text-muted-foreground mt-2">
            ARIN te ayudará a crear looks increíbles con las prendas de tu armario
          </p>
        </div>

        {currentStep === "dayOrNight" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                ¿Para cuándo es el look?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>¡Dale! ¿Estás buscando algo para el día o para la noche?</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleDayNightSelection("day")}>🌅 Día</Button>
                <Button onClick={() => handleDayNightSelection("night")}>🌙 Noche</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "activity" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                ¿Qué vas a hacer?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>¡Perfecto! Contame, ¿qué tenés planeado?</p>
              <div className="flex flex-wrap gap-2">
                {selectedDayNight === "day" && (
                  <>
                    <Button onClick={() => handleActivitySelection("trabajo")}>💼 Trabajar en oficina</Button>
                    <Button onClick={() => handleActivitySelection("dia-casual")}>
                      🏠 Trabajar desde casa o estar en casa
                    </Button>
                    <Button onClick={() => handleActivitySelection("salidas-informales")}>🚶‍♀️ Salir a pasear</Button>
                  </>
                )}
                {selectedDayNight === "night" && (
                  <>
                    <Button onClick={() => handleActivitySelection("salidas-formales")}>
                      🍷 Evento formal (cena elegante, fiesta)
                    </Button>
                    <Button onClick={() => handleActivitySelection("salidas-informales")}>
                      🎬 Salida informal (bar, cine, juntada)
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "climate" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                ¿Cómo está el clima?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>¡Genial! ¿Cómo está el clima por donde andás?</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleClimateSelection("calor")}>☀️ Caluroso</Button>
                <Button onClick={() => handleClimateSelection("templado")}>🌤️ Templado</Button>
                <Button onClick={() => handleClimateSelection("frio")}>❄️ Frío</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "style" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                ¿Qué estilo buscás?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>¡Perfecto! Ahora contame, ¿cómo te gusta vestirte?</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleStyleSelection("comodo")}>😌 Cómodo</Button>
                <Button onClick={() => handleStyleSelection("arreglado")}>✨ Arreglado</Button>
                <Button onClick={() => handleStyleSelection("creativo")}>🎨 Creativo</Button>
                <Button onClick={() => handleStyleSelection("sorpresa")}>🎲 Sorprendeme</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingOutfit && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Generando tu look...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Estamos combinando tus prendas para crear algo increíble. ¡Un momento por favor!
              </p>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary/50" />
            </CardContent>
          </Card>
        )}

        {currentStep === "post-chat" && generatedOutfit.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                ¡Tu look está listo!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {generatedOutfit.map((item, index) => (
                  <div key={index} className="aspect-square bg-white rounded-md overflow-hidden border">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={() => setIsOutfitDialogOpen(true)} variant="outline" className="gap-2">
                  Ver look completo
                </Button>

                <Button onClick={handleRegenerateOutfit} variant="outline" className="gap-2">
                  Generar otro look
                </Button>

                <Button onClick={() => router.push("/looks")} className="gap-2 ml-auto">
                  <ArrowRight className="h-4 w-4" />
                  Ver todos mis looks
                </Button>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>¡Look generado! Puedes registrar su uso o guardarlo para más tarde.</p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleRecordUsage} disabled={usageUpdated}>
                    {usageUpdated ? "Uso registrado" : "Registrar uso"}
                  </Button>
                  <Button onClick={handleSaveOutfit} disabled={outfitSaved}>
                    {outfitSaved ? "Look guardado" : "Guardar look"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "no-results" && noOutfitReason && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                No se pudo generar un look
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{noOutfitReason}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={handleRegenerateOutfit} className="gap-2">
                  Intentar con otras opciones
                </Button>
                <Button onClick={() => router.push("/upload")} variant="outline" className="gap-2">
                  Añadir más prendas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Outfit Visualization Dialog */}
      {generatedOutfit.length > 0 && (
        <OutfitVisualization
          items={generatedOutfit}
          isOpen={isOutfitDialogOpen}
          onClose={handleOutfitDialogClose}
          climate={selectedClimate}
          occasion={selectedActivity}
        />
      )}
    </div>
  )
}

export default SuggestPage
