import { COLORS } from "./color-config"

export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
    : null
}

export function calculateColorDifference(color1: [number, number, number], color2: [number, number, number]): number {
  const [r1, g1, b1] = color1
  const [r2, g2, b2] = color2
  return Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2)
}

export function findClosestColor(
  inputColor: string,
  colors: { name: string; hex: string }[] = COLORS,
): { name: string; hex: string } {
  // Si el color de entrada es uno de los nombres especiales que no tienen un hex directo, devolverlo directamente
  const specialColors = ["Denim", "Multicolor / Estampado", "Animal print"]
  if (specialColors.includes(inputColor)) {
    return { name: inputColor, hex: "#000000" } // Devolver un hex por defecto si no hay uno real
  }

  const rgbInput = hexToRgb(inputColor)
  if (!rgbInput) {
    // Si el input no es un hex válido, intentar buscar por nombre si es posible
    const foundByName = colors.find((c) => c.name.toLowerCase() === inputColor.toLowerCase())
    if (foundByName) return foundByName
    return { name: "Desconocido", hex: "#000000" }
  }

  let closestColor = colors[0] || { name: "Desconocido", hex: "#000000" }
  let minDifference = Number.POSITIVE_INFINITY

  for (const color of colors) {
    const rgbColor = hexToRgb(color.hex)
    if (rgbColor) {
      const difference = calculateColorDifference(rgbInput, rgbColor)
      if (difference < minDifference) {
        minDifference = difference
        closestColor = color
      }
    }
  }

  return closestColor
}
