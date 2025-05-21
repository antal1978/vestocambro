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
  // Clasificar prendas por categoría
  const upperItems = items.filter((item) => ["remera", "camisa", "sweater", "blusa", "cardigan"].includes(item.type))
  const lowerItems = items.filter((item) => ["pantalon", "jean", "falda", "shorts", "jeans"].includes(item.type))
  const fullBodyItems = items.filter((item) => ["vestido", "mono", "jumpsuit"].includes(item.type))
  const outerwearItems = items.filter(
    (item) => item.isOuterwear || ["campera", "tapado", "blazer", "abrigo"].includes(item.type),
  )
  const footwearItems = items.filter((item) => ["calzado", "zapatos", "zapatillas", "botas"].includes(item.type))
  const accessoryItems = items.filter((item) =>
    ["accesorio", "bufanda", "gorro", "cinturon", "guantes"].includes(item.type),
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
          {/* Grid de outfit con tamaños corregidos */}
          <div id="outfit-grid" className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              {/* Columna principal (izquierda) - 3/4 del ancho */}
              <div className="col-span-3 space-y-4">
                {/* Parte superior o prenda completa */}
                {fullBodyItems.length > 0 ? (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full max-w-[200px]">
                      <div className="aspect-[2/3] relative">
                        <img
                          src={fullBodyItems[0].image || "/placeholder.svg"}
                          alt={fullBodyItems[0].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  upperItems.length > 0 && (
                    <div className="bg-white rounded-md p-2 flex justify-center">
                      <div className="w-full max-w-[180px]">
                        <div className="aspect-square relative">
                          <img
                            src={upperItems[0].image || "/placeholder.svg"}
                            alt={upperItems[0].type}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Parte inferior (solo si no hay prenda completa) */}
                {!fullBodyItems.length && lowerItems.length > 0 && (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full max-w-[180px]">
                      <div className="aspect-[2/3] relative">
                        <img
                          src={lowerItems[0].image || "/placeholder.svg"}
                          alt={lowerItems[0].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Calzado */}
                {footwearItems.length > 0 && (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full max-w-[120px]">
                      <div className="aspect-square relative">
                        <img
                          src={footwearItems[0].image || "/placeholder.svg"}
                          alt={footwearItems[0].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna lateral (derecha) - 1/4 del ancho */}
              <div className="col-span-1 space-y-4">
                {/* Abrigo */}
                {outerwearItems.length > 0 && (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full">
                      <div className="aspect-[2/3] relative">
                        <img
                          src={outerwearItems[0].image || "/placeholder.svg"}
                          alt={outerwearItems[0].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Accesorios */}
                {accessoryItems.length > 0 && (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full">
                      <div className="aspect-square relative">
                        <img
                          src={accessoryItems[0].image || "/placeholder.svg"}
                          alt={accessoryItems[0].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Segundo accesorio si existe */}
                {accessoryItems.length > 1 && (
                  <div className="bg-white rounded-md p-2 flex justify-center">
                    <div className="w-full">
                      <div className="aspect-square relative">
                        <img
                          src={accessoryItems[1].image || "/placeholder.svg"}
                          alt={accessoryItems[1].type}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
