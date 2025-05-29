"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ColorPicker } from "@/components/color-picker"

interface ClothingFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export function ClothingForm({ onSubmit, onCancel }: ClothingFormProps) {
  const [image, setImage] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [type, setType] = useState("")
  const [color, setColor] = useState("")
  const [occasion, setOccasion] = useState("dia-casual")
  const [climate, setClimate] = useState("templado")
  const [isOuterwear, setIsOuterwear] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const videoRef = useState<HTMLVideoElement | null>(null)
  const canvasRef = useState<HTMLCanvasElement | null>(null)
  const [texture, setTexture] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setVideoStream(stream)
      if (videoRef[0]) {
        videoRef[0].srcObject = stream
      }
      setShowCamera(true)
    } catch (err) {
      toast({
        title: "Error al acceder a la cámara",
        description: "Por favor, asegúrate de dar permisos de cámara a la aplicación.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef[0] && canvasRef[0]) {
      const video = videoRef[0]
      const canvas = canvasRef[0]
      const context = canvas.getContext("2d")

      // Establecer dimensiones del canvas al tamaño del video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Dibujar el frame actual del video en el canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir el canvas a una imagen base64
      const imageDataUrl = canvas.toDataURL("image/jpeg")
      setImage(imageDataUrl)

      // Detener la cámara
      stopCamera()
    }
  }

  const removeImage = () => {
    setImage(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) {
      toast({
        title: "Imagen requerida",
        description: "Por favor, sube o toma una foto de tu prenda.",
        variant: "destructive",
      })
      return
    }

    if (!type) {
      toast({
        title: "Tipo requerido",
        description: "Por favor, selecciona el tipo de prenda.",
        variant: "destructive",
      })
      return
    }

    if (!color) {
      toast({
        title: "Color requerido",
        description: "Por favor, selecciona el color de la prenda.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Crear un objeto con los datos de la prenda
    const clothingItem = {
      id: Date.now().toString(),
      image,
      type,
      color,
      occasion,
      climate,
      isOuterwear,
      texture,
      dateAdded: new Date().toISOString(),
    }

    // Guardar en localStorage
    const storedItems = localStorage.getItem("clothingItems")
    const items = storedItems ? JSON.parse(storedItems) : []
    localStorage.setItem("clothingItems", JSON.stringify([...items, clothingItem]))

    // Mostrar toast de éxito
    toast({
      title: "Prenda guardada",
      description: "Tu prenda ha sido añadida a tu armario.",
      variant: "success",
    })

    // Llamar al callback onSubmit si existe
    if (onSubmit) {
      onSubmit(clothingItem)
    }

    // Redirigir a la galería
    setTimeout(() => {
      setIsUploading(false)
      router.push("/gallery")
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de imagen */}
      <div className="space-y-2">
        <Label>Foto de la prenda</Label>

        {showCamera ? (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              <video ref={(el) => (videoRef[0] = el)} autoPlay playsInline className="h-full w-full object-cover" />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancelar
              </Button>
              <Button type="button" onClick={capturePhoto}>
                Tomar foto
              </Button>
            </div>
            <canvas ref={(el) => (canvasRef[0] = el)} className="hidden" />
          </div>
        ) : image ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image || "/placeholder.svg"} alt="Prenda" className="h-full w-full object-contain" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent
                className="flex flex-col items-center justify-center p-6"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Subir foto</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF</p>
                <Input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6" onClick={startCamera}>
                <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Tomar foto</p>
                <p className="text-xs text-muted-foreground mt-1">Usar cámara</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tipo de prenda */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de prenda</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {/* Parte superior */}
            <SelectItem value="remera">Remera</SelectItem>
            <SelectItem value="blusa">Blusa</SelectItem>
            <SelectItem value="camisa">Camisa</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="musculosa">Musculosa</SelectItem>
            <SelectItem value="sweater">Sweater / Buzo</SelectItem>
            <SelectItem value="campera">Campera / Abrigo</SelectItem>
            <SelectItem value="chaleco">Chaleco</SelectItem>

            {/* Parte inferior */}
            <SelectItem value="pantalon">Pantalón</SelectItem>
            <SelectItem value="jean">Jean</SelectItem>
            <SelectItem value="short">Short</SelectItem>
            <SelectItem value="falda">Falda / Pollera</SelectItem>

            {/* Prendas de una pieza */}
            <SelectItem value="vestido">Vestido</SelectItem>
            <SelectItem value="enterito">Enterito / Mono</SelectItem>

            {/* Calzado */}
            <SelectItem value="zapatillas">Zapatillas</SelectItem>
            <SelectItem value="zapatos">Zapatos</SelectItem>
            <SelectItem value="sandalias">Sandalias</SelectItem>
            <SelectItem value="botas">Botas</SelectItem>

            {/* Accesorios */}
            <SelectItem value="gorro">Gorro / Sombrero</SelectItem>
            <SelectItem value="bufanda">Bufanda</SelectItem>
            <SelectItem value="cinturon">Cinturón</SelectItem>
            <SelectItem value="bolso">Bolso / Mochila / Cartera</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <ColorPicker value={color} onChange={setColor} placeholder="Seleccionar color" />
      </div>

      {/* Ocasión */}
      <div className="space-y-2">
        <Label htmlFor="occasion">Ocasión</Label>
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger id="occasion">
            <SelectValue placeholder="Seleccionar ocasión" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia-casual">Para el día a día / uso casual</SelectItem>
            <SelectItem value="trabajo">Para trabajar</SelectItem>
            <SelectItem value="salidas-informales">Para salidas informales</SelectItem>
            <SelectItem value="salidas-formales">Para salidas formales</SelectItem>
            <SelectItem value="deporte">Para hacer deporte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Textura / Estampado */}
      <div className="space-y-2">
        <Label htmlFor="texture">Textura / Estampado (opcional)</Label>
        <Select value={texture} onValueChange={setTexture}>
          <SelectTrigger id="texture">
            <SelectValue placeholder="Seleccionar textura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="liso">Liso</SelectItem>
            <SelectItem value="estampado">Estampado</SelectItem>
            <SelectItem value="rayas">Rayas</SelectItem>
            <SelectItem value="cuadros">Cuadros</SelectItem>
            <SelectItem value="flores">Flores</SelectItem>
            <SelectItem value="geometrico">Geométrico</SelectItem>
            <SelectItem value="animal-print">Animal print</SelectItem>
            <SelectItem value="texturizado">Texturizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clima */}
      <div className="space-y-2">
        <Label htmlFor="climate">Clima</Label>
        <Select value={climate} onValueChange={setClimate}>
          <SelectTrigger id="climate">
            <SelectValue placeholder="Seleccionar clima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calido">Calor</SelectItem>
            <SelectItem value="templado">Templado</SelectItem>
            <SelectItem value="frio">Frío</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Abrigo exterior */}
      {(type === "campera" || type === "chaleco") && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isOuterwear"
            checked={isOuterwear}
            onChange={(e) => setIsOuterwear(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isOuterwear" className="text-sm">
            Es una prenda de abrigo exterior
          </Label>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isUploading} className="flex-1">
          {isUploading ? "Guardando..." : "Guardar prenda"}
        </Button>
      </div>
    </form>
  )
}
