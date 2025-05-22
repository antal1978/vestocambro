"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wand2, Trash2, Plus, Database, BarChart3, Sparkles, Eye, Save, ArrowLeftRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Definir las categorías de prendas
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

export default function GalleryPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [isVirtualTryOn, setIsVirtualTryOn] = useState(false)
  const [showDisposalDialog, setShowDisposalDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null)
  const [disposalReason, setDisposalReason] = useState<DisposalReason>("donated")
  const [showDisposalSuccessDialog, setShowDisposalSuccessDialog] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("todas")
  const [showVirtualTryOnDialog, setShowVirtualTryOnDialog] = useState(false)
  const [currentLook, setCurrentLook] = useState<Record<ClothingCategory, ClothingItem | null>>({
    upperBody: null,
    lowerBody: null,
    fullBody: null,
    outerwear: null,
    footwear: null,
    accessories: null,
  })
  const [savedLook, setSavedLook] = useState<Record<ClothingCategory, ClothingItem | null> | null>(null)
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>("upperBody")
  const [compareMode, setCompareMode] = useState(false)

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

  // Iniciar el modo de prueba virtual
  const startVirtualTryOn = () => {
    setIsVirtualTryOn(true)
    setShowVirtualTryOnDialog(true)

    // Inicializar el look actual vacío
    setCurrentLook({
      upperBody: null,
      lowerBody: null,
      fullBody: null,
      outerwear: null,
      footwear: null,
      accessories: null,
    })

    // Establecer la primera categoría como activa
    setActiveCategory("upperBody")
  }

  // Cancelar el modo de prueba virtual
  const cancelVirtualTryOn = () => {
    setIsVirtualTryOn(false)
    setShowVirtualTryOnDialog(false)
    setCompareMode(false)
  }

  // Guardar el look actual para comparar
  const saveCurrentLook = () => {
    // Verificar si hay al menos una prenda en el look actual
    const hasItems = Object.values(currentLook).some((item) => item !== null)

    if (!hasItems) {
      toast({
        title: "Look vacío",
        description: "Selecciona al menos una prenda para guardar el look.",
        variant: "warning",
      })
      return
    }

    // Guardar el look actual
    setSavedLook({ ...currentLook })

    toast({
      title: "Look guardado",
      description: "Ahora puedes crear otro look para comparar.",
      variant: "success",
    })

    // Limpiar el look actual para crear uno nuevo
    setCurrentLook({
      upperBody: null,
      lowerBody: null,
      fullBody: null,
      outerwear: null,
      footwear: null,
      accessories: null,
    })

    // Activar el modo de comparación
    setCompareMode(true)
  }

  // Intercambiar entre el look guardado y el actual
  const swapLooks = () => {
    if (!savedLook) return

    const temp = { ...currentLook }
    setCurrentLook({ ...savedLook })
    setSavedLook(temp)
  }

  // Filtrar items por categoría para el modo normal
  const filterItemsByCategory = (items: ClothingItem[]): ClothingItem[] => {
    if (categoryFilter === "todas") {
      return items
    }

    // Mapeo de categorías a tipos de prendas
    const categoryMap: Record<string, string[]> = {
      "parte-superior": CLOTHING_CATEGORIES.upperBody,
      "parte-inferior": CLOTHING_CATEGORIES.lowerBody,
      vestidos: CLOTHING_CATEGORIES.fullBody,
      abrigos: CLOTHING_CATEGORIES.outerwear,
      calzado: CLOTHING_CATEGORIES.footwear,
      accesorios: CLOTHING_CATEGORIES.accessories,
    }

    return items.filter(
      (item) => categoryMap[categoryFilter]?.includes(item.type) || (categoryFilter === "abrigos" && item.isOuterwear),
    )
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

    return items.filter((item) => {
      const category = getItemCategory(item)
      return category === activeCategory
    })
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

  // Renderizar el look virtual (actual o guardado)
  const renderVirtualLook = (look: Record<ClothingCategory, ClothingItem | null>, title: string) => {
    // Verificar si hay al menos una prenda en el look
    const hasItems = Object.values(look).some((item) => item !== null)

    if (!hasItems) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed h-full">
          <p className="text-muted-foreground text-center">
            {title} está vacío. Selecciona prendas para visualizar el look.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-center">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Parte superior o prenda completa */}
          <div className="col-span-2 aspect-square relative bg-white rounded-md overflow-hidden border">
            {look.fullBody ? (
              // Mostrar prenda completa
              <img
                src={look.fullBody.image || "/placeholder.svg"}
                alt={look.fullBody.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : look.upperBody ? (
              // Mostrar parte superior
              <img
                src={look.upperBody.image || "/placeholder.svg"}
                alt={look.upperBody.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin parte superior</p>
              </div>
            )}
          </div>

          {/* Parte inferior (solo si no hay prenda completa) */}
          {!look.fullBody && (
            <div className="col-span-2 aspect-square relative bg-white rounded-md overflow-hidden border">
              {look.lowerBody ? (
                <img
                  src={look.lowerBody.image || "/placeholder.svg"}
                  alt={look.lowerBody.type}
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
            {look.outerwear ? (
              <img
                src={look.outerwear.image || "/placeholder.svg"}
                alt={look.outerwear.type}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Sin abrigo</p>
              </div>
            )}
          </div>

          <div className="aspect-square relative bg-white rounded-md overflow-hidden border">
            {look.footwear ? (
              <img
                src={look.footwear.image || "/placeholder.svg"}
                alt={look.footwear.type}
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
            {look.accessories ? (
              <img
                src={look.accessories.image || "/placeholder.svg"}
                alt={look.accessories.type}
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

  return (
    <div className="container py-8">
      {/* Diálogo de prueba virtual */}
      <Dialog
        open={showVirtualTryOnDialog}
        onOpenChange={(open) => {
          if (!open) cancelVirtualTryOn()
          setShowVirtualTryOnDialog(open)
        }}
      >
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prueba virtual de look</DialogTitle>
            <DialogDescription>Selecciona una prenda de cada categoría para crear tu look virtual</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Panel izquierdo: Categorías y prendas */}
            <div className="md:col-span-2 space-y-4">
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
                      {getItemsForActiveCategory().map((item) => (
                        <Card
                          key={item.id}
                          className={`overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all ${
                            currentLook[category as ClothingCategory]?.id === item.id ? "ring-2 ring-primary-500" : ""
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

                      {getItemsForActiveCategory().length === 0 && (
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
              {compareMode ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Look guardado */}
                  <div className="space-y-4">{savedLook && renderVirtualLook(savedLook, "Look guardado")}</div>

                  {/* Look actual */}
                  <div className="space-y-4">{renderVirtualLook(currentLook, "Look actual")}</div>

                  <Button onClick={swapLooks} variant="outline" className="col-span-2 gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Intercambiar looks
                  </Button>
                </div>
              ) : (
                <>
                  {renderVirtualLook(currentLook, "Tu look virtual")}

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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeItemFromVirtualTryOn(category as ClothingCategory)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No seleccionada</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={saveCurrentLook} variant="outline" className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Guardar look para comparar
                  </Button>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelVirtualTryOn}>
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
              Podés ver el historial de prendas eliminadas en la sección "Estadísticas".
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
          <Button variant="outline" onClick={startVirtualTryOn} className="gap-2">
            <Eye className="w-4 h-4" />
            Probar look virtual
          </Button>
          <Link href="/upload">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Añadir prenda
            </Button>
          </Link>
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
                Sugerir un look
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="category-filter" className="text-sm whitespace-nowrap">
            Filtrar por categoría:
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" id="category-filter">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prendas</SelectItem>
              <SelectItem value="parte-superior">Parte superior</SelectItem>
              <SelectItem value="parte-inferior">Parte inferior</SelectItem>
              <SelectItem value="vestidos">Vestidos</SelectItem>
              <SelectItem value="abrigos">Abrigos</SelectItem>
              <SelectItem value="calzado">Calzado</SelectItem>
              <SelectItem value="accesorios">Accesorios</SelectItem>
            </SelectContent>
          </Select>
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
                Añadir mi primera prenda
              </Button>
            </Link>
            <Link href="/ejemplos">
              <Button variant="outline" className="gap-2 btn-hover">
                <Database className="w-4 h-4" />
                Cargar prendas de ejemplo
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filterItemsByCategory(items).map((item) => (
            <Card key={item.id} className="overflow-hidden card-hover">
              <div className="relative w-full h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image || "/placeholder.svg"} alt={item.type} className="object-cover w-full h-full" />
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  )
}
