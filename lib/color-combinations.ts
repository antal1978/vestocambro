// Configuración para sugerencias de combinaciones de colores
// Basado en teoría del color simplificada y reglas "soft" no punitivas

export interface ColorCombination {
  type: "complementarios" | "analogos" | "triada" | "monocromatico" | "neutro-acento" | "clasico" | "audaz"
  colors: string[]
  description: string
  confidence: "segura" | "arriesgada" | "inesperada"
  style?: "minimalista" | "audaz" | "romantico" | "clasico"
}

export const COLOR_COMBINATIONS: ColorCombination[] = [
  // Combinaciones clásicas y seguras
  {
    type: "clasico",
    colors: ["negro", "blanco"],
    description: "Combinación clásica, siempre segura",
    confidence: "segura",
    style: "minimalista",
  },
  {
    type: "clasico",
    colors: ["azul-marino", "blanco"],
    description: "Elegancia náutica, perfecta para cualquier ocasión",
    confidence: "segura",
    style: "clasico",
  },
  {
    type: "clasico",
    colors: ["beige", "blanco"],
    description: "Suavidad natural, ideal para looks relajados",
    confidence: "segura",
    style: "minimalista",
  },

  // Complementarios contrastantes
  {
    type: "complementarios",
    colors: ["azul-francia", "naranja"],
    description: "Armonía complementaria - contraste vibrante",
    confidence: "arriesgada",
    style: "audaz",
  },
  {
    type: "complementarios",
    colors: ["violeta", "amarillo-mostaza"],
    description: "Complementarios contrastantes - combinación energética",
    confidence: "arriesgada",
    style: "audaz",
  },

  // Análogos armoniosos
  {
    type: "analogos",
    colors: ["azul-marino", "azul-francia", "celeste"],
    description: "Armonía análoga - degradé azul sofisticado",
    confidence: "segura",
    style: "clasico",
  },
  {
    type: "analogos",
    colors: ["verde-esmeralda", "verde-menta", "celeste"],
    description: "Armonía análoga - frescura natural",
    confidence: "segura",
    style: "romantico",
  },

  // Neutros con acento
  {
    type: "neutro-acento",
    colors: ["beige", "fucsia"],
    description: "Neutro con acento - ¿te animás a esta mezcla inesperada?",
    confidence: "inesperada",
    style: "audaz",
  },
  {
    type: "neutro-acento",
    colors: ["gris-claro", "coral"],
    description: "Base neutra con toque cálido - equilibrio perfecto",
    confidence: "segura",
    style: "romantico",
  },

  // Monocromáticos
  {
    type: "monocromatico",
    colors: ["rosa-claro", "rosa-chicle", "fucsia"],
    description: "Degradé monocromático - feminidad en capas",
    confidence: "segura",
    style: "romantico",
  },
  {
    type: "monocromatico",
    colors: ["gris-claro", "gris-oscuro", "negro"],
    description: "Escala de grises - elegancia minimalista",
    confidence: "segura",
    style: "minimalista",
  },

  // Combinaciones audaces
  {
    type: "audaz",
    colors: ["verde-militar", "bordo"],
    description: "Poco habitual pero puede funcionar si te gusta arriesgar",
    confidence: "inesperada",
    style: "audaz",
  },
  {
    type: "audaz",
    colors: ["amarillo-mostaza", "azul-petroleo"],
    description: "Esta mezcla puede sorprender: ¿te animás?",
    confidence: "arriesgada",
    style: "audaz",
  },
]

// Función para obtener sugerencias de combinación para un color dado
export function getColorCombinationSuggestions(baseColor: string): ColorCombination[] {
  return COLOR_COMBINATIONS.filter((combination) => combination.colors.includes(baseColor))
}

// Función para evaluar una combinación de colores
export function evaluateColorCombination(colors: string[]): {
  type: string
  description: string
  confidence: string
} {
  // Buscar si existe una combinación exacta
  const exactMatch = COLOR_COMBINATIONS.find(
    (combination) =>
      combination.colors.every((color) => colors.includes(color)) &&
      colors.every((color) => combination.colors.includes(color)),
  )

  if (exactMatch) {
    return {
      type: exactMatch.type,
      description: exactMatch.description,
      confidence: exactMatch.confidence,
    }
  }

  // Si no hay coincidencia exacta, dar una evaluación general
  const hasNeutral = colors.some((color) =>
    ["blanco", "negro", "gris-claro", "gris-oscuro", "beige", "crudo"].includes(color),
  )

  if (hasNeutral) {
    return {
      type: "neutro-base",
      description: "Combinación con base neutra - siempre una buena elección",
      confidence: "segura",
    }
  }

  return {
    type: "experimental",
    description: "Combinación experimental - ¡puede ser tu nuevo look favorito!",
    confidence: "inesperada",
  }
}

// Mensajes motivacionales para diferentes tipos de confianza
export const CONFIDENCE_MESSAGES = {
  segura: [
    "¡Perfecto! Esta combinación siempre funciona",
    "Elección clásica y elegante",
    "Combinación confiable para cualquier ocasión",
  ],
  arriesgada: [
    "¡Me gusta tu audacia! Esta combinación tiene personalidad",
    "Combinación con carácter - perfecta para destacar",
    "¡Qué buena elección para algo diferente!",
  ],
  inesperada: [
    "¡Wow! Esta mezcla puede sorprender de la mejor manera",
    "Combinación poco convencional - ¡puede ser genial!",
    "¿Te animás? Esta mezcla tiene potencial único",
  ],
}
