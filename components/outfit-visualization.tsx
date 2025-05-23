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

  // Función para procesar una imagen y eliminar el fondo
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

        // Algoritmo simple para eliminar fondos blancos/claros
        // Este es un algoritmo básico que funciona bien con fondos claros
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Si el pixel es claro (cercano al blanco), lo hacemos transparente
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0 // Canal alfa (transparencia)
          }

          // Para bordes más suaves, hacemos semi-transparentes los píxeles casi blancos
          else if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 128 // Semi-transparente
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
        setProcessingMessage("✅ ¡Perfecto! Tu look está listo")
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
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
                          src={
                            fullBodyItems.length > 0 ? getImageToShow(fullBodyItems[0]) : getImageToShow(upperItems[0])
                          }
                          alt={fullBodyItems.length > 0 ? fullBodyItems[0].type : upperItems[0].type}
                          className="w-full h-full object-contain bg-transparent"
                        />
                        {processedImages[fullBodyItems.length > 0 ? fullBodyItems[0].id : upperItems[0].id]
                          ?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
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
                          src={getImageToShow(lowerItems[0]) || "/placeholder.svg"}
                          alt={lowerItems[0].type}
                          className="w-full h-full object-contain bg-transparent"
                        />
                        {processedImages[lowerItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
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
                          src={getImageToShow(outerwearItems[0]) || "/placeholder.svg"}
                          alt={outerwearItems[0].type}
                          className="w-full h-full object-contain bg-transparent"
                        />
                        {processedImages[outerwearItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
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
                          src={getImageToShow(footwearItems[0]) || "/placeholder.svg"}
                          alt={footwearItems[0].type}
                          className="w-full h-full object-contain bg-transparent"
                        />
                        {processedImages[footwearItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
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
                          src={getImageToShow(accessoryItems[0]) || "/placeholder.svg"}
                          alt={accessoryItems[0].type}
                          className="w-full h-full object-contain bg-transparent"
                        />
                        {processedImages[accessoryItems[0].id]?.isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
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
