"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Importar Tooltip
import { ArinChat } from "@/components/arin-chat"
import { COLORS } from "@/lib/color-config"
import { findClosestColor } from "@/lib/color-utils"
import type { ClothingItem } from "@/types/ClothingItem"

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const clothingTypes = [
  {
    group: "Parte superior",
    items: ["Remera", "Blusa", "Camisa", "Top", "Musculosa", "Sweater / Buzo", "Campera / Abrigo", "Chaleco"],
  },
  { group: "Parte inferior", items: ["Pantalón", "Jean", "Short", "Falda / Pollera"] },
  { group: "Prendas de una pieza", items: ["Vestido", "Enterito / Mono"] },
  { group: "Calzado", items: ["Zapatillas", "Zapatos", "Sandalias", "Botas"] },
  { group: "Accesorios", items: ["Gorro / Gorra", "Bufanda", "Cinturón", "Bolso / Mochila / Cartera"] },
]

const climateOptions = ["Calor", "Frío", "Intermedio / entretiempo"]

const occasionOptions = [
  "Para el día a día / uso casual",
  "Para trabajar",
  "Para salidas informales",
  "Para salidas formales",
  "Para hacer deporte",
]

// Lista de los 15 materiales más usados en la industria textil
const materialOptions = [
  "Algodón",
  "Poliéster",
  "Lana",
  "Viscosa",
  "Nylon",
  "Lino",
  "Seda",
  "Elastano / Spandex",
  "Acrílico",
  "Rayón",
  "Denim", // Aunque es un tejido, se usa comúnmente como material
  "Cuero",
  "Cuero Ecológico / Vegano",
  "Cachemira",
  "Modal",
]

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [cameraImage, setCameraImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [category, setCategory] = useState("")
  const [color, setColor] = useState("")
  const [climate, setClimate] = useState("")
  const [occasion, setOccasion] = useState("")
  const [material, setMaterial] = useState("") // Estado para material
  const [showCamera, setShowCamera] = useState(false)
  const cameraRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function setupCamera() {
      if (cameraRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })
          cameraRef.current.srcObject = stream
        } catch (error) {
          console.error("Error al acceder a la cámara:", error)
          toast({
            title: "Error",
            description: "Error al acceder a la cámara. Por favor, revisa los permisos.",
            variant: "destructive",
          })
          setShowCamera(false)
        }
      }
    }

    if (showCamera) {
      setupCamera()
    }

    return () => {
      if (cameraRef.current && cameraRef.current.srcObject) {
        const stream = cameraRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [showCamera, toast])

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El tamaño de la imagen debe ser menor a 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      const compressedFile = await compressImage(file, 0.7)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error("Error al comprimir la imagen:", error)
      toast({
        title: "Error",
        description: "Error al procesar la imagen. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const compressImage = (file: File, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0, img.width, img.height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: file.lastModified,
                })
                resolve(compressedFile)
              } else {
                reject(new Error("Fallo al comprimir la imagen"))
              }
            },
            "image/jpeg",
            quality,
          )
        }
        img.onerror = (error) => {
          reject(error)
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  const handleCapture = () => {
    if (cameraRef.current && canvasRef.current) {
      const video = cameraRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const dataUrl = canvas.toDataURL("image/jpeg")
      setCameraImage(dataUrl)
      setImage(dataUrl)
      setShowCamera(false)
    }
  }

  const handleUpload = async () => {
    if (!image) {
      toast({
        title: "Error",
        description: "Por favor, selecciona o captura una imagen.",
        variant: "destructive",
      })
      return
    }

    if (!category || !color || !climate || !occasion) {
      toast({
        title: "Error",
        description: "Por favor, completa los campos obligatorios (categoría, color, clima y ocasión).",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const newClothingItem: ClothingItem = {
        id: Date.now().toString(),
        image: image,
        type: category,
        color: color,
        occasion: occasion
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/á/g, "a")
          .replace(/é/g, "e")
          .replace(/í/g, "i")
          .replace(/ó/g, "o")
          .replace(/ú/g, "u")
          .replace(/\//g, ""),
        climate: climate
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/á/g, "a")
          .replace(/é/g, "e")
          .replace(/í/g, "i")
          .replace(/ó/g, "o")
          .replace(/ú/g, "u")
          .replace(/\//g, ""),
        isOuterwear: category.includes("Campera") || category.includes("Abrigo") || category.includes("Chaleco"),
        ...(material && { material }), // Añadir material solo si no está vacío
      }

      const existingItems = localStorage.getItem("clothingItems")
      const items: ClothingItem[] = existingItems ? JSON.parse(existingItems) : []

      items.push(newClothingItem)
      localStorage.setItem("clothingItems", JSON.stringify(items))

      toast({
        title: "Éxito",
        description: "¡Prenda subida exitosamente!",
      })

      setImage(null)
      setCameraImage(null)
      setCategory("")
      setColor("")
      setClimate("")
      setOccasion("")
      setMaterial("")

      router.push("/armario")
    } catch (error: any) {
      console.error("Error al subir la imagen:", error)
      toast({
        title: "Error",
        description: error.message || "Fallo al subir la prenda.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Subir Prenda</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Detalles de la Prenda</CardTitle>
          <CardDescription>Ingresa los detalles de la prenda que quieres subir.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {clothingTypes.map((group, index) => (
                  <div key={index}>
                    <p className="px-2 py-1 text-sm font-semibold text-muted-foreground">{group.group}</p>
                    {group.items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input
              type="color"
              id="color"
              value={color}
              onChange={(e) => {
                const selectedColor = e.target.value
                setColor(selectedColor)
              }}
            />
            {color && (
              <Badge variant="secondary">
                Color más cercano: {findClosestColor(color, COLORS).name || "Desconocido"}
              </Badge>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="climate">Clima</Label>
            <Select onValueChange={setClimate} value={climate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un clima" />
              </SelectTrigger>
              <SelectContent>
                {climateOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="occasion">Ocasión</Label>
            <Select onValueChange={setOccasion} value={occasion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ocasión" />
              </SelectTrigger>
              <SelectContent>
                {occasionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo opcional para Material con Select y Tooltip */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="material">
              Material (opcional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 ml-1 inline-block"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="16" />
                      <line x1="8" x2="16" y1="12" y2="12" />
                    </svg>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Si la prenda tiene varios materiales, selecciona el que tenga mayor porcentaje. Por ejemplo, si es
                    60% Poliéster y 40% Nylon, elige Poliéster.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select onValueChange={setMaterial} value={material}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el material principal" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="image">Imagen</Label>
            {image ? (
              <div className="relative w-full h-64 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image || "/placeholder.svg"} alt="Prenda Subida" className="object-cover w-full h-full" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null)
                    setCameraImage(null)
                  }}
                >
                  Eliminar
                </Button>
              </div>
            ) : (
              <>
                <Input type="file" id="image" onChange={handleImageChange} />
                <Button onClick={() => setShowCamera(true)}>Abrir Cámara</Button>
              </>
            )}
          </div>

          {showCamera && (
            <div className="relative">
              <video ref={cameraRef} autoPlay playsInline className="w-full h-64 object-cover rounded-md"></video>
              <canvas ref={canvasRef} style={{ display: "none" }} width="0" height="0"></canvas>
              <div className="absolute top-2 left-2 flex space-x-2">
                <Button variant="secondary" onClick={() => setShowCamera(false)}>
                  Cerrar Cámara
                </Button>
                <Button variant="outline" onClick={handleCapture}>
                  Capturar
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-md">
                <p className="text-sm">
                  Posiciona la prenda dentro del encuadre. Asegura buena iluminación para mejores resultados.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? "Subiendo..." : "Subir Prenda"}
          </Button>
        </CardFooter>
        {uploading && <Progress value={uploadProgress} className="mt-2" />}
      </Card>

      <ArinChat />
    </div>
  )
}
