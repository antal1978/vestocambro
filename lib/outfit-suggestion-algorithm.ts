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

// Tipos de prendas de abrigo para la parte superior
const WARM_UPPER_BODY_TYPES = ["sweater", "buzo"]

// Determinar si una prenda es para día, noche o ambos
const getDayNightSuitability = (item: ClothingItem): "day" | "night" | "both" => {
  if (item.occasion === "salidas-formales") {
    return "night"
  }
  if (["dia-casual", "trabajo", "deporte", "homewear"].includes(item.occasion)) {
    return "day"
  }
  if (item.occasion === "salidas-informales") {
    return "both"
  }
  return "both"
}

// Verificar compatibilidad climática
const isClimateCompatible = (item: ClothingItem, targetClimate: string): boolean => {
  if (item.climate === targetClimate) {
    return true
  }
  if (item.climate === "templado") {
    return true
  }
  if (item.isOuterwear && targetClimate === "frio") {
    return true
  }
  return false
}

// Verificar compatibilidad de ocasión
const isOccasionCompatible = (item: ClothingItem, targetOccasion: string): boolean => {
  if (item.occasion === targetOccasion) {
    return true
  }
  if (item.occasion === "dia-casual" && targetOccasion === "salidas-informales") {
    return true
  }
  if (item.occasion === "trabajo" && targetOccasion === "salidas-formales") {
    return true
  }
  return false
}

