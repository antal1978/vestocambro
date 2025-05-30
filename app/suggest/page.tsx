"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Shirt, Sparkles, ArrowRight } from "lucide-react"
import { ArinSuggestChat } from "@/components/arin-suggest-chat"
import { OutfitVisualization } from "@/components/outfit-visualization"
import { ArinPostOutfitChat } from "@/components/arin-post-outfit-chat"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { loadExampleItems } from "@/lib/example-items"
import type { ClothingItem } from "@/types/ClothingItem"

const SuggestPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const baseItemId = searchParams.get("baseItem")

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([])
  const [baseItem, setBaseItem] = useState<ClothingItem | null>(null)
  const [generatedOutfit, setGeneratedOutfit] = useState<ClothingItem[]>([])
  const [isOutfitDialogOpen, setIsOutfitDialogOpen] = useState(false)
  const [usageUpdated, setUsageUpdated] = useState(false)
  const [outfitSaved, setOutfitSaved] = useState(false)
  const [currentStep, setCurrentStep] = useState<"chat" | "visualization" | "post-chat">("chat")
  const [occasion, setOccasion] = useState("casual")
  const [climate, setClimate] = useState("templado")

  // Load wardrobe items from localStorage
  useEffect(() => {
    // Load example items if none exist
    loadExampleItems()

    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      const items = JSON.parse(storedItems)
      setWardrobeItems(items)

      // If baseItemId is provided, find the item
      if (baseItemId) {
        const item = items.find((item: ClothingItem) => item.id === baseItemId)
        if (item) {
          setBaseItem(item)
        }
      }
    }
  }, [baseItemId])

  // Start chat automatically if we have items
  useEffect(() => {
    if (wardrobeItems.length > 0) {
      setIsChatOpen(true)
    }
  }, [wardrobeItems])

  // Handle outfit generation from the chat
  const handleOutfitGenerated = (outfit: ClothingItem[], selectedOccasion: string, selectedClimate: string) => {
    setGeneratedOutfit(outfit)
    setOccasion(selectedOccasion)
    setClimate(selectedClimate)
    setIsOutfitDialogOpen(true)
    setCurrentStep("visualization")
  }

  // Handle outfit dialog close
  const handleOutfitDialogClose = () => {
    setIsOutfitDialogOpen(false)
    setCurrentStep("post-chat")
  }

  // Handle recording outfit usage
  const handleRecordUsage = () => {
    // Get existing usage stats
    const clothingUsage = localStorage.getItem("clothingUsage")
    const usageRecord = clothingUsage ? JSON.parse(clothingUsage) : {}

    // Update usage for each item in the outfit
    generatedOutfit.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = { count: 0, lastUsed: "" }
      }
      usageRecord[item.id].count++
      usageRecord[item.id].lastUsed = new Date().toISOString()
    })

    // Save updated usage stats
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    // Also save to usedLooks
    const usedLooks = localStorage.getItem("usedLooks")
    const lookHistory = usedLooks ? JSON.parse(usedLooks) : []

    lookHistory.push({
      id: Date.now().toString(),
      items: generatedOutfit,
      date: new Date().toISOString(),
      occasion: occasion,
      climate: climate,
    })

    localStorage.setItem("usedLooks", JSON.stringify(lookHistory))
    setUsageUpdated(true)
  }

  // Handle saving outfit
  const handleSaveOutfit = () => {
    // Get existing saved looks
    const savedLooks = localStorage.getItem("savedLooks")
    const looks = savedLooks ? JSON.parse(savedLooks) : []

    // Create new look
    const newLook = {
      id: Date.now().toString(),
      name: `Look para ${occasion} (${climate})`,
      items: generatedOutfit,
      occasion: occasion,
      climate: climate,
      style: "casual", // Default style
      dateCreated: new Date().toISOString(),
      isFavorite: false,
    }

    // Add to saved looks
    looks.push(newLook)
    localStorage.setItem("savedLooks", JSON.stringify(looks))
    setOutfitSaved(true)
  }

  // Handle regenerating outfit
  const handleRegenerateOutfit = () => {
    setCurrentStep("chat")
    setIsChatOpen(true)
    setGeneratedOutfit([])
    setIsOutfitDialogOpen(false)
    setUsageUpdated(false)
    setOutfitSaved(false)
  }

  // If no items in wardrobe, show empty state
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

        {currentStep === "chat" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Creación de Look
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                ARIN te hará algunas preguntas para entender qué tipo de look necesitas y luego te sugerirá
                combinaciones perfectas usando las prendas de tu armario.
              </p>

              {baseItem && (
                <div className="bg-primary/5 p-4 rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden">
                    <img
                      src={baseItem.image || "/placeholder.svg"}
                      alt={baseItem.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Prenda base seleccionada:</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {baseItem.type} {baseItem.color}
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={() => setIsChatOpen(true)} className="w-full gap-2" size="lg">
                <Sparkles className="h-4 w-4" />
                {baseItem ? "Crear look con esta prenda" : "Empezar a crear mi look"}
              </Button>
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

              <ArinPostOutfitChat
                outfit={generatedOutfit}
                onRegenerateOutfit={handleRegenerateOutfit}
                onRecordUsage={handleRecordUsage}
                onSaveOutfit={handleSaveOutfit}
                usageUpdated={usageUpdated}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* ARIN Suggest Chat Dialog */}
      <ArinSuggestChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onDecision={handleOutfitGenerated}
        items={wardrobeItems}
        baseItem={baseItem}
        startWithPresentation={true}
      />

      {/* Outfit Visualization Dialog */}
      {generatedOutfit.length > 0 && (
        <OutfitVisualization
          items={generatedOutfit}
          isOpen={isOutfitDialogOpen}
          onClose={handleOutfitDialogClose}
          climate={climate}
          occasion={occasion}
        />
      )}
    </div>
  )
}

export default SuggestPage
