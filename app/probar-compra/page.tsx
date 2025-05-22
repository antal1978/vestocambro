"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, ShoppingBag, X, RotateCw, Check, ArrowLeft, Sparkles, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OutfitVisualization } from "@/components/outfit-visualization"
import { Checkbox } from "@/components/ui/checkbox"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type ClothingCategory = "upperBody" | "lowerBody" | "fullBody" | "outerwear" | "footwear" | "accessories"

// Mapeo de tipos de prendas a categorías
const CLOTHING_CATEGORIES: Record<ClothingCategory, string[]> = {
  upperBody: ["remera", "camisa", "sweater", "buzo", "blusa", "cardigan"],
  lowerBody: ["pantalon", "jean", "falda", "shorts", "jeans"],
  fullBody: ["vestido", "mono", "jumpsuit"],
  outerwear: ["campera", "tapado", "blazer", "abrigo"],
  footwear: ["calzado", "zapatos", "zapatillas", "botas"],
  accessories: ["accesorio", "bufanda", "gorro", "guantes", "cinturon"],
}

// Nombres de categorías para mostrar
const CATEGORY_NAMES: Record<ClothingCategory, string> = {
  upperBody: "Parte superior",
  lowerBody: "Parte inferior",
  fullBody: "Prenda completa",
  outerwear: "Abrigo",
  footwear: "Calzado",
  accessories: "Accesorios",
}

