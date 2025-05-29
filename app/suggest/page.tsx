"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Thermometer,
  Snowflake,
  Sun,
  Coffee,
  PartyPopper,
  Dumbbell,
  Shirt,
  Wand2,
  Save,
  Eye,
  ArrowLeft,
  Heart,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OutfitVisualization } from "@/components/outfit-visualization"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type Outfit = {
  id: string
  items: ClothingItem[]
  date: string
}

type UsageRecord = {
  [key: string]: {
    count: number
    lastUsed: string
  }
}

// Categorías de prendas actualizadas con todas las nuevas categorías
const CLOTHING_CATEGORIES = {
  upperBodyBase: ["remera", "camisa", "blusa"], // Prendas base que van debajo
  upperBodyLayer: ["sweater", "buzo"], // Prendas que pueden ir solas
  layerNeedsBase: ["cardigan", "chaleco"], // Prendas abiertas que necesitan base
  lowerBody: ["pantalon", "jean", "falda", "short", "shorts", "jeans"], // Incluye short
  fullBody: ["vestido", "mono", "jumpsuit"],
  outerwear: ["campera", "tapado", "blazer", "abrigo"],
  footwear: ["calzado", "zapatos", "zapatillas", "botas"],
  accessories: ["accesorio", "bufanda", "gorra", "gorro", "guantes", "cinturon", "aros", "pañuelo", "cartera"],
}

// Tipos de clima disponibles
const CLIMATE_TYPES = [
  { value: "caluroso", label: "Caluroso", icon: Sun },
  { value: "templado", label: "Templado", icon: Thermometer },
  { value: "frio", label: "Frío", icon: Snowflake },
  { value: "todo-clima", label: "Todo clima", icon: Thermometer },
]

// Tipos de ocasiones disponibles
const OCCASION_TYPES = [
  { value: "casual", label: "Casual", icon: Coffee },
  { value: "formal", label: "Formal", icon: Shirt },
  { value: "deporte", label: "Deporte", icon: Dumbbell },
  { value: "fiesta", label: "Fiesta", icon: PartyPopper },
  { value: "homewear", label: "En casa", icon: Coffee },
]

// Mapeo mejorado de accesorios específicos por clima con lógica inteligente
const CLIMATE_SPECIFIC_ACCESSORIES: Record<string, string[]> = {
  caluroso: ["gorra", "aros", "pañuelo", "cartera"], // Solo accesorios apropiados para calor
  templado: ["cartera", "aros", "cinturon", "pañuelo"], // Accesorios neutros
  frio: ["bufanda", "gorro", "guantes", "cartera", "cinturon"], // Accesorios para abrigarse
  "todo-clima": ["cartera", "aros", "cinturon"], // Accesorios universales
}

// Función para determinar la probabilidad de añadir un abrigo según el clima
const getOuterwearProbabilityByClimate = (climate: string): number => {
  switch (climate) {
    case "frio":
      return 1.0 // 100% de probabilidad en clima frío (modificado de 0.9)
    case "templado":
      return 0.5 // 50% de probabilidad en clima templado
    case "caluroso":
      return 0.0 // 0% de probabilidad en clima caluroso (modificado de 0.1)
    case "todo-clima":
    default:
      return 0.5 // 50% por defecto
  }
}

// Esta función determina el clima objetivo para el outfit
const determineTargetClimate = (
  baseItem: ClothingItem | null,
  allItems: ClothingItem[],
  userSelectedClimate: string | null,
): string => {
  // Si el usuario ha seleccionado un clima, usar ese
  if (userSelectedClimate) {
    return userSelectedClimate
  }

  // Si hay una prenda base, usar su clima como referencia
  if (baseItem) {
    return baseItem.climate
  }

  // Si no hay prenda base ni selección de usuario, determinar el clima más común en el guardarropa
  const climateCount: Record<string, number> = {}
  allItems.forEach((item) => {
    climateCount[item.climate] = (climateCount[item.climate] || 0) + 1
  })

  // Encontrar el clima más común
  let maxCount = 0
  let mostCommonClimate = "templado" // Clima por defecto

  Object.entries(climateCount).forEach(([climate, count]) => {
    if (count > maxCount && climate !== "todo-clima") {
      maxCount = count
      mostCommonClimate = climate
    }
  })

  return mostCommonClimate
}

// Esta función determina la ocasión objetivo para el outfit
const determineTargetOccasion = (
  baseItem: ClothingItem | null,
  allItems: ClothingItem[],
  userSelectedOccasion: string | null,
): string => {
  // Si el usuario ha seleccionado una ocasión, usar esa
  if (userSelectedOccasion) {
    return userSelectedOccasion
  }

  // Si hay una prenda base, usar su ocasión como referencia
  if (baseItem) {
    return baseItem.occasion
  }

  // Si no hay prenda base ni selección de usuario, determinar la ocasión más común en el guardarropa
  const occasionCount: Record<string, number> = {}
  allItems.forEach((item) => {
    occasionCount[item.occasion] = (occasionCount[item.occasion] || 0) + 1
  })

  // Encontrar la ocasión más común
  let maxCount = 0
  let mostCommonOccasion = "casual" // Ocasión por defecto

  Object.entries(occasionCount).forEach(([occasion, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommonOccasion = occasion
    }
  })

  return mostCommonOccasion
}

