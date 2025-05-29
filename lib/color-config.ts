export interface ColorOption {
  id: string
  name: string
  hex: string
  category: "neutros" | "calidos" | "frios" | "vibrantes"
}

export interface ColorCombinationRule {
  baseColor: string
  compatibleColors: string[]
  description: string
}

export const COLORS: ColorOption[] = [
  // Neutros
  { id: "blanco", name: "Blanco", hex: "#FFFFFF", category: "neutros" },
  { id: "negro", name: "Negro", hex: "#000000", category: "neutros" },
  { id: "gris-claro", name: "Gris claro", hex: "#D1D5DB", category: "neutros" },
  { id: "gris", name: "Gris", hex: "#6B7280", category: "neutros" },
  { id: "gris-oscuro", name: "Gris oscuro", hex: "#374151", category: "neutros" },
  { id: "beige", name: "Beige", hex: "#F5F5DC", category: "neutros" },
  { id: "crema", name: "Crema", hex: "#FFFDD0", category: "neutros" },

  // Cálidos
  { id: "rojo", name: "Rojo", hex: "#DC2626", category: "calidos" },
  { id: "naranja", name: "Naranja", hex: "#EA580C", category: "calidos" },
  { id: "amarillo", name: "Amarillo", hex: "#EAB308", category: "calidos" },
  { id: "rosa", name: "Rosa", hex: "#EC4899", category: "calidos" },
  { id: "coral", name: "Coral", hex: "#FF7F7F", category: "calidos" },
  { id: "marron", name: "Marrón", hex: "#92400E", category: "calidos" },
  { id: "dorado", name: "Dorado", hex: "#F59E0B", category: "calidos" },

  // Fríos
  { id: "azul", name: "Azul", hex: "#2563EB", category: "frios" },
  { id: "azul-marino", name: "Azul marino", hex: "#1E3A8A", category: "frios" },
  { id: "azul-claro", name: "Azul claro", hex: "#60A5FA", category: "frios" },
  { id: "verde", name: "Verde", hex: "#16A34A", category: "frios" },
  { id: "verde-oscuro", name: "Verde oscuro", hex: "#14532D", category: "frios" },
  { id: "turquesa", name: "Turquesa", hex: "#06B6D4", category: "frios" },
  { id: "morado", name: "Morado", hex: "#7C3AED", category: "frios" },

  // Vibrantes
  { id: "fucsia", name: "Fucsia", hex: "#E879F9", category: "vibrantes" },
  { id: "lima", name: "Lima", hex: "#84CC16", category: "vibrantes" },
  { id: "cyan", name: "Cyan", hex: "#06B6D4", category: "vibrantes" },
  { id: "magenta", name: "Magenta", hex: "#D946EF", category: "vibrantes" },
  { id: "verde-neon", name: "Verde neón", hex: "#22C55E", category: "vibrantes" },
]

export const COLOR_CATEGORIES = {
  neutros: "Neutros",
  calidos: "Cálidos",
  frios: "Fríos",
  vibrantes: "Vibrantes",
}

export const COLOR_COMBINATION_RULES: ColorCombinationRule[] = [
  // Reglas para neutros
  {
    baseColor: "negro",
    compatibleColors: ["blanco", "gris", "rojo", "azul", "verde", "amarillo", "rosa"],
    description: "El negro combina con casi todos los colores",
  },
  {
    baseColor: "blanco",
    compatibleColors: ["negro", "azul-marino", "rojo", "verde-oscuro", "marron", "gris"],
    description: "El blanco es versátil y combina con colores intensos",
  },
  {
    baseColor: "gris",
    compatibleColors: ["blanco", "negro", "azul", "rosa", "amarillo", "verde"],
    description: "El gris es neutral y combina con colores vibrantes",
  },

  // Reglas para cálidos
  {
    baseColor: "rojo",
    compatibleColors: ["blanco", "negro", "gris", "beige", "azul-marino"],
    description: "El rojo combina bien con neutros y azul marino",
  },
  {
    baseColor: "amarillo",
    compatibleColors: ["blanco", "negro", "gris", "azul", "verde-oscuro"],
    description: "El amarillo resalta con neutros y colores fríos",
  },
  {
    baseColor: "rosa",
    compatibleColors: ["blanco", "gris", "negro", "verde", "azul-claro"],
    description: "El rosa combina con neutros y verdes",
  },

  // Reglas para fríos
  {
    baseColor: "azul",
    compatibleColors: ["blanco", "gris", "amarillo", "naranja", "beige"],
    description: "El azul combina con neutros y colores cálidos",
  },
  {
    baseColor: "verde",
    compatibleColors: ["blanco", "beige", "marron", "rosa", "crema"],
    description: "El verde combina con neutros tierra y rosa",
  },
  {
    baseColor: "morado",
    compatibleColors: ["blanco", "gris", "amarillo", "verde", "beige"],
    description: "El morado combina con neutros y amarillo",
  },
]

export function getColorById(colorId: string): ColorOption | undefined {
  return COLORS.find((color) => color.id === colorId)
}

export function getCompatibleColors(baseColorId: string): string[] {
  const rule = COLOR_COMBINATION_RULES.find((rule) => rule.baseColor === baseColorId)
  return rule ? rule.compatibleColors : []
}

export function getColorsByCategory(category: string): ColorOption[] {
  return COLORS.filter((color) => color.category === category)
}