// Verificar compatibilidad de colores
const areColorsCompatible = (color1: string, color2: string): boolean => {
  const neutralColors = ["negro", "blanco", "gris", "beige", "crema"]
  if (neutralColors.includes(color1) || neutralColors.includes(color2)) {
    return true
  }

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
  const patterned = items.filter(
    (item) =>
      item.texture && ["estampado", "rayas", "cuadros", "flores", "geometrico", "animal-print"].includes(item.texture),
  )
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
  const outfit: ClothingItem[] = []

  // 1. Filtrar y categorizar prendas compatibles
  const compatibleItems = items.filter((item) => {
    const dayNightSuitability = getDayNightSuitability(item)
    const climateOk = isClimateCompatible(item, climate)
    const occasionOk = isOccasionCompatible(item, occasion)
    return (dayNightSuitability === dayOrNight || dayNightSuitability === "both") && climateOk && occasionOk
  })

  const categorizedItems: Record<ClothingCategory, ClothingItem[]> = {
    upperBody: [],
    lowerBody: [],
    fullBody: [],
    outerwear: [],
    footwear: [],
    accessories: [],
  }

  compatibleItems.forEach((item) => {
    for (const [category, types] of Object.entries(CLOTHING_CATEGORIES)) {
      if (types.includes(item.type) || (category === "outerwear" && item.isOuterwear)) {
        categorizedItems[category as ClothingCategory].push(item)
        break
      }
    }
  })

  // 2. Construir el look base (parte de arriba, parte de abajo, calzado)
  let upper: ClothingItem | undefined
  let lower: ClothingItem | undefined
  let fullBody: ClothingItem | undefined
  let footwear: ClothingItem | undefined

  // Priorizar prenda completa si es adecuada y disponible
  if (categorizedItems.fullBody.length > 0) {
    fullBody = categorizedItems.fullBody[Math.floor(Math.random() * categorizedItems.fullBody.length)]
    outfit.push(fullBody)
  } else {
    // Asegurar parte superior e inferior
    if (categorizedItems.upperBody.length > 0 && categorizedItems.lowerBody.length > 0) {
      // Intentar encontrar combinación de colores
      let foundMatch = false
      for (const u of categorizedItems.upperBody) {
        for (const l of categorizedItems.lowerBody) {
          if (areColorsCompatible(u.color, l.color)) {
            upper = u
            lower = l
            foundMatch = true
            break
          }
        }
        if (foundMatch) break
      }
      // Si no hay match, elegir al azar
      if (!foundMatch) {
        upper = categorizedItems.upperBody[Math.floor(Math.random() * categorizedItems.upperBody.length)]
        lower = categorizedItems.lowerBody[Math.floor(Math.random() * categorizedItems.lowerBody.length)]
      }
      if (upper) outfit.push(upper)
      if (lower) outfit.push(lower)
    }
  }

  // Asegurar calzado
  if (categorizedItems.footwear.length > 0) {
    let bestFootwear = categorizedItems.footwear[0]
    if (outfit.length > 0) {
      for (const f of categorizedItems.footwear) {
        if (outfit.some((item) => areColorsCompatible(item.color, f.color))) {
          bestFootwear = f
          break
        }
      }
    }
    footwear = bestFootwear
    outfit.push(footwear)
  }

  // Si no se pudo formar un look base, retornar vacío
  if (outfit.length < 3 && !fullBody) {
    // If not full body, need at least 3 items (upper, lower, footwear)
    return []
  }
  if (fullBody && outfit.length < 2) {
    // If full body, need at least 2 items (full body, footwear)
    return []
  }

  // 3. Aplicar reglas de clima
  if (climate === "frio") {
    // Asegurar sweater/buzo si no hay ya uno adecuado
    const hasWarmUpper = outfit.some((item) => WARM_UPPER_BODY_TYPES.includes(item.type))
    if (!hasWarmUpper && categorizedItems.upperBody.length > 0) {
      const warmUpper = categorizedItems.upperBody.find((item) => WARM_UPPER_BODY_TYPES.includes(item.type))
      if (warmUpper) {
        // Reemplazar la parte superior si ya hay una, o añadir si no
        const existingUpperIndex = outfit.findIndex((item) => CLOTHING_CATEGORIES.upperBody.includes(item.type))
        if (existingUpperIndex !== -1) {
          outfit[existingUpperIndex] = warmUpper
        } else {
          outfit.push(warmUpper)
        }
      }
    }

    // Añadir abrigo si no es para estar en casa
    if (occasion !== "homewear" && categorizedItems.outerwear.length > 0) {
      const existingOuterwear = outfit.find((item) => CLOTHING_CATEGORIES.outerwear.includes(item.type))
      if (!existingOuterwear) {
        // Solo añadir si no hay ya un abrigo
        let bestOuterwear = categorizedItems.outerwear[0]
        if (outfit.length > 0) {
          for (const o of categorizedItems.outerwear) {
            if (outfit.some((item) => areColorsCompatible(item.color, o.color))) {
              bestOuterwear = o
              break
            }
          }
        }
        outfit.push(bestOuterwear)
      }
    }
  }

  // Regla: Si es para estar en casa, asegurar que no haya abrigo
  if (occasion === "homewear") {
    const outerwearIndex = outfit.findIndex((item) => CLOTHING_CATEGORIES.outerwear.includes(item.type))
    if (outerwearIndex !== -1) {
      outfit.splice(outerwearIndex, 1) // Eliminar el abrigo
    }
  }

  // 4. Aplicar reglas de ocasión
  const isNightOut = ["salidas-formales", "salidas-informales"].includes(occasion)
  if (isNightOut && categorizedItems.accessories.length > 0) {
    const existingAccessory = outfit.find((item) => CLOTHING_CATEGORIES.accessories.includes(item.type))
    if (!existingAccessory) {
      // Solo añadir si no hay ya un accesorio
      const accessory = categorizedItems.accessories[Math.floor(Math.random() * categorizedItems.accessories.length)]
      outfit.push(accessory)
    }
  }

  // 5. Verificar equilibrio de estampados (mantener la lógica existente)
  if (!hasBalancedPatterns(outfit)) {
    for (let i = 0; i < outfit.length; i++) {
      const item = outfit[i]
      if (
        item.texture &&
        ["estampado", "rayas", "cuadros", "flores", "geometrico", "animal-print"].includes(item.texture)
      ) {
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
        break
      }
    }
  }

  return outfit
}

// Función para obtener sugerencias de looks (mantener la lógica existente)
export function getSuggestedLooks(
  items: ClothingItem[],
  occasion: string,
  climate: string,
  style = "comodo",
  count = 3,
): ClothingItem[][] {
  const dayOrNight = ["salidas-formales"].includes(occasion) ? "night" : "day"
  const suggestions: ClothingItem[][] = []

  for (let i = 0; i < count; i++) {
    const outfit = suggestOutfit(items, dayOrNight, occasion, climate, style)
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
