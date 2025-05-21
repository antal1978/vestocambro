"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wand2, Trash2, Plus, Database, BarChart3, CheckCircle2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type UsageRecord = {
  [key: string]: {
    count: number
    lastUsed: string
  }
}

type DisposalReason = "donated" | "broken" | "dislike" | "other"

type DisposalRecord = {
  id: string
  itemId: string
  itemType: string
  itemColor: string
  reason: DisposalReason
  date: string
  notes?: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showDisposalDialog, setShowDisposalDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null)
  const [disposalReason, setDisposalReason] = useState<DisposalReason>("donated")
  const [showDisposalSuccessDialog, setShowDisposalSuccessDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load items from localStorage
    const storedItems = localStorage.getItem("clothingItems")
    if (storedItems) {
      setItems(JSON.parse(storedItems))
    }
  }, [])

  const handleDelete = (item: ClothingItem) => {
    setItemToDelete(item)
    setShowDisposalDialog(true)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    // Registrar la eliminación
    const disposalRecord: DisposalRecord = {
      id: Date.now().toString(),
      itemId: itemToDelete.id,
      itemType: itemToDelete.type,
      itemColor: itemToDelete.color,
      reason: disposalReason,
      date: new Date().toISOString(),
    }

    // Guardar en el historial de eliminaciones
    const storedDisposals = localStorage.getItem("clothingDisposals")
    const disposals: DisposalRecord[] = storedDisposals ? JSON.parse(storedDisposals) : []
    localStorage.setItem("clothingDisposals", JSON.stringify([...disposals, disposalRecord]))

    // Eliminar la prenda
    const updatedItems = items.filter((item) => item.id !== itemToDelete.id)
    setItems(updatedItems)
    localStorage.setItem("clothingItems", JSON.stringify(updatedItems))

    // Cerrar el diálogo de confirmación
    setShowDisposalDialog(false)

    // Mostrar diálogo de éxito con sugerencias
    setShowDisposalSuccessDialog(true)
  }

  const getClimateLabel = (climate: string) => {
    switch (climate) {
      case "caluroso":
        return "Caluroso"
      case "templado":
        return "Templado"
      case "frio":
        return "Frío"
      case "todo-clima":
        return "Todo clima"
      default:
        return climate
    }
  }

  // Obtener el número de usos de cada prenda
  const getItemUsageCount = (itemId: string): number => {
    const storedUsage = localStorage.getItem("clothingUsage")
    if (!storedUsage) return 0

    const usageRecord: UsageRecord = JSON.parse(storedUsage)
    return usageRecord[itemId]?.count || 0
  }

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedItems([]) // Limpiar selección al cambiar de modo
  }

  const handleRecordUsage = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No hay prendas seleccionadas",
        description: "Por favor, selecciona al menos una prenda para registrar su uso.",
        variant: "warning",
      })
      return
    }

    // Obtener el registro de usos actual
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord: UsageRecord = storedUsage ? JSON.parse(storedUsage) : {}
    const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

    // Incrementar el contador para cada prenda seleccionada
    selectedItems.forEach((itemId) => {
      if (!usageRecord[itemId]) {
        usageRecord[itemId] = {
          count: 0,
          lastUsed: today,
        }
      }
      usageRecord[itemId].count += 1
      usageRecord[itemId].lastUsed = today
    })

    // Guardar el registro actualizado
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

    // Mostrar diálogo de confirmación
    setShowUsageDialog(true)

    // También mostrar un toast
    toast({
      title: "¡Uso registrado!",
      description: `Has actualizado el contador de uso de ${selectedItems.length} prendas.`,
      variant: "success",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    })
  }

  const getSelectedItems = () => {
    return items.filter((item) => selectedItems.includes(item.id))
  }

  const getDisposalReasonText = (reason: DisposalReason): string => {
    switch (reason) {
      case "donated":
        return "Donada o regalada"
      case "broken":
        return "Rota sin posibilidad de reparación"
      case "dislike":
        return "Ya no me gusta"
      case "other":
        return "Otro motivo"
      default:
        return reason
    }
  }

  const getDisposalSuggestion = (reason: DisposalReason): string => {
    switch (reason) {
      case "donated":
        return "¡Excelente decisión! Dar una segunda vida a tus prendas ayuda a reducir el desperdicio textil y beneficia a quienes más lo necesitan."
      case "broken":
        return "Considera reciclar los materiales. Muchas tiendas tienen programas de reciclaje textil, o puedes convertir la tela en trapos de limpieza."
      case "dislike":
        return "Antes de desechar, considera donarla, venderla en plataformas de segunda mano, o transformarla en algo nuevo con técnicas de upcycling."
      case "other":
        return "Sea cual sea el motivo, recuerda que la industria textil tiene un gran impacto ambiental. Intenta dar una segunda vida a tus prendas siempre que sea posible."
    }
  }

  const handleGenerateLookWithItem = (item: ClothingItem) => {
    // Guardar el ID de la prenda seleccionada en localStorage
    localStorage.setItem("baseItemForLook", item.id)

    // Redirigir a la página de sugerencias con un parámetro que indique que debe usar esta prenda como base
    router.push(`/suggest?baseItem=${item.id}`)

    toast({
      title: "Generando look",
      description: `Creando un look basado en tu ${item.type} ${item.color}`,
    })
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
                {getSelectedItems().map((item) => (
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
            <Button
              onClick={() => {
                setShowUsageDialog(false)
                setSelectedItems([])
                setIsSelectionMode(false)
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisposalDialog} onOpenChange={setShowDisposalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Por qué eliminas esta prenda?</DialogTitle>
            <DialogDescription>
              Nos interesa saber qué sucede con tus prendas para ayudarte a tomar decisiones más sostenibles.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {itemToDelete && (
              <div className="flex items-center gap-4 mb-4 p-3 rounded-lg border">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={itemToDelete.image || "/placeholder.svg"}
                    alt={itemToDelete.type}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {itemToDelete.type} {itemToDelete.color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getItemUsageCount(itemToDelete.id) > 0
                      ? `Usada ${getItemUsageCount(itemToDelete.id)} veces`
                      : "Nunca usada"}
                  </p>
                </div>
              </div>
            )}

            <RadioGroup value={disposalReason} onValueChange={(value) => setDisposalReason(value as DisposalReason)}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="donated" id="donated" />
                <Label htmlFor="donated">La doné o regalé</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="broken" id="broken" />
                <Label htmlFor="broken">Está rota sin posibilidad de reparación</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="dislike" id="dislike" />
                <Label htmlFor="dislike">Ya no me gusta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Otro motivo</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDisposalDialog(false)} className="sm:order-1">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} variant="default" className="sm:order-2">
              Confirmar eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisposalSuccessDialog} onOpenChange={setShowDisposalSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Prenda eliminada</DialogTitle>
            <DialogDescription>
              La prenda ha sido eliminada de tu guardarropa y registrada como{" "}
              {getDisposalReasonText(disposalReason).toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <h3 className="font-medium mb-2">Sugerencia sostenible</h3>
              <p className="text-sm">{getDisposalSuggestion(disposalReason)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Puedes ver el historial de prendas eliminadas en la sección "Estadísticas".
            </p>
          </div>
          <DialogFooter>
            <Link href="/stats">
              <Button variant="outline">Ver estadísticas</Button>
            </Link>
            <Button onClick={() => setShowDisposalSuccessDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Mi Guardarropa</h1>
        <div className="flex flex-wrap gap-2">
          {isSelectionMode ? (
            <>
              <Button variant="default" onClick={handleRecordUsage} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Registrar uso ({selectedItems.length})
              </Button>
              <Button variant="outline" onClick={handleToggleSelectionMode} className="gap-2">
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleToggleSelectionMode} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Registrá uso manual
              </Button>
              <Link href="/upload">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Añadí prenda
                </Button>
              </Link>
              {/* Se ha eliminado el botón de cargar ejemplos para mejorar la experiencia del usuario */}
              <Link href="/stats">
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estadísticas
                </Button>
              </Link>
              {items.length >= 2 && (
                <Link href="/suggest">
                  <Button className="gap-2">
                    <Wand2 className="w-4 h-4" />
                    Sugerí un look
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 rounded-lg border border-dashed animate-fade-in">
          <div className="p-4 mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Wand2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold">Tu guardarropa está vacío</h2>
          <p className="mt-2 mb-6 text-muted-foreground">
            Añadí algunas prendas para comenzar a crear looks increíbles
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/upload">
              <Button className="gap-2 btn-hover">
                <Plus className="w-4 h-4" />
                Añadí mi primera prenda
              </Button>
            </Link>
            <Link href="/ejemplos">
              <Button variant="outline" className="gap-2 btn-hover">
                <Database className="w-4 h-4" />
                Cargá prendas de ejemplo
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden card-hover ${isSelectionMode && selectedItems.includes(item.id) ? "ring-2 ring-primary-500" : ""}`}
            >
              <div className="relative w-full h-48">
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                      className="h-5 w-5 bg-white/90"
                    />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.type}
                  className="object-cover w-full h-full"
                  onClick={() => isSelectionMode && toggleItemSelection(item.id)}
                  style={{ cursor: isSelectionMode ? "pointer" : "default" }}
                />
                {getItemUsageCount(item.id) > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {getItemUsageCount(item.id)} usos
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg capitalize">{item.type}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize" style={{ backgroundColor: `${item.color}20` }}>
                    {item.color}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {item.occasion}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {getClimateLabel(item.climate)}
                  </Badge>
                  {item.isOuterwear && (
                    <Badge variant="secondary" className="capitalize">
                      Abrigo
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                {!isSelectionMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 px-3 py-1 h-auto text-xs whitespace-normal text-center"
                      onClick={() => handleGenerateLookWithItem(item)}
                    >
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      <span>Crear look</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {isSelectionMode && (
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleItemSelection(item.id)}>
                    {selectedItems.includes(item.id) ? "Deseleccionar" : "Seleccionar"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  )
}
