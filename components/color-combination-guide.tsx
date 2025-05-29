"use client"

import { useState } from "react"
import { type ColorOption, getColorById, COLOR_COMBINATION_RULES } from "@/lib/color-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "@/components/color-picker"
import { Badge } from "@/components/ui/badge"

export function ColorCombinationGuide() {
  const [selectedColor, setSelectedColor] = useState<string>("")

  // Obtener colores que combinan bien con el seleccionado
  const getMatchingColors = (): ColorOption[] => {
    if (!selectedColor) return []

    const combinations = COLOR_COMBINATION_RULES.combinations[selectedColor]
    if (!combinations) return []

    return combinations.map((colorId) => getColorById(colorId)).filter((color) => !!color) as ColorOption[]
  }

  // Obtener colores que no combinan bien con el seleccionado
  const getClashingColors = (): ColorOption[] => {
    if (!selectedColor) return []

    const clashes = COLOR_COMBINATION_RULES.clashes[selectedColor]
    if (!clashes) return []

    return clashes.map((colorId) => getColorById(colorId)).filter((color) => !!color) as ColorOption[]
  }

  const matchingColors = getMatchingColors()
  const clashingColors = getClashingColors()
  const selectedColorObj = getColorById(selectedColor)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guía de combinación de colores</CardTitle>
        <CardDescription>Selecciona un color para ver con qué otros colores combina bien</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecciona un color:</label>
          <ColorPicker value={selectedColor} onChange={setSelectedColor} />
        </div>

        {selectedColorObj && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: selectedColorObj.hex }} />
              <span className="font-medium">{selectedColorObj.displayName}</span>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Combina bien con:</h4>
              {matchingColors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchingColors.map((color) => (
                    <Badge
                      key={color.id}
                      variant="outline"
                      className="flex items-center gap-1"
                      style={{ backgroundColor: `${color.hex}20` }}
                    >
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.hex }} />
                      {color.displayName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay combinaciones registradas.</p>
              )}
            </div>

            {clashingColors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Evitar combinar con:</h4>
                <div className="flex flex-wrap gap-2">
                  {clashingColors.map((color) => (
                    <Badge
                      key={color.id}
                      variant="outline"
                      className="flex items-center gap-1 border-destructive/30"
                      style={{ backgroundColor: `${color.hex}10` }}
                    >
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.hex }} />
                      {color.displayName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedColor && (
          <div className="py-8 text-center text-muted-foreground">Selecciona un color para ver sus combinaciones</div>
        )}
      </CardContent>
    </Card>
  )
}
