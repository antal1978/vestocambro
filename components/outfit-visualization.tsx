"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react" // Eliminamos Bot icon

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
  climate?: string
  occasion?: string
}

export function OutfitVisualization({
  items,
  isOpen,
  onClose,
  climate = "templado",
  occasion = "casual",
}: OutfitVisualizationProps) {
  const [expandedImage, setExpandedImage] = useState<{
    image: string
    type: string
    color: string
  } | null>(null)

  // Eliminamos el estado para mostrar/ocultar el asesor de IA
  // const [showAIAdvisor, setShowAIAdvisor] = useState(false)

  // Clasificar prendas por categoría (evitando duplicados)
  const outerwearItems = items.filter(
    (item) => item.isOuterwear || ["campera", "tapado", "blazer", "abrigo"].includes(item.type),
  )
  const outerwearIds = outerwearItems.map((item) => item.id)

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

  const getImageToShow = (item: ClothingItem) => {
    return item.image
  }

  const handleImageClick = (item: ClothingItem) => {
    const imageToShow = getImageToShow(item)
    setExpandedImage({
      image: imageToShow,
      type: item.type,
      color: item.color,
    })
  }

  const closeExpandedImage = () => {
    setExpandedImage(null)
  }

  // Eliminamos la función para mostrar/ocultar el asesor de IA
  // const toggleAIAdvisor = () => {
  //   setShowAIAdvisor(!showAIAdvisor)
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle>Tu conjunto completo</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="relative bg-white rounded-lg p-4 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-70"></div>

            <div className="relative flex flex-col items-center">
              <div className="relative w-full flex flex-col items-center gap-2">
                {upperItems.length > 0 && !fullBodyItems.length && (
                  <div className="relative z-20 w-[70%] max-w-[250px]">
                    <div className="aspect-square relative">
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(upperItems[0])}
                      >
                        <img
                          src={getImageToShow(upperItems[0]) || "/placeholder.svg"}
                          alt={upperItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fullBodyItems.length > 0 && (
                  <div className="relative z-20 w-[70%] max-w-[250px]">
                    <div className="aspect-[3/4] relative">
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(fullBodyItems[0])}
                      >
                        <img
                          src={getImageToShow(fullBodyItems[0]) || "/placeholder.svg"}
                          alt={fullBodyItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!fullBodyItems.length && lowerItems.length > 0 && (
                  <div className="relative w-[70%] max-w-[250px] z-10">
                    <div className="aspect-[3/4] relative">
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(lowerItems[0])}
                      >
                        <img
                          src={getImageToShow(lowerItems[0]) || "/placeholder.svg"}
                          alt={lowerItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-2 w-full mt-2">
                  {outerwearItems.length > 0 && (
                    <div className="relative w-[45%] max-w-[150px] z-30">
                      <div className="aspect-square relative">
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                          onClick={() => handleImageClick(outerwearItems[0])}
                        >
                          <img
                            src={getImageToShow(outerwearItems[0]) || "/placeholder.svg"}
                            alt={outerwearItems[0].type}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {footwearItems.length > 0 && (
                    <div className="relative w-[45%] max-w-[150px] z-10">
                      <div className="aspect-square relative">
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                          onClick={() => handleImageClick(footwearItems[0])}
                        >
                          <img
                            src={getImageToShow(footwearItems[0]) || "/placeholder.svg"}
                            alt={footwearItems[0].type}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {accessoryItems.length > 0 && (
                  <div className="relative w-[40%] max-w-[120px] z-40 mt-2">
                    <div className="aspect-square relative">
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(accessoryItems[0])}
                      >
                        <img
                          src={getImageToShow(accessoryItems[0]) || "/placeholder.svg"}
                          alt={accessoryItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Toca cada prenda para verla en detalle</p>
          </div>

          <div className="mt-4 border-t pt-4 pb-2">
            <h3 className="text-sm font-medium mb-2">Prendas en este conjunto:</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm border text-xs"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="capitalize">
                    {item.type} {item.color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Eliminamos el botón para consultar al asesor de IA */}
          {/* <div className="mt-4 flex justify-center">
            <Button onClick={toggleAIAdvisor} className="gap-2" variant={showAIAdvisor ? "secondary" : "default"}>
              <Bot className="h-4 w-4" />
              {showAIAdvisor ? "Ocultar asesor IA" : "Consultar a asesor IA"}
            </Button>
          </div> */}

          <p className="text-xs text-muted-foreground text-center mt-2 mb-2">
            Captura de pantalla para compartir este look.
          </p>
        </div>

        {/* Eliminamos el Asesor de IA */}
        {/* {showAIAdvisor && (
          <div className="border-t p-4">
            <OutfitAIAdvisor
              outfit={items}
              climate={climate}
              occasion={occasion}
              onClose={() => setShowAIAdvisor(false)}
            />
          </div>
        )} */}

        {expandedImage && (
          <Dialog open={!!expandedImage} onOpenChange={closeExpandedImage}>
            <DialogContent className="sm:max-w-[80%] p-0 overflow-hidden bg-white">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="capitalize">
                  {expandedImage.type} {expandedImage.color}
                </DialogTitle>
              </DialogHeader>
              <div className="relative p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeExpandedImage}
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="max-h-[70vh] overflow-auto">
                  <img
                    src={expandedImage.image || "/placeholder.svg"}
                    alt={`${expandedImage.type} ${expandedImage.color}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
