"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Palette } from "lucide-react" // Asegúrate de que Palette esté importado
import { cn } from "@/lib/utils"

// Lista completa y equilibrada de colores basada en moda y reconocimiento común
const COLORS = [
  // Neutros
  { name: "Blanco", value: "blanco", hex: "#FFFFFF", category: "neutros" },
  { name: "Negro", value: "negro", hex: "#000000", category: "neutros" },
  { name: "Gris claro", value: "gris-claro", hex: "#D1D5DB", category: "neutros" },
  { name: "Gris oscuro", value: "gris-oscuro", hex: "#4B5563", category: "neutros" },
  { name: "Crudo / Off-white", value: "crudo", hex: "#FAF9F6", category: "neutros" },
  { name: "Beige", value: "beige", hex: "#F5F5DC", category: "neutros" },
  { name: "Arena", value: "arena", hex: "#C19A6B", category: "neutros" },
  { name: "Marrón", value: "marron", hex: "#8B4513", category: "neutros" },
  { name: "Chocolate", value: "chocolate", hex: "#7B3F00", category: "neutros" },
  { name: "Taupe", value: "taupe", hex: "#483C32", category: "neutros" },

  // Tierra y cálidos
  { name: "Amarillo claro", value: "amarillo-claro", hex: "#FFFFE0", category: "tierra-calidos" },
  { name: "Amarillo mostaza", value: "amarillo-mostaza", hex: "#FFDB58", category: "tierra-calidos" },
  { name: "Naranja", value: "naranja", hex: "#FFA500", category: "tierra-calidos" },
  { name: "Terracota", value: "terracota", hex: "#E2725B", category: "tierra-calidos" },
  { name: "Cobre", value: "cobre", hex: "#B87333", category: "tierra-calidos" },
  { name: "Óxido", value: "oxido", hex: "#B7410E", category: "tierra-calidos" },
  { name: "Coral", value: "coral", hex: "#FF7F50", category: "tierra-calidos" },
  { name: "Rojo", value: "rojo", hex: "#FF0000", category: "tierra-calidos" },
  { name: "Bordó / Vino", value: "bordo", hex: "#800020", category: "tierra-calidos" },
  { name: "Rosa claro / Rosa bebé", value: "rosa-claro", hex: "#FFB6C1", category: "tierra-calidos" },
  { name: "Rosa chicle", value: "rosa-chicle", hex: "#FF69B4", category: "tierra-calidos" },
  { name: "Fucsia", value: "fucsia", hex: "#FF1493", category: "tierra-calidos" },
  { name: "Salmón", value: "salmon", hex: "#FA8072", category: "tierra-calidos" },

  // Fríos
  { name: "Lavanda", value: "lavanda", hex: "#E6E6FA", category: "frios" },
  { name: "Lila", value: "lila", hex: "#C8A2C8", category: "frios" },
  { name: "Violeta", value: "violeta", hex: "#8A2BE2", category: "frios" },
  { name: "Púrpura", value: "purpura", hex: "#800080", category: "frios" },
  { name: "Azul bebé", value: "azul-bebe", hex: "#89CFF0", category: "frios" },
  { name: "Celeste", value: "celeste", hex: "#87CEEB", category: "frios" },
  { name: "Azul Francia", value: "azul-francia", hex: "#318CE7", category: "frios" },
  { name: "Azul marino", value: "azul-marino", hex: "#000080", category: "frios" },
  { name: "Azul petróleo", value: "azul-petroleo", hex: "#316B83", category: "frios" },
  { name: "Verde menta", value: "verde-menta", hex: "#98FB98", category: "frios" },
  { name: "Verde pasto", value: "verde-pasto", hex: "#7CFC00", category: "frios" },
  { name: "Verde oliva", value: "verde-oliva", hex: "#808000", category: "frios" },
  { name: "Verde seco / militar", value: "verde-militar", hex: "#4B5320", category: "frios" },
  { name: "Verde esmeralda", value: "verde-esmeralda", hex: "#50C878", category: "frios" },
  { name: "Verde botella", value: "verde-botella", hex: "#006A4E", category: "frios" },

  // Especiales
  { name: "Denim", value: "denim", hex: "#1560BD", category: "especiales" },
  { name: "Plateado", value: "plateado", hex: "#C0C0C0", category: "especiales" },
  { name: "Dorado", value: "dorado", hex: "#FFD700", category: "especiales" },
  { name: "Bronce", value: "bronce", hex: "#CD7F32", category: "especiales" },
  {
    name: "Multicolor / Estampado",
    value: "multicolor",
    hex: "linear-gradient(45deg, #ff0000, #00ff00, #0000ff)",
    category: "especiales",
  },
  { name: "Animal print", value: "animal-print", hex: "#D2691E", category: "especiales" },
]

const COLOR_CATEGORIES = {
  neutros: { name: "Neutros", description: "Colores versátiles que combinan con todo" },
  "tierra-calidos": { name: "Tierra y Cálidos", description: "Colores que transmiten calidez y energía" },
  frios: { name: "Fríos", description: "Colores que transmiten calma y frescura" },
  especiales: { name: "Especiales", description: "Colores únicos y metálicos" },
}

interface ColorPickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ColorPicker({ value, onChange, placeholder = "Seleccionar color" }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedColor = COLORS.find((color) => color.value === value)

  const handleColorSelect = (colorValue: string) => {
    onChange(colorValue)
    setIsOpen(false)
  }

  const renderColorSwatch = (color: any) => {
    if (color.value === "multicolor") {
      return (
        <div
          className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
          style={{
            background: "linear-gradient(45deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ffff00 100%)",
          }}
        />
      )
    }

    if (color.value === "animal-print") {
      return (
        <div
          className="w-6 h-6 rounded-full border border-gray-300 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: color.hex }}
        >
          <div className="absolute inset-0 opacity-60">
            <div className="w-2 h-2 bg-black rounded-full absolute top-1 left-1"></div>
            <div className="w-1 h-1 bg-black rounded-full absolute top-3 right-1"></div>
            <div className="w-1.5 h-1.5 bg-black rounded-full absolute bottom-1 left-2"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.hex }} />
    )
  }

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        aria-label={selectedColor ? `Color seleccionado: ${selectedColor.name}` : placeholder}
      >
        <span className="sr-only">Selector de color</span>
        <div className="flex items-center gap-2">
          {/* ESTA ES LA LÍNEA CLAVE: El ícono Palette está aquí, FUERA del condicional */}
          <Palette className="w-4 h-4 text-muted-foreground" />
          {selectedColor ? (
            <>
              {renderColorSwatch(selectedColor)}
              <span className="text-foreground">{selectedColor.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 space-y-6">
            <h4 className="font-medium text-sm">Seleccionar color</h4>

            {Object.entries(COLOR_CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const categoryColors = COLORS.filter((color) => color.category === categoryKey)

              return (
                <div key={categoryKey} className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{categoryInfo.name}</h5>
                    <p className="text-xs text-gray-500">{categoryInfo.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-50 transition-colors border text-left",
                          value === color.value && "bg-blue-50 border-blue-500",
                        )}
                        title={color.name}
                      >
                        {renderColorSwatch(color)}
                        <span className="text-xs text-center leading-tight">{color.name}</span>
                        {value === color.value && <Check className="w-3 h-3 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay para cerrar cuando se hace clic fuera */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
