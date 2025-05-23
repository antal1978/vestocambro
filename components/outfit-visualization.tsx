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

        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          {/* Visualización mejorada del outfit estilo collage */}
          <div className="relative bg-white rounded-lg p-6 shadow-sm overflow-hidden">
            {/* Fondo con patrón sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-70"></div>

            <div className="relative flex flex-col items-center min-h-[400px]">
              {/* Contenedor principal para el collage */}
              <div className="relative w-full flex flex-col items-center">
                {/* Prenda superior o vestido */}
                {(fullBodyItems.length > 0 || upperItems.length > 0) && (
                  <div className={`relative z-20 ${fullBodyItems.length > 0 ? "w-[85%]" : "w-[75%]"} transition-all`}>
                    <div className={`${fullBodyItems.length > 0 ? "aspect-[2/3]" : "aspect-square"} relative`}>
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] hover:shadow-lg">
                        <img
                          src={fullBodyItems.length > 0 ? fullBodyItems[0].image : upperItems[0].image}
                          alt={fullBodyItems.length > 0 ? fullBodyItems[0].type : upperItems[0].type}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Parte inferior (solo si no hay prenda completa) */}
                {!fullBodyItems.length && lowerItems.length > 0 && (
                  <div className="relative w-[70%] -mt-[15%] z-10 transition-all">
                    <div className="aspect-[3/4] relative">
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] hover:shadow-lg">
                        <img
                          src={lowerItems[0].image || "/placeholder.svg"}
                          alt={lowerItems[0].type}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Abrigo (si existe) - se muestra encima */}
                {outerwearItems.length > 0 && (
                  <div className="absolute top-[5%] w-[90%] z-30 transition-all">
                    <div className="aspect-[3/4] relative">
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] hover:shadow-lg">
                        <img
                          src={outerwearItems[0].image || "/placeholder.svg"}
                          alt={outerwearItems[0].type}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Calzado */}
                {footwearItems.length > 0 && (
                  <div className="relative w-[50%] -mt-[10%] z-10 transition-all">
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] hover:shadow-lg">
                        <img
                          src={footwearItems[0].image || "/placeholder.svg"}
                          alt={footwearItems[0].type}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Accesorios */}
                {accessoryItems.length > 0 && (
                  <div className="absolute top-[5%] right-[5%] w-[30%] z-40 transition-all">
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] hover:shadow-lg">
                        <img
                          src={accessoryItems[0].image || "/placeholder.svg"}
                          alt={accessoryItems[0].type}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controles y opciones */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Toca cada prenda para verla en detalle</p>
          </div>

          {/* Lista de prendas incluidas */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Prendas en este conjunto:</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm border text-xs"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="capitalize">
                    {item.type} {item.color}
                  </span>
                </div>
              ))}
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