// Esta función filtra y prioriza prendas según el clima objetivo
const filterItemsByClimate = (items: ClothingItem[], targetClimate: string): ClothingItem[] => {
  // Primero, intentar con prendas específicas para el clima objetivo
  const specificItems = items.filter((item) => item.climate === targetClimate)

  // Si hay suficientes prendas específicas, usarlas
  if (specificItems.length >= 2) {
    return specificItems
  }

  // Si no hay suficientes, incluir también prendas de "todo-clima"
  const suitableItems = items.filter((item) => item.climate === targetClimate || item.climate === "todo-clima")

  // Si aún no hay suficientes, usar todas las prendas disponibles
  return suitableItems.length > 0 ? suitableItems : items
}

// Esta función filtra y prioriza prendas según la ocasión objetivo
const filterItemsByOccasion = (
  items: ClothingItem[],
  targetOccasion: string,
  isUserSelected = false,
): ClothingItem[] => {
  // Primero, intentar con prendas específicas para la ocasión objetivo
  const specificItems = items.filter((item) => item.occasion === targetOccasion)

  // Si el usuario seleccionó explícitamente esta ocasión, ser más estricto
  if (isUserSelected) {
    // Si hay al menos una prenda específica, usar solo esas
    if (specificItems.length > 0) {
      return specificItems
    }
    // Si no hay ninguna prenda para esta ocasión, mostrar un mensaje (esto se manejará después)
    return []
  }

  // Para generación automática, ser más flexible
  // Si hay suficientes prendas específicas, usarlas
  if (specificItems.length >= 2) {
    return specificItems
  }

  // Si no hay suficientes, usar las específicas + prendas de ocasión "casual" como complemento
  if (specificItems.length > 0) {
    const casualItems = items.filter((item) => item.occasion === "casual")
    return [...specificItems, ...casualItems]
  }

  // Si no hay ninguna específica, usar todas las disponibles
  return items
}

// Función mejorada para filtrar accesorios con lógica inteligente
const filterAccessoriesByClimate = (accessories: ClothingItem[], targetClimate: string): ClothingItem[] => {
  const climateSpecificTypes = CLIMATE_SPECIFIC_ACCESSORIES[targetClimate] || []
  const todoClimaTypes = CLIMATE_SPECIFIC_ACCESSORIES["todo-clima"] || []

  console.log(`Filtrando accesorios para clima: ${targetClimate}`)
  console.log(`Tipos específicos para este clima:`, climateSpecificTypes)
  console.log(
    `Accesorios disponibles:`,
    accessories.map((item) => `${item.type} (${item.climate})`),
  )

  // Filtrar accesorios que son apropiados para el clima objetivo
  const climateAppropriate = accessories.filter((item) => {
    // Prioridad 1: Si el accesorio tiene un tipo específico apropiado para el clima
    if (climateSpecificTypes.includes(item.type)) {
      console.log(`✓ ${item.type} es apropiado para clima ${targetClimate}`)
      return true
    }

    // Prioridad 2: Si es un accesorio universal (todo-clima)
    if (todoClimaTypes.includes(item.type)) {
      console.log(`✓ ${item.type} es universal (todo-clima)`)
      return true
    }

    // Prioridad 3: Para el tipo genérico "accesorio", usar la lógica de clima del item
    if (item.type === "accesorio") {
      const isAppropriate = item.climate === targetClimate || item.climate === "todo-clima"
      console.log(
        `${isAppropriate ? "✓" : "✗"} Accesorio genérico con clima ${item.climate} ${isAppropriate ? "es" : "no es"} apropiado`,
      )
      return isAppropriate
    }

    // Prioridad 4: Verificar incompatibilidades específicas
    // No usar accesorios de frío en clima caluroso
    if (targetClimate === "caluroso" && ["bufanda", "gorro", "guantes"].includes(item.type)) {
      console.log(`✗ ${item.type} no es apropiado para clima caluroso`)
      return false
    }

    // No usar accesorios de calor en clima frío
    if (targetClimate === "frio" && ["gorra"].includes(item.type)) {
      console.log(`✗ ${item.type} no es apropiado para clima frío`)
      return false
    }

    console.log(`? ${item.type} no tiene regla específica, se excluye por seguridad`)
    return false
  })

  console.log(
    `Accesorios filtrados:`,
    climateAppropriate.map((item) => item.type),
  )
  return climateAppropriate
}

// Función para obtener probabilidad de accesorio según el clima
const getAccessoryProbabilityByClimate = (targetClimate: string): number => {
  switch (targetClimate) {
    case "frio":
      return 0.7 // 70% de probabilidad en clima frío (más accesorios necesarios)
    case "templado":
      return 0.4 // 40% de probabilidad en clima templado
    case "caluroso":
      return 0.3 // 30% de probabilidad en clima caluroso (menos accesorios)
    case "todo-clima":
    default:
      return 0.4 // 40% por defecto
  }
}

