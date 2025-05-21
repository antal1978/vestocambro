"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type Outfit = {
  id: string
  items: ClothingItem[]
  date: string
}

type UsageRecord = {
  [key: string]: {
    count: number
    lastUsed: string
  }
}

export default function LooksPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load outfits from localStorage
    const storedOutfits = localStorage.getItem("savedOutfits")
    if (storedOutfits) {
      setOutfits(JSON.parse(storedOutfits))
    }
  }, [])

  const handleDelete = (id: string) => {
    const updatedOutfits = outfits.filter((outfit) => outfit.id !== id)
    setOutfits(updatedOutfits)
    localStorage.setItem("savedOutfits", JSON.stringify(updatedOutfits))

    toast({
      title: "Look eliminado",
      description: "El look ha sido eliminado de tus combinaciones guardadas",
    })
  }

  const handleRecordUsage = (outfit: Outfit) => {
    // Obtener el registro de usos actual
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord: UsageRecord = storedUsage ? JSON.parse(storedUsage) : {}
    const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

    // Incrementar el contador para cada prenda en el outfit
    outfit.items.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = {
          count: 0,
          lastUsed: today,
        }
      }
      usageRecord[item.id].count += 1
      usageRecord[item.id].lastUsed = today
    })

    // Guardar el registro actualizado
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    // Mostrar diálogo de confirmación
    setSelectedOutfit(outfit)
    setShowUsageDialog(true)

    // También mostrar un toast
    toast({
      title: "¡Uso registrado!",
      description: "Has actualizado el contador de uso de estas prendas.",
    })
  }

  // Obtener el número de usos de cada prenda
  const getItemUsageCount = (itemId: string): number => {
    const storedUsage = localStorage.getItem("clothingUsage")
    if (!storedUsage) return 0

    const usageRecord: UsageRecord = JSON.parse(storedUsage)
    return usageRecord[itemId]?.count || 0
  }

  return (
    <div className="container py-8">
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¡Uso registrado!</DialogTitle>
            <DialogDescription>Has actualizado el contador de uso de estas prendas.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Contador de usos actualizado</h3>
              </div>
              <ul className="space-y-2">
                {selectedOutfit?.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span className="capitalize">
                      {item.type} {item.color}
                    </span>
                    <Badge variant="secondary">{getItemUsageCount(item.id)} usos</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Puedes ver estadísticas detalladas de uso en la sección "Estadísticas".
            </p>
          </div>
          <DialogFooter>
            <Link href="/stats">
              <Button variant="outline">Ver estadísticas</Button>
            </Link>
            <Button onClick={() => setShowUsageDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Mis Looks Guardados</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/gallery">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a la galería
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Ver estadísticas
            </Button>
          </Link>
        </div>
      </div>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 mb-4 rounded-full bg-muted">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No tenés looks guardados</h2>
          <p className="mt-2 mb-6 text-muted-foreground">Generá algunas sugerencias y guardá tus looks favoritos</p>
          <Link href="/suggest">
            <Button className="gap-2">Generar sugerencias</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {outfits.map((outfit) => (
            <Card key={outfit.id}>
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>Look guardado</CardTitle>
                  <p className="text-sm text-muted-foreground">Guardado el {outfit.date}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-green-600"
                    onClick={() => handleRecordUsage(outfit)}
                    title="Voy a usar este look hoy"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(outfit.id)}
                    title="Eliminar look"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {outfit.items.map((item) => (
                    <div key={item.id} className="flex flex-col items-center">
                      <div className="relative w-full h-48 mb-2 overflow-hidden rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.type}
                          className="object-cover w-full h-full"
                        />
                        {getItemUsageCount(item.id) > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {getItemUsageCount(item.id)} usos
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="capitalize">{item.type}</Badge>
                        <Badge variant="outline" className="capitalize" style={{ backgroundColor: `${item.color}20` }}>
                          {item.color}
                        </Badge>
                        {item.isOuterwear && (
                          <Badge variant="secondary" className="capitalize">
                            Abrigo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  )
}
