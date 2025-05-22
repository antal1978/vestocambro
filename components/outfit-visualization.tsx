"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type OutfitVisualizationProps = {
  items: ClothingItem[]
  isOpen: boolean
  onClose: () => void
}

export function OutfitVisualization({ items, isOpen, onClose }: OutfitVisualizationProps) {
  // Clasificar prendas por categoría (evitando duplicados)
  // Primero identificamos los abrigos
  const outerwearItems = items.filter(
    (item) => item.isOuterwear || ["campera", "tapado", "blazer", "abrigo"].includes(item.type),
  )

  // Obtenemos los IDs de los abrigos para excluirlos de otras categorías
  const outerwearIds = outerwearItems.map((item) => item.id)

  // Filtramos el resto de categorías excluyendo los abrigos
  const upperItems = items.filter(
    (item) =>
      !outerwearIds.includes(item.id) && ["remera", "camisa", "sweater", "blusa", "cardigan"].includes(item.type),
  )
  const lowerItems = items.filter(
    (item) => !outerwearIds.includes(item.id) && ["pantalon", "jean", "falda", "shorts", "jeans"].includes(item.type),
  )
  const fullBodyItems = items.filter(
    (item) => !outerwearIds.includes(item.id) && ["vestido", "mono", "jumpsuit"].includes(item.type),
  )
  const footwearItems = items.filter(
    (item) => !outerwearIds.includes(item.id) && ["calzado", "zapatos", "zapatillas", "botas"].includes(item.type),
  )
  const accessoryItems = items.filter(
    (item) =>
      !outerwearIds.includes(item.id) && ["accesorio", "bufanda", "gorro", "cinturon", "guantes"].includes(item.type),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle>Tu conjunto completo</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 bg-white">
          {/* Visualización mejorada del outfit */}
          <div id="outfit-grid" className="bg-gray-50 p-4 rounded-lg">
            <div className="relative flex flex-col items-center">
              {/* Maniquí o silueta (opcional) */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100,10 C120,10 135,25 135,45 C135,65 120,80 100,80 C80,80 65,65 65,45 C65,25 80,10 100,10 Z"
                    fill="#888"
                  />
                  <path
                    d="M100,80 L100,200 M70,100 L130,100 M70,100 L60,200 M130,100 L140,200 M100,200 L70,350 M100,200 L130,350"
                    stroke="#888"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Abrigo (si existe) */}
              {outerwearItems.length > 0 && (
                <div className="relative w-full max-w-[300px] z-30">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={outerwearItems[0].image || "/placeholder.svg"}
                      alt={outerwearItems[0].type}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Prenda completa o parte superior */}
              {fullBodyItems.length > 0 ? (
                <div className="relative w-full max-w-[280px] -mt-16 z-20">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={fullBodyItems[0].image || "/placeholder.svg"}
                      alt={fullBodyItems[0].type}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                upperItems.length > 0 && (
                  <div className="relative w-full max-w-[250px] -mt-8 z-20">
                    <div className="aspect-square relative">
                      <img
                        src={upperItems[0].image || "/placeholder.svg"}
                        alt={upperItems[0].type}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )
              )}

              {/* Parte inferior (solo si no hay prenda completa) */}
              {!fullBodyItems.length && lowerItems.length > 0 && (
                <div className="relative w-full max-w-[240px] -mt-20 z-10">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={lowerItems[0].image || "/placeholder.svg"}
                      alt={lowerItems[0].type}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Calzado */}
              {footwearItems.length > 0 && (
                <div className="relative w-full max-w-[180px] -mt-16 z-0">
                  <div className="aspect-square relative">
                    <img
                      src={footwearItems[0].image || "/placeholder.svg"}
                      alt={footwearItems[0].type}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Accesorios */}
              {accessoryItems.length > 0 && (
                <div className="absolute top-0 right-0 w-1/4 max-w-[100px] z-40">
                  <div className="aspect-square relative">
                    <img
                      src={accessoryItems[0].image || "/placeholder.svg"}
                      alt={accessoryItems[0].type}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de prendas incluidas */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Prendas en este conjunto:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="capitalize">
                    {item.type} {item.color}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Texto informativo */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Para compartir este look, puedes tomar una captura de pantalla y enviarla por WhatsApp u otra aplicación.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
