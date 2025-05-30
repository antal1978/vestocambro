"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArinChat } from "@/components/arin-chat"
import { loadExampleItems } from "@/lib/example-items"
import { COLORS } from "@/lib/color-config" // Importar COLORS
import { findClosestColor } from "@/lib/color-utils" // Importar findClosestColor
import type { ClothingItem } from "@/types/ClothingItem"
import { Search, Filter, Plus, Trash2, Wand2, BarChart3, Shirt, TrendingUp } from "lucide-react"

export default function Gallery() {
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<ClothingItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null)
  const [usageStats, setUsageStats] = useState<{ [itemId: string]: { count: number; lastUsed: string } }>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load items and usage stats
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setIsLoading(true)

    // Load example items if none exist
    loadExampleItems()

    // Load clothing items
    const storedItems = localStorage.getItem("clothingItems")
    // Filter out any malformed items that don't have a 'type' property or it's not a string
    const clothingItems: ClothingItem[] = storedItems
      ? JSON.parse(storedItems).filter((item: any) => item && typeof item.type === "string")
      : []

    // Load usage statistics
    const storedUsage = localStorage.getItem("clothingUsage")
    const usage = storedUsage ? JSON.parse(storedUsage) : {}

    setItems(clothingItems)
    setUsageStats(usage)
    setIsLoading(false)
  }

  // Filter items based on category and search
  useEffect(() => {
    // Ensure all items have a valid 'type' before filtering
    let filtered = items.filter((item) => item.type && typeof item.type === "string")

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryMap: { [key: string]: string[] } = {
        tops: ["remera", "blusa", "camisa", "top", "musculosa", "sweater / buzo", "campera / abrigo", "chaleco"],
        bottoms: ["pantalon", "jean", "short", "falda / pollera"],
        dresses: ["vestido", "enterito / mono"],
        outerwear: ["campera / abrigo", "chaleco"], // Ajustado para coincidir con los tipos de prenda
        shoes: ["zapatillas", "zapatos", "sandalias", "botas"],
        accessories: ["gorro / gorra", "bufanda", "cinturon", "bolso / mochila / cartera"],
      }

      if (categoryMap[selectedCategory]) {
        filtered = filtered.filter((item) => categoryMap[selectedCategory].includes(item.type.toLowerCase()))
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          findClosestColor(item.color, COLORS).name.toLowerCase().includes(searchTerm.toLowerCase()) || // Buscar por nombre de color
          (item.occasion && item.occasion.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredItems(filtered)
  }, [items, selectedCategory, searchTerm])

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
  }

  const handleDeleteClick = (item: ClothingItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    const updatedItems = items.filter((item) => item.id !== itemToDelete.id)
    setItems(updatedItems)
    localStorage.setItem("clothingItems", JSON.stringify(updatedItems))

    toast({
      title: "Prenda eliminada",
      description: "La prenda ha sido eliminada de tu armario.",
    })

    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleCreateLookWithItem = (item: ClothingItem) => {
    router.push(`/suggest?baseItem=${item.id}`)
  }

  const getUsageInfo = (itemId: string) => {
    const usage = usageStats[itemId]
    if (!usage || usage.count === 0) {
      return { count: 0, status: "Sin usar", color: "text-gray-500" }
    }

    if (usage.count === 1) {
      return { count: 1, status: "Poco usado", color: "text-yellow-600" }
    }

    if (usage.count <= 3) {
      return { count: usage.count, status: "Uso moderado", color: "text-blue-600" }
    }

    return { count: usage.count, status: "Muy usado", color: "text-green-600" }
  }

  const getCategoryStats = () => {
    const stats: { [category: string]: number } = {}

    items
      .filter((item) => item.type && typeof item.type === "string")
      .forEach((item) => {
        const type = item.type.toLowerCase()
        let category = "otros"

        if (["remera", "blusa", "camisa", "top", "musculosa", "sweater / buzo"].includes(type)) {
          category = "tops"
        } else if (["pantalon", "jean", "short", "falda / pollera"].includes(type)) {
          category = "bottoms"
        } else if (["vestido", "enterito / mono"].includes(type)) {
          category = "vestidos"
        } else if (["campera / abrigo", "chaleco"].includes(type)) {
          category = "abrigos"
        } else if (["zapatillas", "zapatos", "sandalias", "botas"].includes(type)) {
          category = "calzado"
        } else if (["gorro / gorra", "bufanda", "cinturon", "bolso / mochila / cartera"].includes(type)) {
          category = "accesorios"
        }

        stats[category] = (stats[category] || 0) + 1
      })

    return stats
  }

  const getUsageOverview = () => {
    const totalItems = items.length
    const usedItems = items.filter((item) => usageStats[item.id]?.count > 0).length
    const neverUsed = totalItems - usedItems
    const usagePercentage = totalItems > 0 ? Math.round((usedItems / totalItems) * 100) : 0

    return { totalItems, usedItems, neverUsed, usagePercentage }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tu armario...</p>
        </div>
        <ArinChat />
      </div>
    )
  }

  const categoryStats = getCategoryStats()
  const usageOverview = getUsageOverview()

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Armario</h1>
          <p className="text-muted-foreground mt-2">
            {items.length === 0
              ? "Tu armario está vacío"
              : `${items.length} prenda${items.length !== 1 ? "s" : ""} en tu colección`}
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={() => router.push("/upload")} className="gap-2">
            <Plus className="h-4 w-4" />
            Añadir prenda
          </Button>
          <Button onClick={() => router.push("/suggest")} variant="outline" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Crear look
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Shirt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tu armario está vacío</h3>
            <p className="text-muted-foreground mb-6">
              Empezá añadiendo algunas prendas para que ARIN pueda ayudarte a crear looks increíbles
            </p>
            <Button onClick={() => router.push("/upload")} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir mi primera prenda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por tipo, color o ocasión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prendas</SelectItem>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Pantalones y faldas</SelectItem>
                <SelectItem value="dresses">Vestidos</SelectItem>
                <SelectItem value="outerwear">Abrigos</SelectItem>
                <SelectItem value="shoes">Calzado</SelectItem>
                <SelectItem value="accessories">Accesorios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-muted-foreground">No se encontraron prendas que coincidan con tu búsqueda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {filteredItems.map((item) => {
                const usageInfo = getUsageInfo(item.id)
                const colorName = findClosestColor(item.color, COLORS).name // Obtener el nombre del color
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative">
                      <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={`${item.type} ${colorName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Actions overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={(e) => handleDeleteClick(item, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Usage badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className={`text-xs ${usageInfo.color}`}>
                          {usageInfo.count > 0 ? `${usageInfo.count} usos` : "Sin usar"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm capitalize truncate">
                        {item.type} {colorName}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">{item.occasion}</p>

                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateLookWithItem(item)
                          }}
                        >
                          <Wand2 className="h-3 w-3 mr-1" />
                          Look
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Statistics Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribución por categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="capitalize text-sm">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estadísticas de uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{usageOverview.usagePercentage}%</div>
                    <div className="text-sm text-muted-foreground">de tu armario en uso</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Prendas usadas:</span>
                      <span className="font-medium">{usageOverview.usedItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sin usar:</span>
                      <span className="font-medium text-orange-600">{usageOverview.neverUsed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">{usageOverview.totalItems}</span>
                    </div>
                  </div>

                  <Button onClick={() => router.push("/stats")} variant="outline" size="sm" className="w-full gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Ver estadísticas completas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {selectedItem.type} {findClosestColor(selectedItem.color, COLORS).name}
                </DialogTitle>
                <DialogDescription>Detalles de la prenda</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={`${selectedItem.type} ${findClosestColor(selectedItem.color, COLORS).name}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tipo:</span>
                    <span className="text-sm capitalize">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Color:</span>
                    <span className="text-sm capitalize">{findClosestColor(selectedItem.color, COLORS).name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Ocasión:</span>
                    <span className="text-sm capitalize">{selectedItem.occasion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Clima:</span>
                    <span className="text-sm capitalize">{selectedItem.climate}</span>
                  </div>

                  {usageStats[selectedItem.id] && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Veces usado:</span>
                        <span className="text-sm">{usageStats[selectedItem.id].count}</span>
                      </div>
                      {usageStats[selectedItem.id].lastUsed && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Último uso:</span>
                          <span className="text-sm">
                            {new Date(usageStats[selectedItem.id].lastUsed).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleCreateLookWithItem(selectedItem)} className="flex-1 gap-2" size="sm">
                    <Wand2 className="h-4 w-4" />
                    Crear look con esta prenda
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar prenda</DialogTitle>
            <DialogDescription>
              ¿Estás segura de que querés eliminar esta prenda? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ArinChat />
    </div>
  )
}