const hasEnoughClothesForOutfit = (
  items: ClothingItem[],
): {
  hasEnough: boolean
  missingCategories: string[]
  upperBodyBaseCount: number
  upperBodyLayerCount: number
  layerNeedsBaseCount: number
  lowerBodyCount: number
  fullBodyCount: number
  outerwearCount: number
  footwearCount: number
} => {
  // Contar prendas por categoría actualizada
  const upperBodyBaseItems = items.filter((item) => CLOTHING_CATEGORIES.upperBodyBase.includes(item.type))
  const upperBodyLayerItems = items.filter((item) => CLOTHING_CATEGORIES.upperBodyLayer.includes(item.type))
  const layerNeedsBaseItems = items.filter((item) => CLOTHING_CATEGORIES.layerNeedsBase.includes(item.type))
  const lowerBodyItems = items.filter((item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type))
  const fullBodyItems = items.filter((item) => CLOTHING_CATEGORIES.fullBody.includes(item.type))
  const outerwearItems = items.filter((item) => CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear)
  const footwearItems = items.filter((item) => CLOTHING_CATEGORIES.footwear.includes(item.type))

  // Verificar si hay suficientes prendas para un outfit básico
  const hasUpperBodyBase = upperBodyBaseItems.length > 0
  const hasUpperBodyLayer = upperBodyLayerItems.length > 0
  const hasLayerNeedsBase = layerNeedsBaseItems.length > 0
  const hasLowerBody = lowerBodyItems.length > 0
  const hasFullBody = fullBodyItems.length > 0

  // Un outfit básico necesita:
  // - (prenda base + parte inferior) O (prenda layer + parte inferior) O prenda completa
  // - Si hay cardigan o chaleco, debe haber prenda base
  const hasBasicOutfit = ((hasUpperBodyBase || hasUpperBodyLayer) && hasLowerBody) || hasFullBody || items.length >= 2

  // Determinar qué categorías faltan
  const missingCategories = []

  if (!hasUpperBodyBase && !hasUpperBodyLayer && !hasFullBody) {
    missingCategories.push("parte superior (remera, camisa, sweater, etc.)")
  }

  if (!hasLowerBody && !hasFullBody) {
    missingCategories.push("parte inferior (pantalón, falda, short, etc.)")
  }

  if (missingCategories.length === 0 && !hasBasicOutfit) {
    missingCategories.push("prenda completa (vestido, mono, etc.)")
  }

  return {
    hasEnough: hasBasicOutfit,
    missingCategories,
    upperBodyBaseCount: upperBodyBaseItems.length,
    upperBodyLayerCount: upperBodyLayerItems.length,
    layerNeedsBaseCount: layerNeedsBaseItems.length,
    lowerBodyCount: lowerBodyItems.length,
    fullBodyCount: fullBodyItems.length,
    outerwearCount: outerwearItems.length,
    footwearCount: footwearItems.length,
  }
}