export default function ProbarCompraPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [type, setType] = useState("")
  const [color, setColor] = useState("")
  const [isOuterwear, setIsOuterwear] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [items, setItems] = useState<ClothingItem[]>([])
  const [newItem, setNewItem] = useState<ClothingItem | null>(null)
  const [currentLook, setCurrentLook] = useState<Record<ClothingCategory, ClothingItem | null>>({
    upperBody: null,
    lowerBody: null,
    fullBody: null,
    outerwear: null,
    footwear: null,
    accessories: null,
  })
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>("upperBody")
  const [showOutfitVisualization, setShowOutfitVisualization] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { toast } = useToast()

  // Cargar prendas existentes
  useEffect(() => {
    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      setItems(JSON.parse(storedItems))
    }
  }, [])

  // Limpiar el stream de la cámara cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Función para iniciar la cámara
  const startCamera = async () => {
    // Verificar si el navegador soporta la API MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari recientes.")
      toast({
        title: "Navegador no compatible",
        description: "Tu navegador no soporta el acceso a la cámara.",
        variant: "destructive",
      })
      return
    }

    // Mostrar la UI de cámara y establecer estado de carga
    setShowCamera(true)
    setIsCameraLoading(true)
    setCameraError(null)

    // Detener cualquier stream anterior
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Pequeño retraso para asegurar que el elemento de video se ha renderizado
    setTimeout(async () => {
      try {
        // Verificar que el elemento de video existe
        if (!videoRef.current) {
          throw new Error("Elemento de video no disponible. Intenta de nuevo.")
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Usar cámara trasera si está disponible
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        // Verificar nuevamente que el elemento de video existe
        if (!videoRef.current) {
          throw new Error("Elemento de video no disponible después de obtener el stream.")
        }

        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((e) => {
              console.error("Error al reproducir el video:", e)
              setCameraError("Error al iniciar la reproducción del video.")
            })
          }
        }
        streamRef.current = stream
      } catch (err) {
        console.error("Error al acceder a la cámara:", err)

        // Mensaje de error más específico
        let errorMessage = "No se pudo acceder a la cámara."
        if (err instanceof Error) {
          errorMessage = err.message
        }

        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            errorMessage =
              "Permiso denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador."
          } else if (err.name === "NotFoundError") {
            errorMessage = "No se encontró ninguna cámara en tu dispositivo."
          } else if (err.name === "NotReadableError" || err.name === "AbortError") {
            errorMessage = "La cámara está siendo utilizada por otra aplicación."
          } else if (err.name === "SecurityError") {
            errorMessage = "Error de seguridad al acceder a la cámara."
          }
        }

        setCameraError(errorMessage)
        toast({
          title: "Error de cámara",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsCameraLoading(false)
      }
    }, 100)
  }

  // Función para tomar la foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "No se pudo capturar la foto. Error interno.",
        variant: "destructive",
      })
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Verificar que el video esté reproduciendo
      if (video.readyState !== 4) {
        toast({
          title: "Espera un momento",
          description: "La cámara aún se está inicializando.",
          variant: "warning",
        })
        return
      }

      // Configurar canvas con dimensiones del video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext("2d")
      if (!context) {
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen.",
          variant: "destructive",
        })
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir a base64
      try {
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)

        // Comprimir la imagen
        compressImage(imageDataUrl)
          .then((compressedImage) => {
            setImagePreview(compressedImage)
            setShowCamera(false)

            // Detener la cámara
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
              streamRef.current = null
            }

            toast({
              title: "Foto capturada",
              description: "La foto se ha tomado correctamente.",
            })
          })
          .catch((err) => {
            console.error("Error al comprimir la imagen:", err)
            toast({
              title: "Error",
              description: "No se pudo procesar la imagen capturada.",
              variant: "destructive",
            })
          })
      } catch (err) {
        console.error("Error al convertir canvas a imagen:", err)
        toast({
          title: "Error",
          description: "No se pudo convertir la captura a imagen.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error al capturar foto:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al capturar la foto.",
        variant: "destructive",
      })
    }
  }

  // Función para comprimir la imagen
  const compressImage = (dataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Redimensionar si es necesario
        if (width > maxWidth) {
          height = Math.floor((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)

          // Comprimir
          resolve(canvas.toDataURL("image/jpeg", quality))
        } else {
          resolve(dataUrl) // Fallback si no se puede comprimir
        }
      }
    })
  }

  // Función para cancelar la captura
  const cancelCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Comprimir la imagen antes de guardarla
        compressImage(result).then((compressedImage) => {
          setImagePreview(compressedImage)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para crear la prenda temporal
  const createTemporaryItem = () => {
    if (!imagePreview || !type || !color) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa al menos la imagen, tipo y color de la prenda",
        variant: "destructive",
      })
      return
    }

    // Crear prenda temporal
    const tempItem: ClothingItem = {
      id: "temp-" + Date.now().toString(),
      image: imagePreview,
      type,
      color,
      occasion: "casual", // Valores por defecto
      climate: "todo-clima", // Valores por defecto
      isOuterwear,
    }

    setNewItem(tempItem)

    // Determinar la categoría de la prenda
    const category = getItemCategory(tempItem)
    if (category) {
      // Actualizar el look actual con la nueva prenda
      setCurrentLook({
        ...currentLook,
        [category]: tempItem,
      })
    }

    // Cambiar a la pestaña de combinación
    setActiveTab("combine")

    toast({
      title: "¡Prenda lista para probar!",
      description: "Ahora puedes combinarla con otras prendas de tu guardarropa.",
      variant: "success",
    })
  }

  // Determinar a qué categoría pertenece una prenda
  const getItemCategory = (item: ClothingItem): ClothingCategory | null => {
    for (const [category, types] of Object.entries(CLOTHING_CATEGORIES)) {
      if (types.includes(item.type) || (category === "outerwear" && item.isOuterwear)) {
        return category as ClothingCategory
      }
    }
    return null
  }

  // Seleccionar una prenda para el look virtual
  const selectItemForVirtualTryOn = (item: ClothingItem) => {
    const category = getItemCategory(item)
    if (!category) return

    // Si es una prenda completa y ya hay seleccionadas prendas superiores o inferiores, preguntar
    if (category === "fullBody" && (currentLook.upperBody || currentLook.lowerBody)) {
      toast({
        title: "Atención",
        description: "Al seleccionar un vestido se eliminarán las prendas superiores e inferiores seleccionadas.",
        variant: "warning",
      })

      // Actualizar el look actual
      setCurrentLook({
        ...currentLook,
        upperBody: null,
        lowerBody: null,
        fullBody: item,
      })

      return
    }

    // Si se selecciona una prenda superior o inferior y ya hay un vestido, eliminar el vestido
    if ((category === "upperBody" || category === "lowerBody") && currentLook.fullBody) {
      toast({
        title: "Atención",
        description: "Al seleccionar esta prenda se eliminará el vestido seleccionado.",
        variant: "warning",
      })

      // Actualizar el look actual
      setCurrentLook({
        ...currentLook,
        fullBody: null,
        [category]: item,
      })

      return
    }

    // Caso normal: actualizar la categoría correspondiente
    setCurrentLook({
      ...currentLook,
      [category]: item,
    })

    toast({
      title: "Prenda seleccionada",
      description: `${item.type} ${item.color} añadida a tu look virtual.`,
      variant: "success",
    })
  }

  // Remover una prenda del look virtual
  const removeItemFromVirtualTryOn = (category: ClothingCategory) => {
    setCurrentLook({
      ...currentLook,
      [category]: null,
    })
  }

  // Filtrar items por categoría activa para el modo de prueba virtual
  const getItemsForActiveCategory = (): ClothingItem[] => {
    // Si la categoría activa es fullBody y ya hay prendas en upperBody o lowerBody, no mostrar prendas completas
    if (activeCategory === "fullBody" && (currentLook.upperBody || currentLook.lowerBody)) {
      return []
    }

    // Si la categoría activa es upperBody o lowerBody y ya hay una prenda completa, no mostrar prendas
    if ((activeCategory === "upperBody" || activeCategory === "lowerBody") && currentLook.fullBody) {
      return []
    }

    // No mostrar la prenda temporal en su propia categoría (ya está seleccionada)
    const category = newItem ? getItemCategory(newItem) : null
    if (category === activeCategory && newItem) {
      return items.filter((item) => {
        const itemCategory = getItemCategory(item)
        return itemCategory === activeCategory
      })
    }

    return items.filter((item) => {
      const itemCategory = getItemCategory(item)
      return itemCategory === activeCategory
    })
  }

  // Generar sugerencias automáticas
  const generateSuggestions = () => {
    if (!newItem) return

    const newItemCategory = getItemCategory(newItem)
    if (!newItemCategory) return

    // Limpiar el look actual excepto la prenda nueva
    const cleanedLook: Record<ClothingCategory, ClothingItem | null> = {
      upperBody: null,
      lowerBody: null,
      fullBody: null,
      outerwear: null,
      footwear: null,
      accessories: null,
    }

    // Mantener la prenda nueva en su categoría
    cleanedLook[newItemCategory] = newItem

    // Filtrar prendas por categoría
    const upperBodyItems =
      newItemCategory !== "upperBody" ? items.filter((item) => CLOTHING_CATEGORIES.upperBody.includes(item.type)) : []
    const lowerBodyItems =
      newItemCategory !== "lowerBody" ? items.filter((item) => CLOTHING_CATEGORIES.lowerBody.includes(item.type)) : []
    const fullBodyItems =
      newItemCategory !== "fullBody" ? items.filter((item) => CLOTHING_CATEGORIES.fullBody.includes(item.type)) : []
    const outerwearItems =
      newItemCategory !== "outerwear"
        ? items.filter((item) => CLOTHING_CATEGORIES.outerwear.includes(item.type) || item.isOuterwear)
        : []
    const footwearItems =
      newItemCategory !== "footwear" ? items.filter((item) => CLOTHING_CATEGORIES.footwear.includes(item.type)) : []
    const accessoriesItems =
      newItemCategory !== "accessories"
        ? items.filter((item) => CLOTHING_CATEGORIES.accessories.includes(item.type))
        : []

    // Si la prenda nueva es una prenda completa, no necesitamos prendas superiores ni inferiores
    if (newItemCategory === "fullBody") {
      // Añadir abrigo si hay disponible
      if (outerwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * outerwearItems.length)
        cleanedLook.outerwear = outerwearItems[randomIndex]
      }

      // Añadir calzado si hay disponible
      if (footwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * footwearItems.length)
        cleanedLook.footwear = footwearItems[randomIndex]
      }

      // Añadir accesorio si hay disponible
      if (accessoriesItems.length > 0 && Math.random() > 0.5) {
        const randomIndex = Math.floor(Math.random() * accessoriesItems.length)
        cleanedLook.accessories = accessoriesItems[randomIndex]
      }
    }
    // Si la prenda nueva es una parte superior, necesitamos una parte inferior
    else if (newItemCategory === "upperBody") {
      // Añadir parte inferior si hay disponible
      if (lowerBodyItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * lowerBodyItems.length)
        cleanedLook.lowerBody = lowerBodyItems[randomIndex]
      }

      // Añadir abrigo si hay disponible
      if (outerwearItems.length > 0 && Math.random() > 0.5) {
        const randomIndex = Math.floor(Math.random() * outerwearItems.length)
        cleanedLook.outerwear = outerwearItems[randomIndex]
      }

      // Añadir calzado si hay disponible
      if (footwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * footwearItems.length)
        cleanedLook.footwear = footwearItems[randomIndex]
      }
    }
    // Si la prenda nueva es una parte inferior, necesitamos una parte superior
    else if (newItemCategory === "lowerBody") {
      // Añadir parte superior si hay disponible
      if (upperBodyItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * upperBodyItems.length)
        cleanedLook.upperBody = upperBodyItems[randomIndex]
      }

      // Añadir abrigo si hay disponible
      if (outerwearItems.length > 0 && Math.random() > 0.5) {
        const randomIndex = Math.floor(Math.random() * outerwearItems.length)
        cleanedLook.outerwear = outerwearItems[randomIndex]
      }

      // Añadir calzado si hay disponible
      if (footwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * footwearItems.length)
        cleanedLook.footwear = footwearItems[randomIndex]
      }
    }
    // Si la prenda nueva es un abrigo, necesitamos una parte superior e inferior o una prenda completa
    else if (newItemCategory === "outerwear") {
      // Decidir si usar prenda completa o conjunto de dos piezas
      const useFullBody = fullBodyItems.length > 0 && Math.random() > 0.7

      if (useFullBody) {
        // Añadir prenda completa
        const randomIndex = Math.floor(Math.random() * fullBodyItems.length)
        cleanedLook.fullBody = fullBodyItems[randomIndex]
      } else {
        // Añadir parte superior si hay disponible
        if (upperBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * upperBodyItems.length)
          cleanedLook.upperBody = upperBodyItems[randomIndex]
        }

        // Añadir parte inferior si hay disponible
        if (lowerBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * lowerBodyItems.length)
          cleanedLook.lowerBody = lowerBodyItems[randomIndex]
        }
      }

      // Añadir calzado si hay disponible
      if (footwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * footwearItems.length)
        cleanedLook.footwear = footwearItems[randomIndex]
      }
    }
    // Si la prenda nueva es calzado, necesitamos una parte superior e inferior o una prenda completa
    else if (newItemCategory === "footwear") {
      // Decidir si usar prenda completa o conjunto de dos piezas
      const useFullBody = fullBodyItems.length > 0 && Math.random() > 0.7

      if (useFullBody) {
        // Añadir prenda completa
        const randomIndex = Math.floor(Math.random() * fullBodyItems.length)
        cleanedLook.fullBody = fullBodyItems[randomIndex]
      } else {
        // Añadir parte superior si hay disponible
        if (upperBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * upperBodyItems.length)
          cleanedLook.upperBody = upperBodyItems[randomIndex]
        }

        // Añadir parte inferior si hay disponible
        if (lowerBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * lowerBodyItems.length)
          cleanedLook.lowerBody = lowerBodyItems[randomIndex]
        }
      }

      // Añadir abrigo si hay disponible
      if (outerwearItems.length > 0 && Math.random() > 0.5) {
        const randomIndex = Math.floor(Math.random() * outerwearItems.length)
        cleanedLook.outerwear = outerwearItems[randomIndex]
      }
    }
    // Si la prenda nueva es un accesorio, necesitamos una parte superior e inferior o una prenda completa
    else if (newItemCategory === "accessories") {
      // Decidir si usar prenda completa o conjunto de dos piezas
      const useFullBody = fullBodyItems.length > 0 && Math.random() > 0.7

      if (useFullBody) {
        // Añadir prenda completa
        const randomIndex = Math.floor(Math.random() * fullBodyItems.length)
        cleanedLook.fullBody = fullBodyItems[randomIndex]
      } else {
        // Añadir parte superior si hay disponible
        if (upperBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * upperBodyItems.length)
          cleanedLook.upperBody = upperBodyItems[randomIndex]
        }

        // Añadir parte inferior si hay disponible
        if (lowerBodyItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * lowerBodyItems.length)
          cleanedLook.lowerBody = lowerBodyItems[randomIndex]
        }
      }

      // Añadir abrigo si hay disponible
      if (outerwearItems.length > 0 && Math.random() > 0.5) {
        const randomIndex = Math.floor(Math.random() * outerwearItems.length)
        cleanedLook.outerwear = outerwearItems[randomIndex]
      }

      // Añadir calzado si hay disponible
      if (footwearItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * footwearItems.length)
        cleanedLook.footwear = footwearItems[randomIndex]
      }
    }

    // Actualizar el look actual
    setCurrentLook(cleanedLook)

    toast({
      title: "¡Sugerencia generada!",
      description: "Hemos creado un look que combina con tu prenda nueva.",
      variant: "success",
    })
  }

  // Renderizar el look virtual
  const renderVirtualLook = () => {
    // Verificar si hay al menos una prenda en el look
    const hasItems = Object.values(currentLook).some((item) => item !== null)

    if (!hasItems) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed h-full">
          <p className="text-muted-foreground text-center">
            Tu look está vacío. Selecciona prendas para visualizar cómo quedarían juntas.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-center">Tu look virtual</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Parte superior o prenda completa */}
          <div className="col-span-2 aspect-square relative bg-white rounded-md overflow-hidden border">
            {currentLook.fullBody ? (
              // Mostrar prenda completa
              <img
                src={currentLook.fullBody.image || "/placeholder.svg"}
                alt={currentLook.fullBody.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : currentLook.upperBody ? (
              // Mostrar parte superior
              <img
                src={currentLook.upperBody.image || "/placeholder.svg"}
                alt={currentLook.upperBody.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin parte superior</p>
              </div>
            )}
          </div>

          {/* Parte inferior (solo si no hay prenda completa) */}
          {!currentLook.fullBody && (
            <div className="col-span-2 aspect-square relative bg-white rounded-md overflow-hidden border">
              {currentLook.lowerBody ? (
                <img
                  src={currentLook.lowerBody.image || "/placeholder.svg"}
                  alt={currentLook.lowerBody.type}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">Sin parte inferior</p>
                </div>
              )}
            </div>
          )}

          {/* Abrigo y calzado */}
          <div className="aspect-square relative bg-white rounded-md overflow-hidden border">
            {currentLook.outerwear ? (
              <img
                src={currentLook.outerwear.image || "/placeholder.svg"}
                alt={currentLook.outerwear.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin abrigo</p>
              </div>
            )}
          </div>

          <div className="aspect-square relative bg-white rounded-md overflow-hidden border">
            {currentLook.footwear ? (
              <img
                src={currentLook.footwear.image || "/placeholder.svg"}
                alt={currentLook.footwear.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin calzado</p>
              </div>
            )}
          </div>

          {/* Accesorios */}
          <div className="col-span-2 aspect-square relative bg-white rounded-md overflow-hidden border">
            {currentLook.accessories ? (
              <img
                src={currentLook.accessories.image || "/placeholder.svg"}
                alt={currentLook.accessories.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin accesorios</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Resetear todo
  const resetAll = () => {
    setImagePreview(null)
    setType("")
    setColor("")
    setIsOuterwear(false)
    setNewItem(null)
    setCurrentLook({
      upperBody: null,
      lowerBody: null,
      fullBody: null,
      outerwear: null,
      footwear: null,
      accessories: null,
    })
    setActiveTab("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Probar antes de comprar</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/gallery">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Mi Armario
            </Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Visualiza cómo quedaría una prenda nueva con tu guardarropa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" disabled={!!newItem}>
                1. Subir prenda
              </TabsTrigger>
              <TabsTrigger value="combine" disabled={!newItem}>
                2. Combinar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div className="space-y-6">
                <div className="grid w-full gap-2">
                  <Label htmlFor="picture">Foto de la prenda que quieres probar</Label>

                  {showCamera ? (
                    // Vista de cámara
                    <div className="relative w-full">
                      <div className="w-full h-64 bg-black rounded-md overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Error en elemento video:", e)
                            setCameraError("Error al inicializar el video.")
                          }}
                        />
                        {isCameraLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <RotateCw className="w-8 h-8 animate-spin text-primary-500 mb-2" />
                            <p className="text-white">Iniciando cámara...</p>
                          </div>
                        )}
                        {cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-4 bg-destructive/10 text-destructive rounded-md max-w-xs text-center">
                              <p className="text-sm font-medium">{cameraError}</p>
                              <p className="text-xs mt-1">
                                Asegúrate de que tu navegador tiene permisos para acceder a la cámara.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="rounded-full shadow-lg"
                          onClick={cancelCapture}
                        >
                          <X className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          className="rounded-full shadow-lg"
                          onClick={capturePhoto}
                          disabled={isCameraLoading}
                        >
                          <Check className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Vista de selección de imagen
                    <div className="flex flex-col items-center gap-4">
                      {imagePreview ? (
                        <div className="relative w-full h-64 overflow-hidden rounded-md">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Vista previa"
                            className="object-contain w-full h-full"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setImagePreview(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-md border-muted-foreground/25">
                          <Camera className="w-10 h-10 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Toma una foto de la prenda que estás considerando comprar
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 w-full justify-center">
                        <Input
                          ref={fileInputRef}
                          id="picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Seleccionar imagen
                        </Button>
                        <Button variant="outline" onClick={startCamera} className="gap-2">
                          <Camera className="w-4 h-4" />
                          Usar cámara
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="type">Tipo de prenda</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remera">Remera</SelectItem>
                        <SelectItem value="camisa">Camisa</SelectItem>
                        <SelectItem value="sweater">Sweater/Buzo</SelectItem>
                        <SelectItem value="jean">Jean</SelectItem>
                        <SelectItem value="pantalon">Pantalón</SelectItem>
                        <SelectItem value="falda">Falda</SelectItem>
                        <SelectItem value="vestido">Vestido</SelectItem>
                        <SelectItem value="campera">Campera</SelectItem>
                        <SelectItem value="tapado">Tapado</SelectItem>
                        <SelectItem value="blazer">Blazer</SelectItem>
                        <SelectItem value="cardigan">Cardigan</SelectItem>
                        <SelectItem value="calzado">Calzado</SelectItem>
                        <SelectItem value="accesorio">Accesorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid w-full gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar el color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="negro">Negro</SelectItem>
                        <SelectItem value="blanco">Blanco</SelectItem>
                        <SelectItem value="gris">Gris</SelectItem>
                        <SelectItem value="azul">Azul</SelectItem>
                        <SelectItem value="rojo">Rojo</SelectItem>
                        <SelectItem value="verde">Verde</SelectItem>
                        <SelectItem value="amarillo">Amarillo</SelectItem>
                        <SelectItem value="rosa">Rosa</SelectItem>
                        <SelectItem value="morado">Morado</SelectItem>
                        <SelectItem value="marron">Marrón</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isOuterwear"
                    checked={isOuterwear}
                    onCheckedChange={(checked) => setIsOuterwear(!!checked)}
                  />
                  <Label
                    htmlFor="isOuterwear"
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ¿Es un abrigo?
                  </Label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={createTemporaryItem} disabled={!imagePreview || !type || !color} className="gap-2">
                    Continuar a combinar
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="combine" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Panel izquierdo: Categorías y prendas */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Selecciona prendas para combinar</h3>
                    <Button variant="outline" size="sm" onClick={generateSuggestions} className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Sugerir combinación
                    </Button>
                  </div>

                  <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ClothingCategory)}>
                    <TabsList className="grid grid-cols-3 md:grid-cols-6">
                      <TabsTrigger value="upperBody">Parte superior</TabsTrigger>
                      <TabsTrigger value="lowerBody">Parte inferior</TabsTrigger>
                      <TabsTrigger value="fullBody">Vestidos</TabsTrigger>
                      <TabsTrigger value="outerwear">Abrigos</TabsTrigger>
                      <TabsTrigger value="footwear">Calzado</TabsTrigger>
                      <TabsTrigger value="accessories">Accesorios</TabsTrigger>
                    </TabsList>

                    {Object.entries(CLOTHING_CATEGORIES).map(([category, _]) => (
                      <TabsContent key={category} value={category} className="mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {/* Mostrar la prenda nueva si pertenece a esta categoría */}
                          {newItem && getItemCategory(newItem) === category && (
                            <Card
                              key={newItem.id}
                              className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all ring-2 ring-primary-500 relative"
                            >
                              <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1 z-10">
                                Nueva
                              </div>
                              <div className="relative w-full aspect-square">
                                <img
                                  src={newItem.image || "/placeholder.svg"}
                                  alt={newItem.type}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <CardContent className="p-2">
                                <p className="text-sm font-medium capitalize truncate">
                                  {newItem.type} {newItem.color}
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Mostrar las prendas existentes de esta categoría */}
                          {getItemsForActiveCategory().map((item) => (
                            <Card
                              key={item.id}
                              className={`overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all ${
                                currentLook[category as ClothingCategory]?.id === item.id
                                  ? "ring-2 ring-primary-500"
                                  : ""
                              }`}
                              onClick={() => selectItemForVirtualTryOn(item)}
                            >
                              <div className="relative w-full aspect-square">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.type}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <CardContent className="p-2">
                                <p className="text-sm font-medium capitalize truncate">
                                  {item.type} {item.color}
                                </p>
                              </CardContent>
                            </Card>
                          ))}

                          {getItemsForActiveCategory().length === 0 && !newItem && (
                            <div className="col-span-full p-8 text-center">
                              <p className="text-muted-foreground">
                                {activeCategory === "fullBody" && (currentLook.upperBody || currentLook.lowerBody)
                                  ? "No puedes seleccionar un vestido si ya tienes prendas superiores o inferiores seleccionadas."
                                  : (activeCategory === "upperBody" || activeCategory === "lowerBody") &&
                                      currentLook.fullBody
                                    ? "No puedes seleccionar esta categoría si ya tienes un vestido seleccionado."
                                    : "No hay prendas disponibles en esta categoría."}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                {/* Panel derecho: Visualización del look */}
                <div className="space-y-4">
                  {renderVirtualLook()}

                  {/* Selección actual */}
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium">Prendas seleccionadas:</h3>
                    <div className="space-y-1">
                      {Object.entries(currentLook).map(([category, item]) => (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span>{CATEGORY_NAMES[category as ClothingCategory]}:</span>
                          {item ? (
                            <div className="flex items-center gap-2">
                              <span className="capitalize">
                                {item.type} {item.color}
                              </span>
                              {item.id !== newItem?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeItemFromVirtualTryOn(category as ClothingCategory)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No seleccionada</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => setShowOutfitVisualization(true)} variant="default" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    Ver conjunto completo
                  </Button>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetAll} className="gap-2">
                  <X className="h-4 w-4" />
                  Empezar de nuevo
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="bg-muted p-4 rounded-md w-full">
            <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Toma una foto o sube una imagen de la prenda que estás considerando comprar</li>
              <li>Selecciona el tipo y color de la prenda</li>
              <li>Combínala con otras prendas de tu guardarropa para ver cómo quedaría</li>
              <li>Usa la función "Sugerir combinación" para obtener ideas automáticas</li>
            </ol>
          </div>
        </CardFooter>
      </Card>

      <OutfitVisualization
        items={Object.values(currentLook).filter((item): item is ClothingItem => item !== null)}
        isOpen={showOutfitVisualization}
        onClose={() => setShowOutfitVisualization(false)}
      />
      <Toaster />
    </div>
  )
}
