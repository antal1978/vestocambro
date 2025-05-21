"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shirt, TrendingUp, TrendingDown, Sparkles, CheckCircle2, PlusCircle, Recycle } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

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

type ItemWithUsage = ClothingItem & {
  usageCount: number
  lastUsed: string
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

export default function StatsPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [itemsWithUsage, setItemsWithUsage] = useState<ItemWithUsage[]>([])
  const [totalUsage, setTotalUsage] = useState(0)
  const [usedPercentage, setUsedPercentage] = useState(0)
  const [mostUsedItems, setMostUsedItems] = useState<ItemWithUsage[]>([])
  const [leastUsedItems, setLeastUsedItems] = useState<ItemWithUsage[]>([])
  const [neverUsedItems, setNeverUsedItems] = useState<ItemWithUsage[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [disposals, setDisposals] = useState<DisposalRecord[]>([])
  const [disposalsByReason, setDisposalsByReason] = useState<Record<DisposalReason, number>>({
    donated: 0,
    broken: 0,
    dislike: 0,
    other: 0,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Cargar prendas
    const storedItems = localStorage.getItem("clothingItems")
    if (!storedItems) return

    const parsedItems: ClothingItem[] = JSON.parse(storedItems)
    setItems(parsedItems)

    // Cargar registro de uso
    const storedUsage = localStorage.getItem("clothingUsage")
    const usageRecord: UsageRecord = storedUsage ? JSON.parse(storedUsage) : {}

    // Combinar prendas con su uso
    const itemsWithUsageData: ItemWithUsage[] = parsedItems.map((item) => ({
      ...item,
      usageCount: usageRecord[item.id]?.count || 0,
      lastUsed: usageRecord[item.id]?.lastUsed || "",
    }))

    setItemsWithUsage(itemsWithUsageData)

    // Calcular estadísticas
    const totalUses = itemsWithUsageData.reduce((sum, item) => sum + item.usageCount, 0)
    setTotalUsage(totalUses)

    const usedItems = itemsWithUsageData.filter((item) => item.usageCount > 0)
    const usedPercentage = parsedItems.length > 0 ? (usedItems.length / parsedItems.length) * 100 : 0
    setUsedPercentage(usedPercentage)

    // Ordenar por uso
    const sortedByUsage = [...itemsWithUsageData].sort((a, b) => b.usageCount - a.usageCount)
    setMostUsedItems(sortedByUsage.slice(0, 5))

    const nonZeroUsage = sortedByUsage.filter((item) => item.usageCount > 0)
    setLeastUsedItems(nonZeroUsage.slice(-5).reverse())

    const neverUsed = itemsWithUsageData.filter((item) => item.usageCount === 0)
    setNeverUsedItems(neverUsed)

    // Cargar registro de eliminaciones
    const storedDisposals = localStorage.getItem("clothingDisposals")
    if (storedDisposals) {
      const parsedDisposals: DisposalRecord[] = JSON.parse(storedDisposals)
      setDisposals(parsedDisposals)

      // Calcular estadísticas de eliminación
      const reasonCounts: Record<DisposalReason, number> = {
        donated: 0,
        broken: 0,
        dislike: 0,
        other: 0,
      }

      parsedDisposals.forEach((disposal) => {
        reasonCounts[disposal.reason]++
      })

      setDisposalsByReason(reasonCounts)
    }
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Nunca"
    const date = new Date(dateString)
    return date.toLocaleDateString()
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

  // Modificar la función handleCreateLookWithSelected para que sea más clara
  const handleCreateLookWithSelected = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No hay prendas seleccionadas",
        description: "Por favor, selecciona al menos una prenda para crear un look.",
        variant: "warning",
      })
      return
    }

    // Si solo hay una prenda seleccionada, usarla como base para generar un look
    if (selectedItems.length === 1) {
      router.push(`/suggest?baseItem=${selectedItems[0]}`)
    } else {
      // Si hay múltiples prendas, seleccionar una al azar como base
      const randomIndex = Math.floor(Math.random() * selectedItems.length)
      const baseItemId = selectedItems[randomIndex]
      router.push(`/suggest?baseItem=${baseItemId}`)
    }

    toast({
      title: "Generando look",
      description: `Creando un look con ${selectedItems.length} prendas seleccionadas.`,
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

  const getDisposalReasonIcon = (reason: DisposalReason) => {
    switch (reason) {
      case "donated":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "broken":
        return <Recycle className="h-4 w-4 text-amber-500" />
      case "dislike":
        return <Recycle className="h-4 w-4 text-blue-500" />
      case "other":
        return <Recycle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTotalDisposals = () => {
    return disposals.length
  }

  const getDisposalPercentage = (reason: DisposalReason): number => {
    const total = getTotalDisposals()
    if (total === 0) return 0
    return (disposalsByReason[reason] / total) * 100
  }

  const handleGenerateLookWithItem = (item: ItemWithUsage) => {
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
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Estadísticas de Uso</h1>
        <div className="flex flex-wrap gap-2">
          {isSelectionMode ? (
            <>
              <Button
                variant="default"
                onClick={handleCreateLookWithSelected}
                className="gap-2"
                disabled={selectedItems.length === 0}
              >
                <PlusCircle className="w-4 h-4" />
                Crear look con selección ({selectedItems.length})
              </Button>
              <Button variant="outline" onClick={handleToggleSelectionMode} className="gap-2">
                Cancelar
              </Button>
            </>
          ) : (
            <Link href="/gallery">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a la galería
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de usos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Veces que has usado prendas de tu guardarropa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Guardarropa utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{Math.round(usedPercentage)}%</div>
              <div className="text-xs text-muted-foreground">
                {itemsWithUsage.filter((item) => item.usageCount > 0).length} de {items.length} prendas
              </div>
            </div>
            <Progress value={usedPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prendas sin usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{neverUsedItems.length}</div>
            <p className="text-xs text-muted-foreground">Prendas que aún no has utilizado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="most-used" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="most-used" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Más usadas
          </TabsTrigger>
          <TabsTrigger value="least-used" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Menos usadas
          </TabsTrigger>
          <TabsTrigger value="never-used" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Por descubrir
          </TabsTrigger>
          <TabsTrigger value="disposed" className="gap-2">
            <Recycle className="h-4 w-4" />
            Eliminadas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="most-used">
          <Card>
            <CardHeader>
              <CardTitle>Prendas más usadas</CardTitle>
              <CardDescription>Las prendas que más has utilizado desde que comenzaste a usar la app</CardDescription>
            </CardHeader>
            <CardContent>
              {mostUsedItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mostUsedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium capitalize truncate">
                          {item.type} {item.color}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{item.usageCount} usos</Badge>
                          <span className="text-xs text-muted-foreground">Último uso: {formatDate(item.lastUsed)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 gap-2 px-3 py-1 h-auto text-xs whitespace-normal text-center"
                        onClick={() => handleGenerateLookWithItem(item)}
                      >
                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                        <span>Crear look</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shirt className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">No hay datos de uso</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Comienza a registrar el uso de tus looks para ver estadísticas aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="least-used">
          <Card>
            <CardHeader>
              <CardTitle>Prendas menos usadas</CardTitle>
              <CardDescription>Las prendas que menos has utilizado (pero al menos una vez)</CardDescription>
            </CardHeader>
            <CardContent>
              {leastUsedItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {leastUsedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium capitalize truncate">
                          {item.type} {item.color}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.usageCount} usos</Badge>
                          <span className="text-xs text-muted-foreground">Último uso: {formatDate(item.lastUsed)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 gap-2 px-3 py-1 h-auto text-xs whitespace-normal text-center"
                        onClick={() => handleGenerateLookWithItem(item)}
                      >
                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                        <span>Crear look</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shirt className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">No hay prendas con poco uso</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Todas tus prendas usadas tienen la misma cantidad de usos o aún no has usado ninguna
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="never-used">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Prendas por descubrir</span>
                {neverUsedItems.length > 0 && !isSelectionMode && (
                  <Button variant="outline" size="sm" onClick={handleToggleSelectionMode} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Crear look con estas prendas
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Prendas que aún no has utilizado en ningún look</CardDescription>
            </CardHeader>
            <CardContent>
              {neverUsedItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {neverUsedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        isSelectionMode ? "cursor-pointer hover:border-primary transition-colors" : ""
                      } ${isSelectionMode && selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""}`}
                      onClick={() => isSelectionMode && toggleItemSelection(item.id)}
                    >
                      {isSelectionMode && (
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            className="h-5 w-5"
                          />
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium capitalize truncate">
                          {item.type} {item.color}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive">Sin usar</Badge>
                          <span className="text-xs text-muted-foreground">¡Prueba a incluirla en un look!</span>
                        </div>
                      </div>
                      {!isSelectionMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 gap-2 px-3 py-1 h-auto text-xs whitespace-normal text-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateLookWithItem(item)
                          }}
                        >
                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                          <span>Crear look</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">¡Felicidades!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Has utilizado todas las prendas de tu guardarropa al menos una vez
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isSelectionMode ? (
                <Button
                  onClick={handleCreateLookWithSelected}
                  className="w-full gap-2"
                  disabled={selectedItems.length === 0}
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear look con selección ({selectedItems.length})
                </Button>
              ) : (
                neverUsedItems.length > 0 && (
                  <Link href="/suggest" className="w-full">
                    <Button className="w-full">Generar look con prendas sin usar</Button>
                  </Link>
                )
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="disposed">
          <Card>
            <CardHeader>
              <CardTitle>Prendas eliminadas</CardTitle>
              <CardDescription>Historial de prendas que has eliminado de tu guardarropa</CardDescription>
            </CardHeader>
            <CardContent>
              {disposals.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="text-xl font-bold">{disposalsByReason.donated}</div>
                      <p className="text-xs text-muted-foreground">Donadas o regaladas</p>
                      <Progress value={getDisposalPercentage("donated")} className="h-1 mt-2" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Recycle className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="text-xl font-bold">{disposalsByReason.broken}</div>
                      <p className="text-xs text-muted-foreground">Rotas sin reparación</p>
                      <Progress value={getDisposalPercentage("broken")} className="h-1 mt-2" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Recycle className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-xl font-bold">{disposalsByReason.dislike}</div>
                      <p className="text-xs text-muted-foreground">Ya no me gustan</p>
                      <Progress value={getDisposalPercentage("dislike")} className="h-1 mt-2" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Recycle className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="text-xl font-bold">{disposalsByReason.other}</div>
                      <p className="text-xs text-muted-foreground">Otros motivos</p>
                      <Progress value={getDisposalPercentage("other")} className="h-1 mt-2" />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-3">Historial de eliminaciones</h3>
                  <div className="space-y-3">
                    {disposals
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((disposal) => (
                        <div key={disposal.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0">{getDisposalReasonIcon(disposal.reason)}</div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">
                              {disposal.itemType} {disposal.itemColor}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{getDisposalReasonText(disposal.reason)}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(disposal.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Recycle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">No has eliminado ninguna prenda</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando elimines prendas de tu guardarropa, podrás ver estadísticas aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Consejos para aprovechar tu guardarropa</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span>
                Intenta usar las prendas que nunca has utilizado. ¡Podrías descubrir combinaciones sorprendentes!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span>
                Rota tus prendas favoritas con otras menos usadas para equilibrar el desgaste y extender su vida útil.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span>
                Antes de desechar una prenda que ya no te gusta, considera donarla o transformarla en algo nuevo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span>
                Antes de comprar algo nuevo, revisa estas estadísticas para identificar qué tipo de prendas ya tienes en
                abundancia.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