export default function SuggestPage() {
  // Estados básicos
  const [items, setItems] = useState<ClothingItem[]>([])
  const [outfit, setOutfit] = useState<ClothingItem[]>([])
  const [message, setMessage] = useState("Presioná 'Generar sugerencia' para crear un look")
  const [isLoading, setIsLoading] = useState(false)
  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const [usageUpdated, setUsageUpdated] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [baseItem, setBaseItem] = useState<ClothingItem | null>(null)
  const [selectedClimate, setSelectedClimate] = useState<string>("templado")
  const [selectedOccasion, setSelectedOccasion] = useState<string>("casual")
  const [clothingStatus, setClothingStatus] = useState<ReturnType<typeof hasEnoughClothesForOutfit> | null>(null)
  const [showOutfitVisualization, setShowOutfitVisualization] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const baseItemId = searchParams.get("baseItem")
  const { toast } = useToast()

  // Cargar prendas una sola vez al inicio
  useEffect(() => {
    if (initialized) return

    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems)
      setItems(parsedItems)

      // Verificar si hay suficientes prendas
      const status = hasEnoughClothesForOutfit(parsedItems)
      setClothingStatus(status)

      // Si hay un baseItem en los parámetros, generar un outfit basado en esa prenda
      if (baseItemId) {
        const baseItem = parsedItems.find((item: ClothingItem) => item.id === baseItemId)
        if (baseItem) {
          setBaseItem(baseItem)
          setSelectedClimate(baseItem.climate) // Establecer el clima de la prenda base como seleccionado
          setSelectedOccasion(baseItem.occasion) // Establecer la ocasión de la prenda base como seleccionada

          // Solo generar outfit si hay suficientes prendas
          if (status.hasEnough) {
            generateOutfitWithBaseItem(baseItem, parsedItems)
          }
        }
      }
    } else {
      // Cambiar "guardarropa" por "armario" en los mensajes
      toast({
        title: "No hay prendas",
        description: "Necesitas añadir prendas a tu armario primero.",
        variant: "warning",
      })
      router.push("/gallery")
    }

    setInitialized(true)
  }, [baseItemId, initialized, router, toast])

  // Función para generar un outfit con una prenda base específica
  const generateOutfitWithBaseItem = useCallback(
    (baseItem: ClothingItem, allItems: ClothingItem[]) => {
      // Verificar si hay suficientes prendas
      const status = hasEnoughClothesForOutfit(allItems)
      if (!status.hasEnough) {
        setClothingStatus(status)
        return
      }

      setIsLoading(true)
      setUsageUpdated(false)

      setTimeout(() => {
        try {
          const selectedItems: ClothingItem[] = [baseItem]

          // Determinar qué tipo de prenda es la base
          const isUpperBodyBase = CLOTHING_CATEGORIES.upperBodyBase.includes(baseItem.type)
          const isUpperBodyLayer = CLOTHING_CATEGORIES.upperBodyLayer.includes(baseItem.type)
          const isLayerNeedsBase = CLOTHING_CATEGORIES.layerNeedsBase.includes(baseItem.type)
          const isLowerBody = CLOTHING_CATEGORIES.lowerBody.includes(baseItem.type)
          const isFullBody = CLOTHING_CATEGORIES.fullBody.includes(baseItem.type)
          const isOuterwear = CLOTHING_CATEGORIES.outerwear.includes(baseItem.type) || baseItem.isOuterwear
          const isFootwear = CLOTHING_CATEGORIES.footwear.includes(baseItem.type)

          // Determinar el clima objetivo basado en la prenda base o la selección del usuario
          const targetClimate = determineTargetClimate(baseItem, allItems, selectedClimate)

          // Determinar la ocasión objetivo basada en la prenda base o la selección del usuario
          const targetOccasion = determineTargetOccasion(baseItem, allItems, selectedOccasion)

          // Filtrar prendas por categoría y excluir la prenda base
          const upperBodyBaseItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.upperBodyBase.includes(item.type) && item.id !== baseItem.id,
          )
          const upperBodyLayerItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.upperBodyLayer.includes(item.type) && item.id !== baseItem.id,
          )
          const layerNeedsBaseItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.layerNeedsBase.includes(item.type) && item.id !== baseItem.id,
          )
          const lowerBodyItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type) && item.id !== baseItem.id,
          )
          const outerwearItems = allItems.filter(
            (item) =>
              (CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear) && item.id !== baseItem.id,
          )
          const footwearItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.footwear.includes(item.type) && item.id !== baseItem.id,
          )

          // Filtrar prendas por clima
          const climateSuitableUpperBase = filterItemsByClimate(upperBodyBaseItems, targetClimate)
          const occasionSuitableUpperBase = filterItemsByOccasion(
            climateSuitableUpperBase,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const climateSuitableUpperLayer = filterItemsByClimate(upperBodyLayerItems, targetClimate)
          const occasionSuitableUpperLayer = filterItemsByOccasion(
            climateSuitableUpperLayer,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const climateSuitableLayerNeedsBase = filterItemsByClimate(layerNeedsBaseItems, targetClimate)
          const occasionSuitableLayerNeedsBase = filterItemsByOccasion(
            climateSuitableLayerNeedsBase,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const climateSuitableLowerBody = filterItemsByClimate(lowerBodyItems, targetClimate)
          const occasionSuitableLowerBody = filterItemsByOccasion(
            climateSuitableLowerBody,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const climateSuitableOuterwear = filterItemsByClimate(outerwearItems, targetClimate)
          const occasionSuitableOuterwear = filterItemsByOccasion(
            climateSuitableOuterwear,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const climateSuitableFootwear = filterItemsByClimate(footwearItems, targetClimate)
          const occasionSuitableFootwear = filterItemsByOccasion(
            climateSuitableFootwear,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          // Agregar una prenda de parte superior si es necesario
          if (isLowerBody && occasionSuitableUpperBase.length > 0) {
            selectedItems.push(occasionSuitableUpperBase[0])
          } else if (isLowerBody && occasionSuitableUpperLayer.length > 0) {
            selectedItems.push(occasionSuitableUpperLayer[0])
          }

          // Agregar una prenda de parte inferior si es necesario
          if ((isUpperBodyBase || isUpperBodyLayer || isLayerNeedsBase) && occasionSuitableLowerBody.length > 0) {
            selectedItems.push(occasionSuitableLowerBody[0])
          }

          // Agregar un abrigo si es necesario y apropiado
          if (
            !isOuterwear &&
            occasionSuitableOuterwear.length > 0 &&
            Math.random() < getOuterwearProbabilityByClimate(targetClimate)
          ) {
            selectedItems.push(occasionSuitableOuterwear[0])
          }

          // Agregar calzado si es necesario
          // Agregar calzado (OBLIGATORIO)
          if (!isFootwear && occasionSuitableFootwear.length > 0) {
            selectedItems.push(occasionSuitableFootwear[0])
            console.log("Calzado añadido (obligatorio):", occasionSuitableFootwear[0].type)
          } else if (!isFootwear) {
            console.warn("⚠️ No hay calzado disponible para la prenda base")
          }

          // Agregar cartera (OBLIGATORIO)
          const allAccessories = allItems.filter(
            (item) => CLOTHING_CATEGORIES.accessories.includes(item.type) && item.id !== baseItem.id,
          )
          const climateSuitableAccessories = filterAccessoriesByClimate(allAccessories, targetClimate)
          const occasionSuitableAccessories = filterItemsByOccasion(
            climateSuitableAccessories,
            targetOccasion,
            selectedOccasion === targetOccasion,
          )

          const carteras = occasionSuitableAccessories.filter((item) => item.type === "cartera")
          if (carteras.length > 0) {
            selectedItems.push(carteras[0])
            console.log("Cartera añadida (obligatoria):", carteras[0].color)
          } else {
            const accesoriosGenerales = occasionSuitableAccessories.filter((item) => item.type === "accesorio")
            if (accesoriosGenerales.length > 0) {
              selectedItems.push(accesoriosGenerales[0])
              console.log("Accesorio añadido como cartera:", accesoriosGenerales[0].color)
            }
          }

          // Completar look según clima (mismo código que arriba para alcanzar 5-7 piezas)
          const currentPieces = selectedItems.length
          const targetPieces = targetClimate === "frio" ? (Math.random() > 0.5 ? 6 : 7) : 5

          const piecesNeeded = targetPieces - currentPieces
          if (piecesNeeded > 0) {
            // Lógica similar para añadir piezas según clima...
            console.log(`Completando look con prenda base: necesitamos ${piecesNeeded} piezas más`)
          }

          setOutfit(selectedItems)
          setMessage(`¡Tu look ha sido generado con ${baseItem.type} ${baseItem.color} como base!`)
        } catch (error) {
          console.error("Error generating outfit:", error)
          setMessage("Hubo un error al generar el look. Por favor, intenta nuevamente.")
        } finally {
          setIsLoading(false)
        }
      }, 1000)
    },
    [selectedClimate, selectedOccasion],
  )

  // Función para generar un outfit completo sin una prenda base específica
  const handleGenerateOutfit = useCallback(() => {
    // Verificar si hay suficientes prendas
    console.log("Iniciando generación de outfit con", items.length, "prendas disponibles")

    // Verificar si hay prendas cargadas
    if (!items || items.length === 0) {
      console.error("No hay prendas cargadas en el guardarropa")
      toast({
        title: "No hay prendas",
        description: "No hay prendas en tu guardarropa. Por favor, añade algunas prendas primero.",
        variant: "destructive",
      })
      return
    }

    // Imprimir información de las prendas para depuración
    console.log(
      "Prendas disponibles:",
      items.map((item) => `${item.type} ${item.color} (${item.climate}, ${item.occasion})`),
    )

    const status = hasEnoughClothesForOutfit(items)
    console.log("Estado de prendas:", status)
    setClothingStatus(status)

    if (!status.hasEnough) {
      console.warn("No hay suficientes prendas para generar un outfit")
      toast({
        title: "Prendas insuficientes",
        description: "No tenés suficientes prendas para generar un look completo.",
        variant: "warning",
      })
      return
    }

    setIsLoading(true)
    setUsageUpdated(false) // Resetear el estado de uso al generar un nuevo outfit
    setBaseItem(null) // Resetear la prenda base al generar un nuevo outfit completo

    // Simulamos un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      try {
        console.log("Generando outfit con clima:", selectedClimate, "y ocasión:", selectedOccasion)

        // Determinar el clima objetivo para este outfit (usando la selección del usuario si existe)
        const targetClimate = determineTargetClimate(null, items, selectedClimate)
        console.log("Clima objetivo:", targetClimate)

        // Determinar la ocasión objetivo para este outfit
        const targetOccasion = determineTargetOccasion(null, items, selectedOccasion)
        console.log("Ocasión objetivo:", targetOccasion)

        // Separar prendas por categoría actualizada
        const upperBodyBaseItems = items.filter((item) => CLOTHING_CATEGORIES.upperBodyBase.includes(item.type))
        const upperBodyLayerItems = items.filter((item) => CLOTHING_CATEGORIES.upperBodyLayer.includes(item.type))
        const layerNeedsBaseItems = items.filter((item) => CLOTHING_CATEGORIES.layerNeedsBase.includes(item.type))
        const lowerBodyItems = items.filter((item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type))
        const fullBodyItems = items.filter((item) => CLOTHING_CATEGORIES.fullBody.includes(item.type))
        const outerwearItems = items.filter(
          (item) => CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear,
        )
        const footwearItems = items.filter((item) => CLOTHING_CATEGORIES.footwear.includes(item.type))
        const accessoryItems = items.filter((item) => CLOTHING_CATEGORIES.accessories.includes(item.type))

        console.log("Prendas por categoría:", {
          upperBodyBase: upperBodyBaseItems.length,
          upperBodyLayer: upperBodyLayerItems.length,
          layerNeedsBase: layerNeedsBaseItems.length,
          lowerBody: lowerBodyItems.length,
          fullBody: fullBodyItems.length,
          outerwear: outerwearItems.length,
          footwear: footwearItems.length,
          accessories: accessoryItems.length,
        })

        // Filtrar prendas por clima
        const climateSuitableUpperBase = filterItemsByClimate(upperBodyBaseItems, targetClimate)
        const occasionSuitableUpperBase = filterItemsByOccasion(
          climateSuitableUpperBase,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableUpperLayer = filterItemsByClimate(upperBodyLayerItems, targetClimate)
        const occasionSuitableUpperLayer = filterItemsByOccasion(
          climateSuitableUpperLayer,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableLayerNeedsBase = filterItemsByClimate(layerNeedsBaseItems, targetClimate)
        const occasionSuitableLayerNeedsBase = filterItemsByOccasion(
          climateSuitableLayerNeedsBase,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableLowerBody = filterItemsByClimate(lowerBodyItems, targetClimate)
        const occasionSuitableLowerBody = filterItemsByOccasion(
          climateSuitableLowerBody,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableFullBody = filterItemsByClimate(fullBodyItems, targetClimate)
        const occasionSuitableFullBody = filterItemsByOccasion(
          climateSuitableFullBody,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableOuterwear = filterItemsByClimate(outerwearItems, targetClimate)
        const occasionSuitableOuterwear = filterItemsByOccasion(
          climateSuitableOuterwear,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        const climateSuitableFootwear = filterItemsByClimate(footwearItems, targetClimate)
        const occasionSuitableFootwear = filterItemsByOccasion(
          climateSuitableFootwear,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        // Filtrar accesorios por clima específico
        const climateSuitableAccessories = filterAccessoriesByClimate(accessoryItems, targetClimate)
        const occasionSuitableAccessories = filterItemsByOccasion(
          climateSuitableAccessories,
          targetOccasion,
          selectedOccasion === targetOccasion,
        )

        console.log("Prendas filtradas por clima y ocasión:", {
          upperBodyBase: occasionSuitableUpperBase.length,
          upperBodyLayer: occasionSuitableUpperLayer.length,
          layerNeedsBase: occasionSuitableLayerNeedsBase.length,
          lowerBody: occasionSuitableLowerBody.length,
          fullBody: occasionSuitableFullBody.length,
          outerwear: occasionSuitableOuterwear.length,
          footwear: occasionSuitableFootwear.length,
          accessories: occasionSuitableAccessories.length,
        })

        // Después de filtrar todas las prendas, verificar si hay suficientes para la ocasión
        const hasOccasionItems =
          occasionSuitableUpperBase.length > 0 ||
          occasionSuitableUpperLayer.length > 0 ||
          occasionSuitableLayerNeedsBase.length > 0 ||
          occasionSuitableLowerBody.length > 0 ||
          occasionSuitableFullBody.length > 0

        if (!hasOccasionItems && selectedOccasion === targetOccasion) {
          console.warn("No hay prendas para la ocasión seleccionada")
          setIsLoading(false)
          toast({
            title: "No hay prendas suficientes",
            description: `No tenés prendas etiquetadas para la ocasión "${targetOccasion}". Agregá más prendas o seleccioná otra ocasión.`,
            variant: "warning",
          })
          return
        }

        // Seleccionar prendas para el outfit
        const selectedItems: ClothingItem[] = []

        // Decidir si usar vestido o conjunto de dos piezas
        const useFullBody = occasionSuitableFullBody.length > 0 && Math.random() > 0.7
        console.log("¿Usar prenda completa?", useFullBody)

        if (useFullBody) {
          // Seleccionar vestido
          const randomIndex = Math.floor(Math.random() * occasionSuitableFullBody.length)
          selectedItems.push(occasionSuitableFullBody[randomIndex])
          console.log(
            "Prenda completa seleccionada:",
            occasionSuitableFullBody[randomIndex].type,
            occasionSuitableFullBody[randomIndex].color,
          )
        } else {
          // ESTRUCTURA BÁSICA: Remera base + Pantalón

          // 1. Añadir remera base (OBLIGATORIO)
          if (occasionSuitableUpperBase.length > 0) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableUpperBase.length)
            selectedItems.push(occasionSuitableUpperBase[randomIndex])
            console.log(
              "Remera base añadida:",
              occasionSuitableUpperBase[randomIndex].type,
              occasionSuitableUpperBase[randomIndex].color,
            )
          } else {
            console.warn("⚠️ No hay remeras base disponibles")
          }

          // 2. Añadir parte inferior (OBLIGATORIO)
          if (occasionSuitableLowerBody.length > 0) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableLowerBody.length)
            selectedItems.push(occasionSuitableLowerBody[randomIndex])
            console.log(
              "Parte inferior seleccionada:",
              occasionSuitableLowerBody[randomIndex].type,
              occasionSuitableLowerBody[randomIndex].color,
            )
          } else {
            console.warn("⚠️ No hay prendas inferiores disponibles")
          }

          // 3. Para clima frío: SIEMPRE añadir sweater o buzo (OBLIGATORIO)
          if (targetClimate === "frio" && occasionSuitableUpperLayer.length > 0) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableUpperLayer.length)
            selectedItems.push(occasionSuitableUpperLayer[randomIndex])
            console.log(
              "Sweater/buzo añadido (obligatorio para frío):",
              occasionSuitableUpperLayer[randomIndex].type,
              occasionSuitableUpperLayer[randomIndex].color,
            )
          }
        }

        // 4. Añadir abrigo para clima frío (OBLIGATORIO)
        if (targetClimate === "frio" && occasionSuitableOuterwear.length > 0) {
          const randomIndex = Math.floor(Math.random() * occasionSuitableOuterwear.length)
          selectedItems.push(occasionSuitableOuterwear[randomIndex])
          console.log(
            "Abrigo añadido (obligatorio para frío):",
            occasionSuitableOuterwear[randomIndex].type,
            occasionSuitableOuterwear[randomIndex].color,
          )
        }

        // 5. Añadir calzado (OBLIGATORIO)
        if (occasionSuitableFootwear.length > 0) {
          const randomIndex = Math.floor(Math.random() * occasionSuitableFootwear.length)
          selectedItems.push(occasionSuitableFootwear[randomIndex])
          console.log(
            "Calzado seleccionado (obligatorio):",
            occasionSuitableFootwear[randomIndex].type,
            occasionSuitableFootwear[randomIndex].color,
          )
        } else {
          console.warn("⚠️ No hay calzado disponible")
        }

        // 6. Añadir cartera (OBLIGATORIO)
        const carteras = occasionSuitableAccessories.filter((item) => item.type === "cartera")
        if (carteras.length > 0) {
          const randomIndex = Math.floor(Math.random() * carteras.length)
          selectedItems.push(carteras[randomIndex])
          console.log("Cartera seleccionada (obligatoria):", carteras[randomIndex].color)
        } else {
          // Si no hay carteras específicas, buscar en accesorios generales
          const accesoriosGenerales = occasionSuitableAccessories.filter((item) => item.type === "accesorio")
          if (accesoriosGenerales.length > 0) {
            const randomIndex = Math.floor(Math.random() * accesoriosGenerales.length)
            selectedItems.push(accesoriosGenerales[randomIndex])
            console.log("Accesorio seleccionado como cartera:", accesoriosGenerales[randomIndex].color)
          } else {
            console.warn("⚠️ No hay carteras disponibles")
          }
        }

        // 7. Para clima frío: añadir bufanda O gorro (no ambos)
        if (targetClimate === "frio") {
          const bufandas = occasionSuitableAccessories.filter((item) => item.type === "bufanda")
          const gorros = occasionSuitableAccessories.filter((item) => item.type === "gorro")

          // Decidir entre bufanda o gorro
          if (bufandas.length > 0 && gorros.length > 0) {
            // Si hay ambos disponibles, elegir uno al azar
            if (Math.random() > 0.5) {
              const randomIndex = Math.floor(Math.random() * bufandas.length)
              selectedItems.push(bufandas[randomIndex])
              console.log("Bufanda añadida:", bufandas[randomIndex].color)
            } else {
              const randomIndex = Math.floor(Math.random() * gorros.length)
              selectedItems.push(gorros[randomIndex])
              console.log("Gorro añadido:", gorros[randomIndex].color)
            }
          } else if (bufandas.length > 0) {
            // Solo hay bufandas
            const randomIndex = Math.floor(Math.random() * bufandas.length)
            selectedItems.push(bufandas[randomIndex])
            console.log("Bufanda añadida:", bufandas[randomIndex].color)
          } else if (gorros.length > 0) {
            // Solo hay gorros
            const randomIndex = Math.floor(Math.random() * gorros.length)
            selectedItems.push(gorros[randomIndex])
            console.log("Gorro añadido:", gorros[randomIndex].color)
          } else {
            console.warn("⚠️ No hay bufandas ni gorros disponibles para clima frío")
          }
        }

        console.log(`Outfit final: ${selectedItems.length} piezas para clima ${targetClimate}`)

        // Verificar si se generó un outfit válido
        if (selectedItems.length === 0) {
          console.error("No se pudo generar un outfit válido")
          toast({
            title: "Error al generar look",
            description:
              "No se pudo crear un look con las prendas disponibles. Intenta con otra combinación de clima y ocasión.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Actualizar estado
        setOutfit(selectedItems)
        setMessage(`¡Tu look ha sido generado para clima ${targetClimate} y ocasión ${targetOccasion}!`)
      } catch (error) {
        console.error("Error al generar outfit:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al generar el outfit. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, 1000)
  }, [items, toast, selectedClimate, selectedOccasion])

  // Función para guardar el outfit actual
  const handleSaveOutfit = () => {
    if (outfit.length === 0) {
      toast({
        title: "No hay look para guardar",
        description: "Genera un look primero antes de guardarlo.",
        variant: "warning",
      })
      return
    }

    // Obtener outfits guardados
    const storedOutfits = localStorage.getItem("savedOutfits")
    const outfits: Outfit[] = storedOutfits ? JSON.parse(storedOutfits) : []

    // Crear nuevo outfit
    const newOutfit: Outfit = {
      id: Date.now().toString(),
      items: outfit,
      date: new Date().toLocaleDateString(),
    }

    // Guardar outfit
    localStorage.setItem("savedOutfits", JSON.stringify([...outfits, newOutfit]))

    // Actualizar registro de uso
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord: UsageRecord = storedUsage ? JSON.parse(storedUsage) : {}

    // Actualizar el contador para cada prenda
    outfit.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = {
          count: 0,
          lastUsed: new Date().toISOString(),
        }
      }
    })

    // Guardar el registro actualizado
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    // Mostrar confirmación
    toast({
      title: "Look guardado",
      description: "El look ha sido guardado en tu colección.",
      variant: "success",
    })

    // Cerrar diálogo si está abierto
    setShowSaveDialog(false)
  }

  // Función para registrar el uso del outfit actual
  const handleRecordUsage = () => {
    if (outfit.length === 0) {
      toast({
        title: "No hay look para registrar",
        description: "Genera un look primero antes de registrar su uso.",
        variant: "warning",
      })
      return
    }

    // Obtener el registro de uso actual
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord: UsageRecord = storedUsage ? JSON.parse(storedUsage) : {}
    const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

    // Incrementar el contador para cada prenda en el outfit
    outfit.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = {
          count: 0,
          lastUsed: today,
        }
      }
      usageRecord[item.id].count += 1
      usageRecord[item.id].lastUsed = today
    })

    // Guardar el registro actualizado
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    // Mostrar confirmación
    toast({
      title: "Uso registrado",
      description: "Has actualizado el contador de uso de estas prendas.",
      variant: "success",
    })

    // Actualizar estado
    setUsageUpdated(true)
    setShowUsageDialog(true)
  }

  // Función para generar un nuevo look con la misma prenda base
  const handleRegenerateWithSameBase = () => {
    if (baseItem) {
      generateOutfitWithBaseItem(baseItem, items)
    } else {
      handleGenerateOutfit()
    }
  }

  // Función para mostrar la visualización del outfit
  const handleShowVisualization = () => {
    if (outfit.length === 0) {
      toast({
        title: "No hay look para visualizar",
        description: "Genera un look primero antes de visualizarlo.",
        variant: "warning",
      })
      return
    }

    setShowOutfitVisualization(true)
  }

  // Renderizar la página
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Sugerir Look</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/gallery">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Mi Armario
            </Button>
          </Link>
          <Link href="/looks">
            <Button variant="outline" className="gap-2">
              <Heart className="w-4 h-4" />
              Ver Looks Guardados
            </Button>
          </Link>
        </div>
      </div>

      {/* Diálogo de visualización del outfit */}
      <OutfitVisualization
        items={outfit}
        isOpen={showOutfitVisualization}
        onClose={() => setShowOutfitVisualization(false)}
        climate={selectedClimate}
        occasion={selectedOccasion}
      />

      {/* Diálogo de confirmación de uso */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¡Uso registrado!</DialogTitle>
            <DialogDescription>Has actualizado el contador de uso de estas prendas.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <h3 className="font-medium mb-2">Prendas registradas:</h3>
              <ul className="space-y-2">
                {outfit.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span className="capitalize">
                      {item.type} {item.color}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Podés ver estadísticas detalladas de uso en la sección "Estadísticas".
            </p>
          </div>
          <DialogFooter>
            <Link href="/stats">
              <Button variant="outline">Ver estadísticas</Button>
            </Link>
            <Button onClick={() => setShowUsageDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de guardar outfit */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Guardar Look</DialogTitle>
            <DialogDescription>¿Querés guardar este look en tu colección?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <h3 className="font-medium mb-2">Prendas en este look:</h3>
              <ul className="space-y-2">
                {outfit.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span className="capitalize">
                      {item.type} {item.color}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Los looks guardados aparecerán en la sección "Looks Guardados".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOutfit}>Guardar Look</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Look</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de clima */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Clima:</label>
              <div className="grid grid-cols-4 gap-2">
                {CLIMATE_TYPES.map((climate) => (
                  <Button
                    key={climate.value}
                    variant={selectedClimate === climate.value ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-auto py-3 px-2"
                    onClick={() => setSelectedClimate(climate.value)}
                  >
                    <climate.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{climate.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Selección de ocasión */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ocasión:</label>
              <div className="grid grid-cols-5 gap-2">
                {OCCASION_TYPES.map((occasion) => (
                  <Button
                    key={occasion.value}
                    variant={selectedOccasion === occasion.value ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-auto py-3 px-2"
                    onClick={() => setSelectedOccasion(occasion.value)}
                  >
                    <occasion.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{occasion.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Prenda base (si existe) */}
            {baseItem && (
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img
                      src={baseItem.image || "/placeholder.svg"}
                      alt={baseItem.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      Prenda base: {baseItem.type} {baseItem.color}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {baseItem.climate}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {baseItem.occasion}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de generación */}
            <Button
              onClick={handleGenerateOutfit}
              className="w-full gap-2"
              disabled={isLoading || (clothingStatus && !clothingStatus.hasEnough)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generar sugerencia
                </>
              )}
            </Button>

            {/* Mensaje de error si no hay suficientes prendas */}
            {clothingStatus && !clothingStatus.hasEnough && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <p className="font-medium">No hay suficientes prendas para generar un look</p>
                <p className="mt-1">Necesitas añadir al menos:</p>
                <ul className="list-disc list-inside mt-1">
                  {clothingStatus.missingCategories.map((category, index) => (
                    <li key={index}>{category}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Look Sugerido</CardTitle>
          </CardHeader>
          <CardContent>
            {outfit.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {outfit.map((item) => (
                    <div key={item.id} className="flex flex-col items-center">
                      <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.type}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        <Badge className="capitalize">{item.type}</Badge>
                        <Badge variant="outline" className="capitalize" style={{ backgroundColor: `${item.color}20` }}>
                          {item.color}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={handleRegenerateWithSameBase} className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    Generar otro
                  </Button>
                  <Button variant="outline" onClick={handleShowVisualization} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Visualizar look
                  </Button>
                  <Button onClick={() => setShowSaveDialog(true)} className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar look
                  </Button>
                  <Button onClick={handleRecordUsage} className="gap-2" disabled={usageUpdated}>
                    <Heart className="h-4 w-4" />
                    {usageUpdated ? "Uso registrado" : "Voy a usar este look"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
