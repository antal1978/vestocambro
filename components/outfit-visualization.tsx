"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

type ProcessedImage = {
  id: string
  originalImage: string
  processedImage: string | null
  isProcessing: boolean
  isProcessed: boolean
}

export function OutfitVisualization({ items, isOpen, onClose }: OutfitVisualizationProps) {
  // Estado para las imágenes procesadas
  const [processedImages, setProcessedImages] = useState<Record<string, ProcessedImage>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingMessage, setProcessingMessage] = useState("")
  const [processingComplete, setProcessingComplete] = useState(false)

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

  // Función mejorada para procesar una imagen y eliminar el fondo
  const processImage = async (imageUrl: string, itemId: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulamos un tiempo de procesamiento para la demo
      const processingTime = 1000 + Math.random() * 1000

      // Creamos un elemento de imagen para cargar la imagen original
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageUrl

      img.onload = () => {
        // Creamos un canvas para procesar la imagen
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          // Si no se puede obtener el contexto, devolvemos la imagen original
          resolve(imageUrl)
          return
        }

        // Dibujamos la imagen original en el canvas
        ctx.drawImage(img, 0, 0)

        // Obtenemos los datos de la imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Algoritmo mejorado para eliminar fondos
        // Primero detectamos el color predominante en los bordes (asumiendo que es el fondo)
        const borderPixels: number[][] = []

        // Muestrear píxeles de los bordes
        const borderWidth = 10
        // Borde superior e inferior
        for (let x = 0; x < canvas.width; x++) {
          for (let y = 0; y < borderWidth; y++) {
            const idx = (y * canvas.width + x) * 4
            borderPixels.push([data[idx], data[idx + 1], data[idx + 2]])
          }
          for (let y = canvas.height - borderWidth; y < canvas.height; y++) {
            const idx = (y * canvas.width + x) * 4
            borderPixels.push([data[idx], data[idx + 1], data[idx + 2]])
          }
        }
        // Bordes izquierdo y derecho
        for (let y = borderWidth; y < canvas.height - borderWidth; y++) {
          for (let x = 0; x < borderWidth; x++) {
            const idx = (y * canvas.width + x) * 4
            borderPixels.push([data[idx], data[idx + 1], data[idx + 2]])
          }
          for (let x = canvas.width - borderWidth; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4
            borderPixels.push([data[idx], data[idx + 1], data[idx + 2]])
          }
        }

        // Calcular el color promedio del borde (probable fondo)
        let avgR = 0,
          avgG = 0,
          avgB = 0
        borderPixels.forEach((pixel) => {
          avgR += pixel[0]
          avgG += pixel[1]
          avgB += pixel[2]
        })
        avgR = Math.round(avgR / borderPixels.length)
        avgG = Math.round(avgG / borderPixels.length)
        avgB = Math.round(avgB / borderPixels.length)

        // Determinar si el fondo es claro u oscuro
        const brightness = (avgR + avgG + avgB) / 3
        const isLightBackground = brightness > 127

        // Umbral de tolerancia para considerar un píxel como parte del fondo
        const tolerance = isLightBackground ? 35 : 25

        // Procesar todos los píxeles
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Calcular la diferencia de color con el fondo promedio
          const diffR = Math.abs(r - avgR)
          const diffG = Math.abs(g - avgG)
          const diffB = Math.abs(b - avgB)
          const colorDiff = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB)

          // Si el color es similar al fondo, hacerlo transparente
          if (colorDiff < tolerance) {
            data[i + 3] = 0 // Totalmente transparente
          }
          // Para los píxeles cercanos al umbral, aplicar transparencia parcial para suavizar bordes
          else if (colorDiff < tolerance * 1.5) {
            const alpha = Math.round((255 * (colorDiff - tolerance)) / (tolerance * 0.5))
            data[i + 3] = alpha
          }
        }

        // Actualizamos el canvas con la imagen procesada
        ctx.putImageData(imageData, 0, 0)

        // Simulamos un tiempo de procesamiento
        setTimeout(() => {
          // Convertimos el canvas a una URL de datos
          const processedImageUrl = canvas.toDataURL("image/png")
          resolve(processedImageUrl)
        }, processingTime)
      }

      img.onerror = () => {
        // Si hay un error, devolvemos la imagen original
        resolve(imageUrl)
      }
    })
  }

  // Efecto para iniciar el procesamiento cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && items.length > 0) {
      // Inicializamos el estado de procesamiento
      setIsProcessing(true)
      setProcessingProgress(0)
      setProcessingMessage("✨ Preparando tu look con mejor visualización...")
      setProcessingComplete(false)

      // Inicializamos el estado de las imágenes procesadas
      const initialProcessedImages: Record<string, ProcessedImage> = {}
      items.forEach((item) => {
        initialProcessedImages[item.id] = {
          id: item.id,
          originalImage: item.image,
          processedImage: null,
          isProcessing: false,
          isProcessed: false,
        }
      })
      setProcessedImages(initialProcessedImages)

      // Procesamos las imágenes una por una
      const processAllImages = async () => {
        let processedCount = 0

        for (const item of items) {
          // Actualizamos el estado para indicar que estamos procesando esta imagen
          setProcessedImages((prev) => ({
            ...prev,
            [item.id]: {
              ...prev[item.id],
              isProcessing: true,
            },
          }))

          setProcessingMessage(`🎨 Procesando ${item.type} ${item.color}...`)

          try {
            // Procesamos la imagen
            const processedImageUrl = await processImage(item.image, item.id)

            // Actualizamos el estado con la imagen procesada
            setProcessedImages((prev) => ({
              ...prev,
              [item.id]: {
                ...prev[item.id],
                processedImage: processedImageUrl,
                isProcessing: false,
                isProcessed: true,
              },
            }))

            // Actualizamos el progreso
            processedCount++
            const progress = Math.round((processedCount / items.length) * 100)
            setProcessingProgress(progress)
            setProcessingMessage(`👗 Procesando prenda ${processedCount} de ${items.length}...`)
          } catch (error) {
            console.error("Error al procesar imagen:", error)

            // En caso de error, marcamos la imagen como procesada pero usamos la original
            setProcessedImages((prev) => ({
              ...prev,
              [item.id]: {
                ...prev[item.id],
                isProcessing: false,
                isProcessed: true,
              },
            }))

            // Actualizamos el progreso incluso si hay error
            processedCount++
            const progress = Math.round((processedCount / items.length) * 100)
            setProcessingProgress(progress)
          }
        }

        // Cuando terminamos de procesar todas las imágenes
        setProcessingMessage("✅ ¡Perfecto! Fondos eliminados y look listo")
        setProcessingComplete(true)

        // Después de un breve momento, ocultamos el indicador de procesamiento
        setTimeout(() => {
          setIsProcessing(false)
        }, 1500)
      }

      // Iniciamos el procesamiento después de un breve retraso para que se muestre el diálogo primero
      const timeoutId = setTimeout(() => {
        processAllImages()
      }, 500)

      // Limpieza al desmontar
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, items])

  // Función para obtener la URL de la imagen a mostrar (procesada o original)
  const getImageToShow = (item: ClothingItem) => {
    const processedItem = processedImages[item.id]

    if (!processedItem) return item.image
    if (processedItem.isProcessed && processedItem.processedImage) return processedItem.processedImage

    return item.image
  }

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
          {/* Indicador de procesamiento */}
          {isProcessing && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                <p className="text-sm font-medium text-primary-700">{processingMessage}</p>
              </div>
              <Progress value={processingProgress} className="h-2" />
              <p className="text-xs text-primary-600 mt-1 text-right">{processingProgress}%</p>
            </div>
          )}

          {/* Visualización mejorada del outfit estilo collage */}
          <div className="relative bg-white rounded-lg p-4 shadow-sm overflow-hidden">
            {/* Fondo con patrón sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-70"></div>

            <div className="relative flex flex-col items-center">
              {/* Contenedor principal para el collage - reducido en altura y con mejor organización */}
              <div className="relative w-full flex flex-col items-center gap-2">
                {/* Prenda superior */}
                {upperItems.length > 0 && !fullBodyItems.length && (
                  <div className="relative z-20 w-[70%] max-w-[250px]">
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={getImageToShow(upperItems[0]) || "/placeholder.svg"}
                          alt={upperItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                        {processedImages[upperItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        {processedImages[upperItems[0].id]?.isProcessed &&
                          processedImages[upperItems[0].id]?.processedImage && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                              Procesada
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prenda completa (vestido) - si existe */}
                {fullBodyItems.length > 0 && (
                  <div className="relative z-20 w-[70%] max-w-[250px]">
                    <div className="aspect-[3/4] relative">
                      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={getImageToShow(fullBodyItems[0]) || "/placeholder.svg"}
                          alt={fullBodyItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                        {processedImages[fullBodyItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        {processedImages[fullBodyItems[0].id]?.isProcessed &&
                          processedImages[fullBodyItems[0].id]?.processedImage && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                              Procesada
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Parte inferior */}
                {!fullBodyItems.length && lowerItems.length > 0 && (
                  <div className="relative w-[70%] max-w-[250px] z-10">
                    <div className="aspect-[3/4] relative">
                      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={getImageToShow(lowerItems[0]) || "/placeholder.svg"}
                          alt={lowerItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                        {processedImages[lowerItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        {processedImages[lowerItems[0].id]?.isProcessed &&
                          processedImages[lowerItems[0].id]?.processedImage && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                              Procesada
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fila para abrigo y calzado */}
                <div className="flex justify-center gap-2 w-full mt-2">
                  {/* Abrigo */}
                  {outerwearItems.length > 0 && (
                    <div className="relative w-[45%] max-w-[150px] z-30">
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={getImageToShow(outerwearItems[0]) || "/placeholder.svg"}
                            alt={outerwearItems[0].type}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                          {processedImages[outerwearItems[0].id]?.isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                          )}
                          {processedImages[outerwearItems[0].id]?.isProcessed &&
                            processedImages[outerwearItems[0].id]?.processedImage && (
                              <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                                Procesada
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calzado */}
                  {footwearItems.length > 0 && (
                    <div className="relative w-[45%] max-w-[150px] z-10">
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={getImageToShow(footwearItems[0]) || "/placeholder.svg"}
                            alt={footwearItems[0].type}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                          {processedImages[footwearItems[0].id]?.isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                          )}
                          {processedImages[footwearItems[0].id]?.isProcessed &&
                            processedImages[footwearItems[0].id]?.processedImage && (
                              <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                                Procesada
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accesorios */}
                {accessoryItems.length > 0 && (
                  <div className="relative w-[40%] max-w-[120px] z-40 mt-2">
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={getImageToShow(accessoryItems[0]) || "/placeholder.svg"}
                          alt={accessoryItems[0].type}
                          className="w-full h-full object-contain bg-gray-50"
                        />
                        {processedImages[accessoryItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        {processedImages[accessoryItems[0].id]?.isProcessed &&
                          processedImages[accessoryItems[0].id]?.processedImage && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm">
                              Procesada
                            </div>
                          )}
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

          {/* Texto informativo - más corto */}
          <p className="text-xs text-muted-foreground text-center mt-2 mb-2">
            Captura de pantalla para compartir este look.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
