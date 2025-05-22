"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wand2,
  ArrowLeft,
  Save,
  Heart,
  CheckCircle2,
  Thermometer,
  Snowflake,
  Sun,
  Coffee,
  Briefcase,
  PartyPopper,
  Dumbbell,
  Shirt,
  AlertCircle,
  Upload,
  Eye,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

// Categorías de prendas
const CLOTHING_CATEGORIES = {
  upperBody: ["remera", "camisa", "sweater", "buzo", "cardigan", "blusa"],
  lowerBody: ["pantalon", "jean", "falda", "shorts", "jeans"],
  fullBody: ["vestido", "mono", "jumpsuit"],
  outerwear: ["campera", "tapado", "blazer", "abrigo"],
  footwear: ["calzado", "zapatos", "zapatillas", "botas"],
  accessories: ["accesorio", "bufanda", "gorro", "guantes", "cinturon"],
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

// Nueva función para verificar si hay suficientes prendas para generar un look completo
const hasEnoughClothesForOutfit = (
  items: ClothingItem[],
): {
  hasEnough: boolean
  missingCategories: string[]
  upperBodyCount: number
  lowerBodyCount: number
  fullBodyCount: number
  outerwearCount: number
  footwearCount: number
} => {
  // Contar prendas por categoría
  const upperBodyItems = items.filter((item) => CLOTHING_CATEGORIES.upperBody.includes(item.type))
  const lowerBodyItems = items.filter((item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type))
  const fullBodyItems = items.filter((item) => CLOTHING_CATEGORIES.fullBody.includes(item.type))
  const outerwearItems = items.filter((item) => CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear)
  const footwearItems = items.filter((item) => CLOTHING_CATEGORIES.footwear.includes(item.type))

  // Verificar si hay suficientes prendas para un outfit básico
  const hasUpperBody = upperBodyItems.length > 0
  const hasLowerBody = lowerBodyItems.length > 0
  const hasFullBody = fullBodyItems.length > 0

  // Un outfit básico necesita: (parte superior + parte inferior) O una prenda completa
  // O al menos 2 prendas de cualquier tipo (más flexible)
  const hasBasicOutfit = (hasUpperBody && hasLowerBody) || hasFullBody || items.length >= 2

  // Determinar qué categorías faltan
  const missingCategories = []

  if (!hasUpperBody && !hasFullBody) {
    missingCategories.push("parte superior (remera, camisa, etc.)")
  }

  if (!hasLowerBody && !hasFullBody) {
    missingCategories.push("parte inferior (pantalón, falda, etc.)")
  }

  if (missingCategories.length === 0 && !hasBasicOutfit) {
    missingCategories.push("prenda completa (vestido, mono, etc.)")
  }

  return {
    hasEnough: hasBasicOutfit,
    missingCategories,
    upperBodyCount: upperBodyItems.length,
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
          const isUpperBody = CLOTHING_CATEGORIES.upperBody.includes(baseItem.type)
          const isLowerBody = CLOTHING_CATEGORIES.lowerBody.includes(baseItem.type)
          const isFullBody = CLOTHING_CATEGORIES.fullBody.includes(baseItem.type)
          const isOuterwear = CLOTHING_CATEGORIES.outerwear.includes(baseItem.type) || baseItem.isOuterwear
          const isFootwear = CLOTHING_CATEGORIES.footwear.includes(baseItem.type)

          // Determinar el clima objetivo basado en la prenda base o la selección del usuario
          const targetClimate = determineTargetClimate(baseItem, allItems, selectedClimate)

          // Determinar la ocasión objetivo basada en la prenda base o la selección del usuario
          const targetOccasion = determineTargetOccasion(baseItem, allItems, selectedOccasion)

          // Filtrar prendas por categoría y excluir la prenda base
          const upperBodyItems = allItems.filter(
            (item) => CLOTHING_CATEGORIES.upperBody.includes(item.type) && item.id !== baseItem.id,
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

          // Filtrar prendas por clima y ocasión
          const climateSuitableUpperBody = filterItemsByClimate(upperBodyItems, targetClimate)
          const occasionSuitableUpperBody = filterItemsByOccasion(
            climateSuitableUpperBody,
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

          // Añadir prendas complementarias según la base, priorizando el clima adecuado
          if (isUpperBody && occasionSuitableLowerBody.length > 0) {
            // Si la base es parte superior, añadir parte inferior
            const randomIndex = Math.floor(Math.random() * occasionSuitableLowerBody.length)
            selectedItems.push(occasionSuitableLowerBody[randomIndex])
          } else if (isLowerBody && occasionSuitableUpperBody.length > 0) {
            // Si la base es parte inferior, añadir parte superior
            const randomIndex = Math.floor(Math.random() * occasionSuitableUpperBody.length)
            selectedItems.push(occasionSuitableUpperBody[randomIndex])
          }

          // Si no es un abrigo, considerar añadir uno según el clima
          if (!isOuterwear && occasionSuitableOuterwear.length > 0) {
            // Obtener probabilidad según el clima
            const probability = getOuterwearProbabilityByClimate(targetClimate)

            // Decidir si añadir abrigo basado en la probabilidad ajustada
            if (Math.random() < probability) {
              const randomIndex = Math.floor(Math.random() * occasionSuitableOuterwear.length)
              selectedItems.push(occasionSuitableOuterwear[randomIndex])
            }
          }

          // Si no es calzado y hay calzado disponible, añadir uno con 70% de probabilidad
          if (!isFootwear && occasionSuitableFootwear.length > 0 && Math.random() > 0.3) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableFootwear.length)
            selectedItems.push(occasionSuitableFootwear[randomIndex])
          }

          // Actualizar estado
          setOutfit(selectedItems)
          setMessage(
            `¡Look generado con tu ${baseItem.type} ${baseItem.color} para clima ${targetClimate} y ocasión ${targetOccasion}!`,
          )
        } catch (error) {
          console.error("Error al generar outfit:", error)
          toast({
            title: "Error",
            description: "Ocurrió un error al generar el outfit.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }, 500)
    },
    [toast, selectedClimate, selectedOccasion],
  )

  // Función para generar un outfit básico
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

        // Separar prendas por categoría
        const upperBodyItems = items.filter((item) => CLOTHING_CATEGORIES.upperBody.includes(item.type))
        const lowerBodyItems = items.filter((item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type))
        const fullBodyItems = items.filter((item) => CLOTHING_CATEGORIES.fullBody.includes(item.type))
        const outerwearItems = items.filter(
          (item) => CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear,
        )
        const footwearItems = items.filter((item) => CLOTHING_CATEGORIES.footwear.includes(item.type))

        console.log("Prendas por categoría:", {
          upperBody: upperBodyItems.length,
          lowerBody: lowerBodyItems.length,
          fullBody: fullBodyItems.length,
          outerwear: outerwearItems.length,
          footwear: footwearItems.length,
        })

        // Filtrar prendas por clima
        const climateSuitableUpperBody = filterItemsByClimate(upperBodyItems, targetClimate)
        const occasionSuitableUpperBody = filterItemsByOccasion(
          climateSuitableUpperBody,
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

        console.log("Prendas filtradas por clima y ocasión:", {
          upperBody: occasionSuitableUpperBody.length,
          lowerBody: occasionSuitableLowerBody.length,
          fullBody: occasionSuitableFullBody.length,
          outerwear: occasionSuitableOuterwear.length,
          footwear: occasionSuitableFootwear.length,
        })

        // Después de filtrar todas las prendas, verificar si hay suficientes para la ocasión
        const hasOccasionItems =
          occasionSuitableUpperBody.length > 0 ||
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
          // Seleccionar parte superior
          if (occasionSuitableUpperBody.length > 0) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableUpperBody.length)
            selectedItems.push(occasionSuitableUpperBody[randomIndex])
            console.log(
              "Parte superior seleccionada:",
              occasionSuitableUpperBody[randomIndex].type,
              occasionSuitableUpperBody[randomIndex].color,
            )
          } else {
            console.warn("No hay prendas superiores disponibles para la selección")
          }

          // Seleccionar parte inferior
          if (occasionSuitableLowerBody.length > 0) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableLowerBody.length)
            selectedItems.push(occasionSuitableLowerBody[randomIndex])
            console.log(
              "Parte inferior seleccionada:",
              occasionSuitableLowerBody[randomIndex].type,
              occasionSuitableLowerBody[randomIndex].color,
            )
          } else {
            console.warn("No hay prendas inferiores disponibles para la selección")
          }
        }

        // Añadir abrigo según el clima
        if (occasionSuitableOuterwear.length > 0 && !selectedItems.some((item) => item.isOuterwear)) {
          // Obtener probabilidad según el clima objetivo
          const probability = getOuterwearProbabilityByClimate(targetClimate)
          console.log("Probabilidad de añadir abrigo:", probability)

          // Decidir si añadir abrigo basado en la probabilidad ajustada
          if (Math.random() < probability) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableOuterwear.length)
            selectedItems.push(occasionSuitableOuterwear[randomIndex])
            console.log(
              "Abrigo seleccionado:",
              occasionSuitableOuterwear[randomIndex].type,
              occasionSuitableOuterwear[randomIndex].color,
            )
          }
        }

        // Añadir calzado con 70% de probabilidad
        if (occasionSuitableFootwear.length > 0 && Math.random() > 0.3) {
          const randomIndex = Math.floor(Math.random() * occasionSuitableFootwear.length)
          selectedItems.push(occasionSuitableFootwear[randomIndex])
          console.log(
            "Calzado seleccionado:",
            occasionSuitableFootwear[randomIndex].type,
            occasionSuitableFootwear[randomIndex].color,
          )
        }

        console.log("Outfit final generado con", selectedItems.length, "prendas")

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
    }, 500)
  }, [items, toast, selectedClimate, selectedOccasion])

  const handleGenerateWithItem = (item: ClothingItem) => {
    // Verificar si hay suficientes prendas
    const status = hasEnoughClothesForOutfit(items)
    setClothingStatus(status)

    if (!status.hasEnough) {
      return
    }

    setIsLoading(true)
    setUsageUpdated(false)
    setBaseItem(item)
    // Actualizar el clima seleccionado al clima de la prenda base
    setSelectedClimate(item.climate)
    // Actualizar la ocasión seleccionada a la ocasión de la prenda base
    setSelectedOccasion(item.occasion)

    setTimeout(() => {
      try {
        // Comenzar con la prenda seleccionada
        const selectedItems: ClothingItem[] = [item]

        // Determinar qué tipo de prenda es la base
        const isUpperBody = CLOTHING_CATEGORIES.upperBody.includes(item.type)
        const isLowerBody = CLOTHING_CATEGORIES.lowerBody.includes(item.type)
        const isFullBody = CLOTHING_CATEGORIES.fullBody.includes(item.type)
        const isOuterwear = CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear
        const isFootwear = CLOTHING_CATEGORIES.footwear.includes(item.type)

        // Determinar el clima objetivo basado en la prenda base o la selección del usuario
        const targetClimate = determineTargetClimate(item, items, selectedClimate)

        // Determinar la ocasión objetivo basada en la prenda base o la selección del usuario
        const targetOccasion = determineTargetOccasion(item, items, selectedOccasion)

        // Filtrar prendas por categoría, excluyendo la prenda base
        const upperBodyItems = items.filter((i) => CLOTHING_CATEGORIES.upperBody.includes(i.type) && i.id !== item.id)
        const lowerBodyItems = items.filter((i) => CLOTHING_CATEGORIES.lowerBody.includes(i.type) && i.id !== item.id)
        const outerwearItems = items.filter(
          (i) => (CLOTHING_CATEGORIES.outerwear.includes(i.type) || i.isOuterwear) && i.id !== item.id,
        )
        const footwearItems = items.filter((i) => CLOTHING_CATEGORIES.footwear.includes(i.type) && i.id !== item.id)

        // Filtrar prendas por clima
        const climateSuitableUpperBody = filterItemsByClimate(upperBodyItems, targetClimate)
        const occasionSuitableUpperBody = filterItemsByOccasion(
          climateSuitableUpperBody,
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

        // Después de filtrar todas las prendas, verificar si hay suficientes para la ocasión
        const hasOccasionItems =
          (isUpperBody || occasionSuitableUpperBody.length > 0) && (isLowerBody || occasionSuitableLowerBody.length > 0)

        if (!hasOccasionItems && selectedOccasion === targetOccasion && !isFullBody) {
          setIsLoading(false)
          toast({
            title: "No hay prendas suficientes",
            description: `No tenés prendas complementarias etiquetadas para la ocasión "${targetOccasion}". Agregá más prendas o seleccioná otra ocasión.`,
            variant: "warning",
          })
          return
        }

        // Añadir prendas complementarias según la base, priorizando el clima adecuado
        if (isUpperBody && occasionSuitableLowerBody.length > 0) {
          // Si la base es parte superior, añadir parte inferior
          const randomIndex = Math.floor(Math.random() * occasionSuitableLowerBody.length)
          selectedItems.push(occasionSuitableLowerBody[randomIndex])
        } else if (isLowerBody && occasionSuitableUpperBody.length > 0) {
          // Si la base es parte inferior, añadir parte superior
          const randomIndex = Math.floor(Math.random() * occasionSuitableUpperBody.length)
          selectedItems.push(occasionSuitableUpperBody[randomIndex])
        }

        // Si no es un abrigo, considerar añadir uno según el clima
        if (!isOuterwear && occasionSuitableOuterwear.length > 0) {
          // Obtener probabilidad según el clima
          const probability = getOuterwearProbabilityByClimate(targetClimate)

          // Decidir si añadir abrigo basado en la probabilidad ajustada
          if (Math.random() < probability) {
            const randomIndex = Math.floor(Math.random() * occasionSuitableOuterwear.length)
            selectedItems.push(occasionSuitableOuterwear[randomIndex])
          }
        }

        // Si no es calzado y hay calzado disponible, añadir uno con 70% de probabilidad
        if (!isFootwear && occasionSuitableFootwear.length > 0 && Math.random() > 0.3) {
          const randomIndex = Math.floor(Math.random() * occasionSuitableFootwear.length)
          selectedItems.push(occasionSuitableFootwear[randomIndex])
        }

        // Actualizar estado
        setOutfit(selectedItems)
        setMessage(
          `¡Look generado con tu ${item.type} ${item.color} para clima ${targetClimate} y ocasión ${targetOccasion}!`,
        )
      } catch (error) {
        console.error("Error al generar outfit con prenda base:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al generar el outfit.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, 500)
  }

  // Función para guardar el outfit
  const handleSaveOutfit = () => {
    if (outfit.length === 0) return

    // Obtener outfits existentes
    const existingOutfits = localStorage.getItem("savedOutfits")
    const outfits: Outfit[] = existingOutfits ? JSON.parse(existingOutfits) : []

    // Añadir nuevo outfit
    const newOutfit: Outfit = {
      id: Date.now().toString(),
      items: outfit,
      date: new Date().toLocaleDateString(),
    }

    // Guardar en localStorage
    localStorage.setItem("savedOutfits", JSON.stringify([...outfits, newOutfit]))

    // Mostrar mensaje de éxito
    toast({
      title: "¡Look guardado!",
      description: "Tu combinación ha sido guardada en 'Mis looks'",
      variant: "success",
    })
  }

  // Función para registrar el uso de las prendas
  const handleRecordUsage = () => {
    if (outfit.length === 0) return

    // Obtener el registro de usos actual
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

    // Mostrar diálogo de confirmación
    setShowUsageDialog(true)
    setUsageUpdated(true)

    // También mostrar un toast
    toast({
      title: "¡Uso registrado!",
      description: "Has actualizado el contador de uso de estas prendas.",
      variant: "success",
    })
  }

  // Obtener el número de usos de cada prenda
  const getItemUsageCount = (itemId: string): number => {
    const storedUsage = localStorage.getItem("clothingUsage")
    if (!storedUsage) return 0

    const usageRecord: UsageRecord = JSON.parse(storedUsage)
    return usageRecord[itemId]?.count || 0
  }

  // Función para obtener la etiqueta de categoría
  const getCategoryLabel = (type: string): string => {
    if (CLOTHING_CATEGORIES.upperBody.includes(type)) return "Parte superior"
    if (CLOTHING_CATEGORIES.lowerBody.includes(type)) return "Parte inferior"
    if (CLOTHING_CATEGORIES.fullBody.includes(type)) return "Prenda completa"
    if (CLOTHING_CATEGORIES.outerwear.includes(type)) return "Abrigo"
    if (CLOTHING_CATEGORIES.footwear.includes(type)) return "Calzado"
    if (CLOTHING_CATEGORIES.accessories.includes(type)) return "Accesorio"
    return type
  }

  // Función para manejar el cambio de clima seleccionado
  const handleClimateChange = (climate: string) => {
    console.log("Clima seleccionado:", climate)
    setSelectedClimate(climate)
    // Si hay un outfit generado, limpiar para evitar inconsistencias con el nuevo clima
    if (outfit.length > 0) {
      setOutfit([])
      // Eliminar el mensaje que causa duplicación
      setMessage("")
    }
  }

  // Función para manejar el cambio de ocasión seleccionada
  const handleOccasionChange = (occasion: string) => {
    console.log("Ocasión seleccionada:", occasion)
    setSelectedOccasion(occasion)
    // Si hay un outfit generado, limpiar para evitar inconsistencias con la nueva ocasión
    if (outfit.length > 0) {
      setOutfit([])
      // Eliminar el mensaje que causa duplicación
      setMessage("")
    }
  }

  // Función para obtener el icono de clima
  const getClimateIcon = (climate: string) => {
    const climateType = CLIMATE_TYPES.find((type) => type.value === climate)
    if (!climateType) return Thermometer
    return climateType.icon
  }

  // Función para obtener el icono de ocasión
  const getOccasionIcon = (occasion: string) => {
    const occasionType = OCCASION_TYPES.find((type) => type.value === occasion)
    if (!occasionType) return Briefcase
    return occasionType.icon
  }

  return (
    <div className="container py-8">
      {/* Diálogo de confirmación de uso */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¡Uso registrado!</DialogTitle>
            <DialogDescription>Has actualizado el contador de uso de estas prendas.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Contador de usos actualizado</h3>
              </div>
              <ul className="space-y-2">
                {outfit.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span className="capitalize">
                      {item.type} {item.color}
                    </span>
                    <Badge variant="secondary">{getItemUsageCount(item.id)} usos</Badge>
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

      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Sugerencia de Look</h1>
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
              Mis looks guardados
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Alerta de prendas insuficientes */}
        {clothingStatus && !clothingStatus.hasEnough && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Prendas insuficientes</AlertTitle>
            <AlertDescription>
              <p className="mb-2">No tenés suficientes prendas para generar un look completo. Te faltan:</p>
              <ul className="list-disc pl-5 mb-3">
                {clothingStatus.missingCategories.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
              <p className="mb-2">Actualmente tenés:</p>
              <ul className="list-disc pl-5 mb-3">
                <li>{clothingStatus.upperBodyCount} prendas superiores</li>
                <li>{clothingStatus.lowerBodyCount} prendas inferiores</li>
                <li>{clothingStatus.fullBodyCount} prendas completas</li>
                <li>{clothingStatus.outerwearCount} abrigos</li>
                <li>{clothingStatus.footwearCount} calzados</li>
              </ul>
              <Link href="/upload">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Añadir más prendas
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Selector de clima con botones normales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Seleccioná el clima para tu look</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CLIMATE_TYPES.map((climate) => {
                const Icon = climate.icon
                const isSelected = selectedClimate === climate.value
                return (
                  <Button
                    key={climate.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-auto py-4 ${
                      isSelected ? "bg-primary-500 text-white" : ""
                    }`}
                    onClick={() => handleClimateChange(climate.value)}
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    {climate.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selector de ocasión con botones normales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Seleccioná la ocasión para tu look</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {OCCASION_TYPES.map((occasion) => {
                const Icon = occasion.icon
                const isSelected = selectedOccasion === occasion.value
                return (
                  <Button
                    key={occasion.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-auto py-4 ${
                      isSelected ? "bg-primary-500 text-white" : ""
                    }`}
                    onClick={() => handleOccasionChange(occasion.value)}
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    {occasion.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-center">
              {baseItem
                ? `Look generado con tu ${baseItem.type} ${baseItem.color}${selectedClimate ? ` para clima ${selectedClimate}` : ""}${selectedOccasion ? ` y ocasión ${selectedOccasion}` : ""}`
                : outfit.length > 0
                  ? message
                  : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outfit.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {outfit.map((item) => (
                  <div key={item.id} className="flex flex-col items-center animate-fade-in">
                    <div className="relative w-full h-48 mb-2 overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.type}
                        className="object-cover w-full h-full"
                      />
                      {getItemUsageCount(item.id) > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {getItemUsageCount(item.id)} usos
                        </div>
                      )}
                      {baseItem?.id === item.id && (
                        <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          Prenda base
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="capitalize">{item.type}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {getCategoryLabel(item.type)}
                      </Badge>
                      <Badge variant="outline" className="capitalize" style={{ backgroundColor: `${item.color}20` }}>
                        {item.color}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                        style={{
                          backgroundColor:
                            item.climate === "caluroso" ? "#FFEDD5" : item.climate === "frio" ? "#DBEAFE" : "#F3F4F6",
                        }}
                      >
                        {React.createElement(getClimateIcon(item.climate), { className: "h-3 w-3" })}
                        <span className="capitalize">{item.climate}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                        style={{
                          backgroundColor:
                            item.occasion === "fiesta"
                              ? "#FCE7F3"
                              : item.occasion === "trabajo"
                                ? "#E0F2FE"
                                : "#F3F4F6",
                        }}
                      >
                        {React.createElement(getOccasionIcon(item.occasion), { className: "h-3 w-3" })}
                        <span className="capitalize">{item.occasion}</span>
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 mt-1 px-3 py-1 h-auto text-xs whitespace-normal text-center"
                      onClick={() => handleGenerateWithItem(item)}
                      disabled={baseItem?.id === item.id || (clothingStatus && !clothingStatus.hasEnough)}
                    >
                      <Wand2 className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {baseItem?.id === item.id ? "Prenda base actual" : "Generar nuevo look con esta prenda"}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 rounded-lg border border-dashed">
                <Wand2 className="h-12 w-12 text-primary-500/50 mb-4" />
                <p className="text-muted-foreground">
                  {selectedClimate && selectedOccasion
                    ? `Seleccionado clima ${selectedClimate} y ocasión ${selectedOccasion}. Presioná el botón para generar un look.`
                    : "Presioná el botón para generar un look con tus prendas"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-center gap-4">
            <Button onClick={handleGenerateOutfit} className="gap-2 btn-hover" disabled={isLoading}>
              <Wand2 className="w-4 h-4" />
              {isLoading ? "Generando..." : "Generar sugerencia"}
            </Button>

            {outfit.length > 0 && (
              <>
                <Button onClick={() => setShowOutfitVisualization(true)} variant="default" className="gap-2 btn-hover">
                  <Eye className="w-4 h-4" />
                  Ver conjunto completo
                </Button>

                <Button onClick={handleSaveOutfit} variant="outline" className="gap-2 btn-hover">
                  <Save className="w-4 h-4" />
                  Guardar look
                </Button>

                <Button
                  onClick={handleRecordUsage}
                  variant="secondary"
                  className="gap-2 btn-hover"
                  disabled={usageUpdated}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Voy a usar este look hoy
                </Button>
              </>
            )}
          </CardFooter>
          {/* Botón flotante para visualización en móviles */}
          {outfit.length > 0 && (
            <div className="fixed bottom-20 right-4 z-10 md:hidden">
              <Button
                onClick={() => setShowOutfitVisualization(true)}
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg"
              >
                <Eye className="h-6 w-6" />
              </Button>
            </div>
          )}
        </Card>
      </div>
      <OutfitVisualization
        items={outfit}
        isOpen={showOutfitVisualization}
        onClose={() => setShowOutfitVisualization(false)}
      />
      <Toaster />
    </div>
  )
}
