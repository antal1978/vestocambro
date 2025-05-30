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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArinChat } from "@/components/arin-chat"

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const categories = [
  "Tops",
  "T-Shirts",
  "Shirts",
  "Blouses",
  "Knitwear",
  "Sweaters",
  "Cardigans",
  "Jackets",
  "Coats",
  "Blazers",
  "Dresses",
  "Skirts",
  "Pants",
  "Jeans",
  "Shorts",
  "Jumpsuits",
  "Suits",
  "Underwear",
  "Socks",
  "Swimwear",
  "Lingerie",
  "Loungewear",
  "Activewear",
  "Shoes",
  "Accessories",
  "Bags",
  "Jewelry",
  "Hats",
  "Scarves",
  "Gloves",
  "Belts",
  "Wallets",
  "Sunglasses",
  "Watches",
]

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
    : null
}

function calculateColorDifference(color1: [number, number, number], color2: [number, number, number]): number {
  const [r1, g1, b1] = color1
  const [r2, g2, b2] = color2
  return Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2)
}

function findClosestColor(inputColor: string, colors: { name: string; hex: string }[]): { name: string; hex: string } {
  const rgbInput = hexToRgb(inputColor)
  if (!rgbInput) {
    return { name: "Unknown", hex: "#000000" }
  }

  let closestColor = colors[0]
  let minDifference = Number.POSITIVE_INFINITY

  for (const color of colors) {
    const rgbColor = hexToRgb(color.hex)
    if (rgbColor) {
      const difference = calculateColorDifference(rgbInput, rgbColor)
      if (difference < minDifference) {
        minDifference = difference
        closestColor = color
      }
    }
  }

  return closestColor
}

const colors = [
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Maroon", hex: "#800000" },
  { name: "Olive", hex: "#808000" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Teal", hex: "#008080" },
  { name: "Navy", hex: "#000080" },
  { name: "Fuchsia", hex: "#FF00FF" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Lavender", hex: "#E6E6FA" },
]

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [cameraImage, setCameraImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [category, setCategory] = useState("")
  const [color, setColor] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [name, setName] = useState("")
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
          console.error("Error accessing camera:", error)
          toast({
            title: "Error",
            description: "Error accessing camera. Please check permissions.",
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
        description: "Image size must be less than 5MB.",
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
      console.error("Error compressing image:", error)
      toast({
        title: "Error",
        description: "Error processing image. Please try again.",
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
                reject(new Error("Failed to compress image"))
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
        description: "Please select or capture an image.",
        variant: "destructive",
      })
      return
    }

    if (!name || !description || !price || !category || !color) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Guardar en localStorage en lugar de Cloudinary
      const productData = {
        id: Date.now().toString(),
        name,
        description,
        price: Number.parseFloat(price),
        category,
        color,
        imageUrl: image, // Usar la imagen base64 directamente
        dateAdded: new Date().toISOString(),
      }

      // Obtener productos existentes
      const existingProducts = localStorage.getItem("clothingItems")
      const products = existingProducts ? JSON.parse(existingProducts) : []

      // Agregar nuevo producto
      products.push(productData)
      localStorage.setItem("clothingItems", JSON.stringify(products))

      toast({
        title: "Success",
        description: "Product uploaded successfully!",
      })

      // Limpiar formulario
      setImage(null)
      setCameraImage(null)
      setName("")
      setDescription("")
      setPrice("")
      setCategory("")
      setColor("")

      router.push("/gallery")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload product.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Upload a Garment</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Garment Details</CardTitle>
          <CardDescription>Enter the details of the garment you want to upload.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Garment Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Garment Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              placeholder="Garment Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="color">
              Color
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
                  <TooltipContent>
                    The color of the garment. We'll try to match it to the closest named color.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
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
              <Badge variant="secondary">Closest Color: {findClosestColor(color, colors).name || "Unknown"}</Badge>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="image">Image</Label>
            {image ? (
              <div className="relative w-full h-64 rounded-md overflow-hidden">
                <img src={image || "/placeholder.svg"} alt="Uploaded Garment" className="object-cover w-full h-full" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null)
                    setCameraImage(null)
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Input type="file" id="image" onChange={handleImageChange} />
                <Button onClick={() => setShowCamera(true)}>Open Camera</Button>
              </>
            )}
          </div>

          {showCamera && (
            <div className="relative">
              <video ref={cameraRef} autoPlay playsInline className="w-full h-64 object-cover rounded-md"></video>
              <canvas ref={canvasRef} style={{ display: "none" }} width="0" height="0"></canvas>
              <div className="absolute top-2 left-2 flex space-x-2">
                <Button variant="secondary" onClick={() => setShowCamera(false)}>
                  Close Camera
                </Button>
                <Button variant="outline" onClick={handleCapture}>
                  Capture
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-md">
                <p className="text-sm">Position the garment within the frame. Ensure good lighting for best results.</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload Garment"}
          </Button>
        </CardFooter>
        {uploading && <Progress value={uploadProgress} className="mt-2" />}
      </Card>

      <ArinChat />
    </div>
  )
}
