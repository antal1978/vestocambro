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

  const [expandedImage, setExpandedImage] = useState<{
    image: string
    type: string
    color: string
  } | null>(null)

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
          resolve(imageUrl)
          return
        }

        // Dibujamos la imagen original en el canvas
        ctx.drawImage(img, 0, 0)

        // Obtenemos los datos de la imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Algoritmo avanzado de detección de fondo
        const width = canvas.width
        const height = canvas.height

        // 1. Muestrear múltiples regiones del borde para mejor detección
        const borderSamples: number[][] = []
        const cornerSamples: number[][] = []

        // Tamaño de muestra adaptativo
        const sampleSize = Math.max(3, Math.min(width, height) * 0.02)
        const cornerSize = Math.max(8, Math.min(width, height) * 0.05)

        // Muestrear esquinas con mayor peso
        for (let i = 0; i < cornerSize; i++) {
          for (let j = 0; j < cornerSize; j++) {
            // Esquina superior izquierda
            let idx = (j * width + i) * 4
            cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]])

            // Esquina superior derecha
            idx = (j * width + (width - 1 - i)) * 4
            cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]])

            // Esquina inferior izquierda
            idx = ((height - 1 - j) * width + i) * 4
            cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]])

            // Esquina inferior derecha
            idx = ((height - 1 - j) * width + (width - 1 - i)) * 4
            cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]])
          }
        }

        // Muestrear bordes
        for (let i = 0; i < width; i += Math.max(1, Math.floor(width / 50))) {
          for (let j = 0; j < sampleSize; j++) {
            // Borde superior
            let idx = (j * width + i) * 4
            borderSamples.push([data[idx], data[idx + 1], data[idx + 2]])

            // Borde inferior
            idx = ((height - 1 - j) * width + i) * 4
            borderSamples.push([data[idx], data[idx + 1], data[idx + 2]])
          }
        }

        for (let j = 0; j < height; j += Math.max(1, Math.floor(height / 50))) {
          for (let i = 0; i < sampleSize; i++) {
            // Borde izquierdo
            let idx = (j * width + i) * 4
            borderSamples.push([data[idx], data[idx + 1], data[idx + 2]])

            // Borde derecho
            idx = (j * width + (width - 1 - i)) * 4
            borderSamples.push([data[idx], data[idx + 1], data[idx + 2]])
          }
        }

        // 2. Análisis estadístico del color de fondo
        const allSamples = [...cornerSamples, ...cornerSamples, ...borderSamples] // Doble peso a esquinas

        // Calcular color promedio
        let avgR = 0,
          avgG = 0,
          avgB = 0
        allSamples.forEach(([r, g, b]) => {
          avgR += r
          avgG += g
          avgB += b
        })
        avgR = Math.round(avgR / allSamples.length)
        avgG = Math.round(avgG / allSamples.length)
        avgB = Math.round(avgB / allSamples.length)

        // Calcular desviación estándar
        let varR = 0,
          varG = 0,
          varB = 0
        allSamples.forEach(([r, g, b]) => {
          varR += Math.pow(r - avgR, 2)
          varG += Math.pow(g - avgG, 2)
          varB += Math.pow(b - avgB, 2)
        })
        const stdR = Math.sqrt(varR / allSamples.length)
        const stdG = Math.sqrt(varG / allSamples.length)
        const stdB = Math.sqrt(varB / allSamples.length)
        const avgStd = (stdR + stdG + stdB) / 3

        // 3. Determinar características del fondo
        const brightness = (avgR + avgG + avgB) / 3
        const isLightBackground = brightness > 127
        const isVeryLight = brightness > 200
        const isVeryDark = brightness < 50
        const isUniform = avgStd < 15

        // 4. Calcular tolerancia adaptativa
        let baseTolerance = 30
        if (isVeryLight) baseTolerance = 70
        else if (isLightBackground) baseTolerance = 50
        else if (isVeryDark) baseTolerance = 25

        // Ajustar por uniformidad del fondo
        if (!isUniform) baseTolerance += avgStd * 0.8

        // 5. Algoritmo de eliminación de fondo mejorado
        const processedData = new Uint8ClampedArray(data)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Calcular múltiples métricas de similitud
          const euclideanDist = Math.sqrt(Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2))

          const manhattanDist = Math.abs(r - avgR) + Math.abs(g - avgG) + Math.abs(b - avgB)
          const maxChannelDiff = Math.max(Math.abs(r - avgR), Math.abs(g - avgG), Math.abs(b - avgB))

          // Calcular saturación del píxel
          const pixelBrightness = (r + g + b) / 3
          const saturation = Math.max(
            Math.abs(r - pixelBrightness),
            Math.abs(g - pixelBrightness),
            Math.abs(b - pixelBrightness),
          )

          // Algoritmo específico para fondos claros
          if (isLightBackground) {
            // Para fondos claros, usar múltiples criterios
            const brightnessSimilarity = Math.abs(pixelBrightness - brightness)
            const isLowSaturation = saturation < 20
            const isColorSimilar = euclideanDist < baseTolerance
            const isBrightnessSimilar = brightnessSimilarity < 30

            if (isVeryLight) {
              // Para fondos muy claros (blancos), ser más agresivo
              if (
                (isColorSimilar && isLowSaturation) ||
                (isBrightnessSimilar && isLowSaturation && maxChannelDiff < 40)
              ) {
                processedData[i + 3] = 0
              } else if (euclideanDist < baseTolerance * 1.3) {
                // Transición suave
                const alpha = Math.round((euclideanDist / baseTolerance) * 255)
                processedData[i + 3] = Math.min(255, Math.max(0, alpha))
              }
            } else {
              // Para fondos claros normales
              if (isColorSimilar && (isLowSaturation || isBrightnessSimilar)) {
                processedData[i + 3] = 0
              } else if (euclideanDist < baseTolerance * 1.2) {
                const alpha = Math.round(((euclideanDist - baseTolerance * 0.7) / (baseTolerance * 0.5)) * 255)
                processedData[i + 3] = Math.min(255, Math.max(0, alpha))
              }
            }
          } else {
            // Para fondos oscuros, usar el algoritmo optimizado original
            if (euclideanDist < baseTolerance) {
              processedData[i + 3] = 0
            } else if (euclideanDist < baseTolerance * 1.4) {
              const alpha = Math.round(((euclideanDist - baseTolerance) / (baseTolerance * 0.4)) * 255)
              processedData[i + 3] = Math.min(255, Math.max(0, alpha))
            }
          }
        }

        // 6. Post-procesamiento: suavizado de bordes
        const finalData = new Uint8ClampedArray(processedData)

        // Aplicar filtro de mediana para reducir ruido
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4 + 3

            if (processedData[idx] > 0 && processedData[idx] < 255) {
              const neighbors = []
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nIdx = ((y + dy) * width + (x + dx)) * 4 + 3
                  neighbors.push(processedData[nIdx])
                }
              }
              neighbors.sort((a, b) => a - b)
              finalData[idx] = neighbors[4] // Mediana
            }
          }
        }

        // 7. Aplicar erosión suave para limpiar bordes
        const erodedData = new Uint8ClampedArray(finalData)
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4 + 3

            if (finalData[idx] < 128) {
              // Solo para píxeles semi-transparentes
              let minAlpha = 255
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nIdx = ((y + dy) * width + (x + dx)) * 4 + 3
                  minAlpha = Math.min(minAlpha, finalData[nIdx])
                }
              }
              erodedData[idx] = Math.min(finalData[idx], minAlpha + 20)
            }
          }
        }

        // Aplicar los datos finales
        const finalImageData = new ImageData(erodedData, width, height)
        ctx.putImageData(finalImageData, 0, 0)

        setTimeout(() => {
          const processedImageUrl = canvas.toDataURL("image/png")
          resolve(processedImageUrl)
        }, processingTime)
      }

      img.onerror = () => {
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
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(upperItems[0])}
                      >
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
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(fullBodyItems[0])}
                      >
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
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(lowerItems[0])}
                      >
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
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                          onClick={() => handleImageClick(outerwearItems[0])}
                        >
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
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                          onClick={() => handleImageClick(footwearItems[0])}
                        >
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
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                        onClick={() => handleImageClick(accessoryItems[0])}
                      >
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
        {/* Diálogo para mostrar imagen ampliada */}
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
