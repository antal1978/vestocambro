"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Save, X, RotateCw, Info, Crop, FlipHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ColorPicker } from "@/components/color-picker"

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
  const [showGuides, setShowGuides] = useState(true)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [showInstructions, setShowInstructions] = useState(true)

  // Verificar compatibilidad del navegador al cargar
  useEffect(() => {
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari recientes.")
      toast({
        title: "Navegador no compatible",
        description: "Tu navegador no soporta el acceso a la cámara.",
        variant: "destructive",
      })
      return
    }

    setShowCamera(true)
    setIsCameraLoading(true)
    setCameraError(null)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setTimeout(async () => {
      try {
        console.log("Solicitando acceso a la cámara...")

        if (!videoRef.current) {
          throw new Error("Elemento de video no disponible. Intenta de nuevo.")
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
        })

        console.log("Acceso a la cámara concedido:", stream)

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

  // Función para cambiar entre cámara frontal y trasera
  const switchCamera = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    // Reiniciar la cámara con la nueva configuración
    if (showCamera) {
      cancelCapture()
      setTimeout(() => {
        startCamera()
      }, 100)
    }
  }

  // Función mejorada para tomar la foto
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

      if (video.readyState !== 4) {
        toast({
          title: "Espera un momento",
          description: "La cámara aún se está inicializando.",
          variant: "warning",
        })
        return
      }

      // Configurar canvas con las dimensiones originales del video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      // Mantener la proporción original
      canvas.width = videoWidth
      canvas.height = videoHeight

      console.log(`Capturando foto: ${canvas.width}x${canvas.height}`)

      const context = canvas.getContext("2d")
      if (!context) {
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen.",
          variant: "destructive",
        })
        return
      }

      // Fondo blanco para mejor contraste
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar la imagen completa sin recortar
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92)

        compressImage(imageDataUrl, 1000, 0.9)
          .then((compressedImage) => {
            setImagePreview(compressedImage)
            setShowCamera(false)

            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
              streamRef.current = null
            }

            toast({
              title: "¡Foto capturada!",
              description: "La foto se ha tomado correctamente. Puedes continuar completando los detalles.",
              variant: "success",
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

  // Función mejorada para procesar la imagen manteniendo la integridad visual
  const compressImage = (dataUrl: string, maxWidth = 1000, quality = 0.92): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
        const aspectRatio = width / height

        // Redimensionar si es necesario, manteniendo la proporción exacta
        if (width > maxWidth) {
          width = maxWidth
          height = Math.round(width / aspectRatio)
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Fondo blanco para asegurar consistencia
          ctx.fillStyle = "#FFFFFF"
          ctx.fillRect(0, 0, width, height)

          // Dibujar la imagen manteniendo la proporción original
          ctx.drawImage(img, 0, 0, width, height)

          // Comprimir con alta calidad
          resolve(canvas.toDataURL("image/jpeg", quality))
        } else {
          resolve(dataUrl) // Fallback si no se puede comprimir
        }
      }
    })
  }

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
        compressImage(result).then((compressedImage) => {
          setImagePreview(compressedImage)
          toast({
            title: "Imagen cargada",
            description: "La imagen se ha cargado correctamente.",
            variant: "success",
          })
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!imagePreview || !type || !color || !occasion || !climate) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    setTimeout(() => {
      try {
        const existingItems = localStorage.getItem("clothingItems")
        const items: ClothingItem[] = existingItems ? JSON.parse(existingItems) : []

        const newItem: ClothingItem = {
          id: Date.now().toString(),
          image: imagePreview,
          type,
          color,
          occasion,
          climate,
          isOuterwear,
        }

        localStorage.setItem("clothingItems", JSON.stringify([...items, newItem]))

        toast({
          title: "¡Prenda guardada correctamente!",
          description: `Tu ${type} ${color} ha sido añadida a tu armario`,
          variant: "success",
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
    }, 600)
  }

  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative ml-1 group">
      <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">
        ?
      </div>
      <div className="absolute z-10 invisible p-2 text-xs text-left text-white transition-all transform -translate-x-1/2 translate-y-2 bg-gray-800 rounded-md opacity-0 w-60 group-hover:visible group-hover:opacity-100 left-1/2 bottom-full">
        {text}
      </div>
    </div>
  )

  return (
    <div className="container max-w-md py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-center">Añadir Nueva Prenda</h1>

      {/* Instrucciones mejoradas */}
      {showInstructions && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">Consejos para mejores fotos:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Coloca la prenda sobre una superficie plana y clara</li>
                <li>• Asegúrate de tener buena iluminación</li>
                <li>• Centra la prenda en el recuadro guía</li>
                <li>• Evita sombras y reflejos</li>
              </ul>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false)}
                className="text-blue-600 p-0 h-auto"
              >
                Ocultar consejos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la prenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="picture">Foto de la prenda</Label>

            {showCamera ? (
              <div className="relative w-full">
                <div className="w-full bg-black rounded-md overflow-hidden relative">
                  <div className="pb-[100%] relative">
                    {" "}
                    {/* Proporción cuadrada */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Error en elemento video:", e)
                        setCameraError("Error al inicializar el video.")
                      }}
                    />
                    {/* Guías de encuadre mejoradas */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Marco principal */}
                        <div className="absolute inset-4 border-2 border-white/70 rounded-lg">
                          {/* Líneas de guía en las esquinas */}
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg"></div>

                          {/* Líneas centrales */}
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 transform -translate-y-0.5"></div>
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 transform -translate-x-0.5"></div>
                        </div>

                        {/* Texto de ayuda */}
                        <div className="absolute bottom-20 left-0 right-0 text-center">
                          <div className="bg-black/70 text-white text-sm px-3 py-1 rounded-full mx-auto inline-block">
                            Centra tu prenda en el recuadro
                          </div>
                        </div>
                      </div>
                    )}
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

                  {/* Controles de cámara mejorados */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                    {/* Botón para cambiar cámara */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full shadow-lg bg-white/90 hover:bg-white"
                      onClick={switchCamera}
                      disabled={isCameraLoading}
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </Button>

                    {/* Botón cancelar */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full shadow-lg"
                      onClick={cancelCapture}
                    >
                      <X className="w-6 h-6" />
                    </Button>

                    {/* Botón capturar */}
                    <Button
                      variant="default"
                      size="icon"
                      className="rounded-full shadow-lg w-16 h-16"
                      onClick={capturePhoto}
                      disabled={isCameraLoading}
                    >
                      <Camera className="w-8 h-8" />
                    </Button>

                    {/* Botón toggle guías */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full shadow-lg bg-white/90 hover:bg-white"
                      onClick={() => setShowGuides(!showGuides)}
                    >
                      <Crop className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-full aspect-square overflow-hidden rounded-md border-2 border-dashed border-gray-300">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      className="object-cover w-full h-full"
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
                  <div className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-md border-muted-foreground/25 bg-muted/10">
                    <Camera className="w-12 h-12 mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      Toma una foto o selecciona una imagen
                    </p>
                    <p className="text-xs text-muted-foreground/70 text-center">Recomendado: formato cuadrado</p>
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
            <Label htmlFor="type">Tipo de prenda *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remera">Remera</SelectItem>
                <SelectItem value="camisa">Camisa</SelectItem>
                <SelectItem value="blusa">Blusa</SelectItem>
                <SelectItem value="sweater">Sweater/Buzo</SelectItem>
                <SelectItem value="cardigan">Cardigan</SelectItem>
                <SelectItem value="chaleco">Chaleco</SelectItem>
                <SelectItem value="jean">Jean</SelectItem>
                <SelectItem value="pantalon">Pantalón</SelectItem>
                <SelectItem value="falda">Falda</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="vestido">Vestido</SelectItem>
                <SelectItem value="mono">Mono/Jumpsuit</SelectItem>
                <SelectItem value="campera">Campera</SelectItem>
                <SelectItem value="tapado">Tapado</SelectItem>
                <SelectItem value="blazer">Blazer</SelectItem>
                <SelectItem value="abrigo">Abrigo</SelectItem>
                <SelectItem value="calzado">Calzado</SelectItem>
                <SelectItem value="bufanda">Bufanda</SelectItem>
                <SelectItem value="gorra">Gorra</SelectItem>
                <SelectItem value="gorro">Gorro</SelectItem>
                <SelectItem value="cartera">Cartera</SelectItem>
                <SelectItem value="cinturon">Cinturón</SelectItem>
                <SelectItem value="guantes">Guantes</SelectItem>
                <SelectItem value="accesorio">Otro accesorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-2">
            <div className="flex items-center">
              <Label htmlFor="color">Color *</Label>
              <InfoTooltip text="Si la prenda es estampada o tiene mezcla de colores, selecciona el color que predomina. Esto ayudará a la app a generar combinaciones más armoniosas." />
            </div>
            <ColorPicker value={color} onChange={setColor} placeholder="Seleccionar el color" />
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="occasion">Ocasión *</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar la ocasión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="deporte">Deporte</SelectItem>
                <SelectItem value="night-out">Night out</SelectItem>
                <SelectItem value="homewear">En casa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="climate">Clima *</Label>
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

          <div className="flex flex-col space-y-2">
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
              <InfoTooltip text="Marca esta opción si la prenda es para abrigarse (camperas, tapados, sweaters gruesos, etc.). Esto ayuda a la app a generar looks más adecuados según el clima seleccionado." />
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Las prendas marcadas como abrigo se utilizarán principalmente en climas fríos o templados.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/gallery">
            <Button variant="outline">Ver Mi Armario</Button>
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
