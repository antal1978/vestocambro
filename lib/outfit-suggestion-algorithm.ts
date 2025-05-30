import type { ClothingItem } from "@/types/ClothingItem"

// Tipos de categorías de prendas
type ClothingCategory = "upperBody" | "lowerBody" | "fullBody" | "outerwear" | "footwear" | "accessories"

// Mapeo de tipos de prendas a categorías
const CLOTHING_CATEGORIES: Record<ClothingCategory, string[]> = {
  upperBody: ["remera", "camisa", "sweater", "buzo", "blusa", "cardigan", "chaleco", "top", "musculosa"],
  lowerBody: ["pantalon", "jean", "falda", "short", "shorts", "jeans"],
  fullBody: ["vestido", "mono", "jumpsuit", "enterito"],
  outerwear: ["campera", "tapado", "blazer", "abrigo"],
  footwear: ["calzado", "zapatos", "zapatillas", "botas", "sandalias"],
  accessories: ["bufanda", "gorra", "gorro", "guantes", "cinturon", "cartera", "bolso"],
}

// Determinar si una prenda es para día, noche o ambos
const getDayNightSuitability = (item: ClothingItem): "day" | "night" | "both" => {
  // Prendas formales o de salidas formales suelen ser más para noche
  if (item.occasion === "salidas-formales") {
    return "night"
  }

  // Prendas de trabajo, deporte o día casual suelen ser más para día
  if (["dia-casual", "trabajo", "deporte"].includes(item.occasion)) {
    return "day"
  }

  // Salidas informales pueden ser para ambos
  if (item.occasion === "salidas-informales") {
    return "both"
  }

  // Por defecto, asumimos que sirve para ambos
  return "both"
}

// Verificar compatibilidad climática
const isClimateCompatible = (item: ClothingItem, targetClimate: string): boolean => {
  // Si el clima coincide exactamente
  if (item.climate === targetClimate) {
    return true
  }

  // Prendas de clima templado pueden servir para calor o frío con capas
  if (item.climate === "templado") {
    return true
  }

  // Abrigos son buenos para frío pero no para calor
  if (item.isOuterwear && targetClimate === "frio") {
    return true
  }

  return false
}

// Verificar compatibilidad de ocasión
const isOccasionCompatible = (item: ClothingItem, targetOccasion: string): boolean => {
  // Si la ocasión coincide exactamente
  if (item.occasion === targetOccasion) {
    return true
  }

  // Prendas de día casual pueden servir para salidas informales
  if (item.occasion === "dia-casual" && targetOccasion === "salidas-informales") {
    return true
  }

  // Prendas de trabajo pueden servir para salidas formales
  if (item.occasion === "trabajo" && targetOccasion === "salidas-formales") {
    return true
  }

  return false
}

// Verificar compatibilidad de colores
const areColorsCompatible = (color1: string, color2: string): boolean => {
  // Colores neutros combinan con todo
  const neutralColors = ["negro", "blanco", "gris", "beige", "crema"]
  if (neutralColors.includes(color1) || neutralColors.includes(color2)) {
    return true
  }

  // Combinaciones específicas que funcionan bien
  const goodCombinations: Record<string, string[]> = {
    azul: ["blanco", "gris", "beige", "rojo", "rosa", "amarillo"],
    rojo: ["negro", "blanco", "gris", "azul", "beige"],
    verde: ["blanco", "beige", "gris", "azul", "amarillo"],
    amarillo: ["azul", "blanco", "gris", "verde", "morado"],
    rosa: ["azul", "blanco", "gris", "negro"],
    morado: ["blanco", "gris", "amarillo", "rosa"],
    naranja: ["azul", "blanco", "gris", "verde"],
    marron: ["beige", "blanco", "azul", "verde", "amarillo"],
  }

  if (goodCombinations[color1]?.includes(color2) || goodCombinations[color2]?.includes(color1)) {
    return true
  }

  // Colores similares o de la misma familia suelen combinar
  const colorFamilies: Record<string, string[]> = {
    rojos: ["rojo", "rosa", "coral", "bordo"],
    azules: ["azul", "celeste", "turquesa", "navy"],
    verdes: ["verde", "menta", "oliva", "esmeralda"],
    neutros: ["negro", "blanco", "gris", "beige", "crema"],
  }

  for (const family of Object.values(colorFamilies)) {
    if (family.includes(color1) && family.includes(color2)) {
      return true
    }
  }

  return false
}

// Equilibrar estampados y texturas
const hasBalancedPatterns = (items: ClothingItem[]): boolean => {
  // Contar cuántas prendas tienen estampados
  const patterned = items.filter(
    (item) =>
      item.texture && ["estampado", "rayas", "cuadros", "flores", "geometrico", "animal-print"].includes(item.texture),
  )

  // Si hay más de una prenda estampada, puede ser demasiado
  return patterned.length <= 1
}

