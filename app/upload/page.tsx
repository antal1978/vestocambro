"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Save, X, RotateCw, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
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

export default function UploadPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [type, setType] = useState("")
  const [color, setColor] = useState("")
  const [occasion, setOccasion] = useState("")
  const [climate, setClimate] = useState("")
  const [isOuterwear, setIsOuterwear] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Verificar compatibilidad del navegador al cargar
  useEffect(() => {
    // Verificar si el navegador soporta la API MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Este navegador no soporta la API MediaDevices")
      setCameraError("Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari recientes.")
    }
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // Limpiar el stream de la cámara cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Función mejorada para iniciar la cámara
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
        console.log("Solicitando acceso a la cámara...")

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

        console.log("Acceso a la cámara concedido:", stream)

        // Verificar nuevamente que el elemento de video existe
        if (!videoRef.current) {
          throw new Error("Elemento de video no disponible después de obtener el stream.")
        }

        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata cargada, reproduciendo...")
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
    }, 100) // Pequeño retraso para asegurar que el componente se ha renderizado
  }

  // Función para tomar la foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Referencias no disponibles para capturar foto")
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
        console.warn("El video no está listo para capturar", video.readyState)
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

      console.log(`Capturando foto: ${canvas.width}x${canvas.height}`)

      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext("2d")
      if (!context) {
        console.error("No se pudo obtener el contexto 2D del canvas")
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

  // Función para guardar la prenda
  const handleSave = () => {
    if (!imagePreview || !type || !color || !occasion || !climate) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    // Activar indicador de carga
    setIsSaving(true)

    // Simular un pequeño retraso para que el usuario perciba que algo está sucediendo
    setTimeout(() => {
      try {
        // Get existing items from localStorage
        const existingItems = localStorage.getItem("clothingItems")
        const items: ClothingItem[] = existingItems ? JSON.parse(existingItems) : []

        // Add new item
        const newItem: ClothingItem = {
          id: Date.now().toString(),
          image: imagePreview,
          type,
          color,
          occasion,
          climate,
          isOuterwear,
        }

        // Save to localStorage
        localStorage.setItem("clothingItems", JSON.stringify([...items, newItem]))

        // Show success message with more visible styling
        toast({
          title: "¡Prenda guardada correctamente!",
          description: `Tu ${type} ${color} ha sido añadida a tu guardarropa`,
          variant: "success", // Usar variante de éxito para destacar más
        })

        // Reset form
        setImagePreview(null)
        setType("")
        setColor("")
        setOccasion("")
        setClimate("")
        setIsOuterwear(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (error) {
        console.error("Error al guardar:", error)
        toast({
          title: "Error al guardar",
          description: "Ocurrió un problema al guardar la prenda. Intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }, 600) // Pequeño retraso para mejor experiencia de usuario
  }

  return (
    <div className="container max-w-md py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-center">Añadir Nueva Prenda</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la prenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="picture">Foto de la prenda</Label>

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
                  <Button variant="destructive" size="icon" className="rounded-full shadow-lg" onClick={cancelCapture}>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    <p className="text-sm text-muted-foreground">Selecciona una imagen o toma una foto</p>
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

          <div className="grid w-full gap-2">
            <Label htmlFor="type">Tipo de prenda</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camiseta">Camiseta</SelectItem>
                <SelectItem value="camisa">Camisa</SelectItem>
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

          <div className="grid w-full gap-2">
            <Label htmlFor="occasion">Ocasión</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar la ocasión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="deporte">Deporte</SelectItem>
                <SelectItem value="fiesta">Fiesta</SelectItem>
                <SelectItem value="homewear">En casa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="climate">Clima</Label>
            <Select value={climate} onValueChange={setClimate}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar el clima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caluroso">Caluroso</SelectItem>
                <SelectItem value="templado">Templado</SelectItem>
                <SelectItem value="frio">Frío</SelectItem>
                <SelectItem value="todo-clima">Todo clima</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isOuterwear" checked={isOuterwear} onCheckedChange={(checked) => setIsOuterwear(!!checked)} />
            <Label
              htmlFor="isOuterwear"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ¿Es un abrigo?
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/gallery">
            <Button variant="outline">Ver galería</Button>
          </Link>
          <Button onClick={handleSave} className="gap-2" disabled={!imagePreview || isSaving}>
            {isSaving ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar prenda
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