// Función principal para sugerir outfits
export function suggestOutfit(
  items: ClothingItem[],
  dayOrNight: "day" | "night",
  occasion: string,
  climate: string,
  style = "comodo",
): ClothingItem[] {
  // 1. Filtrar prendas compatibles con clima, ocasión y momento del día
  const compatibleItems = items.filter((item) => {
    const dayNightSuitability = getDayNightSuitability(item)
    const climateOk = isClimateCompatible(item, climate)
    const occasionOk = isOccasionCompatible(item, occasion)

    return (dayNightSuitability === dayOrNight || dayNightSuitability === "both") && climateOk && occasionOk
  })

  // 2. Agrupar por categoría
  const categorizedItems: Record<ClothingCategory, ClothingItem[]> = {
    upperBody: [],
    lowerBody: [],
    fullBody: [],
    outerwear: [],
    footwear: [],
    accessories: [],
  }

  compatibleItems.forEach((item) => {
    // Determinar la categoría de la prenda
    for (const [category, types] of Object.entries(CLOTHING_CATEGORIES)) {
      if (types.includes(item.type) || (category === "outerwear" && item.isOuterwear)) {
        categorizedItems[category as ClothingCategory].push(item)
        break
      }
    }
  })

  // 3. Crear outfit
  const outfit: ClothingItem[] = []

  // Decidir si usar prenda completa o conjunto de superior+inferior
  const useFullBody =
    categorizedItems.fullBody.length > 0 &&
    (Math.random() > 0.5 || categorizedItems.upperBody.length === 0 || categorizedItems.lowerBody.length === 0)

  if (useFullBody) {
    // Elegir una prenda completa al azar
    const fullBodyItem = categorizedItems.fullBody[Math.floor(Math.random() * categorizedItems.fullBody.length)]
    outfit.push(fullBodyItem)
  } else {
    // Elegir parte superior e inferior que combinen
    if (categorizedItems.upperBody.length > 0 && categorizedItems.lowerBody.length > 0) {
      // Intentar encontrar combinaciones de colores que funcionen bien
      let foundMatch = false

      for (const upperItem of categorizedItems.upperBody) {
        for (const lowerItem of categorizedItems.lowerBody) {
          if (areColorsCompatible(upperItem.color, lowerItem.color)) {
            outfit.push(upperItem, lowerItem)
            foundMatch = true
            break
          }
        }
        if (foundMatch) break
      }

      // Si no encontramos combinación, elegir al azar
      if (!foundMatch) {
        const upperItem = categorizedItems.upperBody[Math.floor(Math.random() * categorizedItems.upperBody.length)]
        const lowerItem = categorizedItems.lowerBody[Math.floor(Math.random() * categorizedItems.lowerBody.length)]
        outfit.push(upperItem, lowerItem)
      }
    }
  }

  // Añadir abrigo si el clima es frío
  if (climate === "frio" && categorizedItems.outerwear.length > 0) {
    // Elegir un abrigo que combine con lo que ya tenemos
    let bestOuterwear = categorizedItems.outerwear[0]

    if (outfit.length > 0) {
      for (const outerwearItem of categorizedItems.outerwear) {
        if (outfit.some((item) => areColorsCompatible(item.color, outerwearItem.color))) {
          bestOuterwear = outerwearItem
          break
        }
      }
    }

    outfit.push(bestOuterwear)
  }

  // Añadir calzado
  if (categorizedItems.footwear.length > 0) {
    // Elegir calzado que combine
    let bestFootwear = categorizedItems.footwear[0]

    if (outfit.length > 0) {
      for (const footwearItem of categorizedItems.footwear) {
        if (outfit.some((item) => areColorsCompatible(item.color, footwearItem.color))) {
          bestFootwear = footwearItem
          break
        }
      }
    }

    outfit.push(bestFootwear)
  }

  // Añadir accesorio si el estilo es "arreglado" o "creativo"
  if ((style === "arreglado" || style === "creativo") && categorizedItems.accessories.length > 0) {
    const accessory = categorizedItems.accessories[Math.floor(Math.random() * categorizedItems.accessories.length)]
    outfit.push(accessory)
  }

  // Verificar equilibrio de estampados
  if (!hasBalancedPatterns(outfit)) {
    // Si hay demasiados estampados, intentar reemplazar alguna prenda
    for (let i = 0; i < outfit.length; i++) {
      const item = outfit[i]
      if (
        item.texture &&
        ["estampado", "rayas", "cuadros", "flores", "geometrico", "animal-print"].includes(item.texture)
      ) {
        // Buscar una alternativa lisa de la misma categoría
        for (const [category, types] of Object.entries(CLOTHING_CATEGORIES)) {
          if (types.includes(item.type)) {
            const alternatives = categorizedItems[category as ClothingCategory].filter(
              (alt) => alt.id !== item.id && (!alt.texture || alt.texture === "liso"),
            )

            if (alternatives.length > 0) {
              outfit[i] = alternatives[0]
              break
            }
          }
        }

        // Solo reemplazar una prenda estampada
        break
      }
    }
  }

  return outfit
}

// Función para obtener sugerencias de looks
export function getSuggestedLooks(
  items: ClothingItem[],
  occasion: string,
  climate: string,
  style = "comodo",
  count = 3,
): ClothingItem[][] {
  // Determinar si es día o noche basado en la ocasión
  const dayOrNight = ["salidas-formales"].includes(occasion) ? "night" : "day"

  // Generar múltiples sugerencias
  const suggestions: ClothingItem[][] = []

  for (let i = 0; i < count; i++) {
    const outfit = suggestOutfit(items, dayOrNight, occasion, climate, style)

    // Evitar duplicados
    if (
      outfit.length > 0 &&
      !suggestions.some(
        (existing) =>
          JSON.stringify(existing.map((item) => item.id).sort()) ===
          JSON.stringify(outfit.map((item) => item.id).sort()),
      )
    ) {
      suggestions.push(outfit)
    }
  }

  return suggestions
}

export default getSuggestedLooks
