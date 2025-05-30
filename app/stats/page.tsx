"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "lucide-react"
import { ArinChat } from "@/components/arin-chat"
import type { ClothingItem } from "@/types/ClothingItem"

// Placeholder for a simple chart component (replace with a proper charting library if needed)
const SimpleBarChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <div className="space-y-2">
    {data.map((item) => (
      <div key={item.name} className="flex items-center gap-2">
        <span className="text-sm font-medium capitalize w-24 truncate">{item.name}</span>
        <div className="flex-1 bg-muted rounded-full h-4">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${(item.value / Math.max(...data.map((d) => d.value), 1)) * 100}%` }}
          />
        </div>
        <span className="text-sm">{item.value}</span>
      </div>
    ))}
  </div>
)

export default function Stats() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [clothingUsage, setClothingUsage] = useState<{ [itemId: string]: { count: number; lastUsed: string } }>({})
  const [lookUsage, setLookUsage] = useState<{ [lookId: string]: { count: number; lastUsed: string } }>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadStatsData = () => {
    loadData()
  }

  useEffect(() => {
    loadStatsData()
  }, [])

  const loadData = () => {
    setIsLoading(true)
    const storedItems = localStorage.getItem("clothingItems")
    const storedClothingUsage = localStorage.getItem("clothingUsage")
    const storedLooks = localStorage.getItem("savedLooks")
    const storedLookUsage = localStorage.getItem("lookUsage")

    // Ensure items are filtered for valid 'type' and 'material' on load
    const parsedItems: ClothingItem[] = storedItems
      ? JSON.parse(storedItems).filter((item: any) => item && typeof item.type === "string")
      : []

    setClothingItems(parsedItems)
    setClothingUsage(storedClothingUsage ? JSON.parse(storedClothingUsage) : {})
    setLookUsage(storedLookUsage ? JSON.parse(storedLookUsage) : {})
    setIsLoading(false)
  }

  // --- Clothing Item Statistics ---
  const getClothingCategoryStats = () => {
    const stats: { [category: string]: number } = {}
    clothingItems.forEach((item) => {
      const type = item.type.toLowerCase()
      let category = "otros"
      if (["remera", "camisa", "blusa", "sweater", "buzo", "top", "musculosa"].includes(type)) category = "tops"
      else if (["pantalon", "jean", "falda", "short", "shorts"].includes(type)) category = "bottoms"
      else if (["vestido", "enterito", "mono"].includes(type)) category = "vestidos"
      else if (["campera", "tapado", "blazer", "abrigo", "chaleco"].includes(type)) category = "abrigos"
      else if (["zapatillas", "zapatos", "botas", "sandalias"].includes(type)) category = "calzado"
      else if (["bufanda", "gorro", "cinturon", "bolso", "cartera"].includes(type)) category = "accesorios"
      stats[category] = (stats[category] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  const getClothingUsageOverview = () => {
    const totalItems = clothingItems.length
    const usedItemsCount = clothingItems.filter((item) => clothingUsage[item.id]?.count > 0).length
    const neverUsedCount = totalItems - usedItemsCount
    const usagePercentage = totalItems > 0 ? Math.round((usedItemsCount / totalItems) * 100) : 0

    const mostUsed = Object.entries(clothingUsage)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => {
        const item = clothingItems.find((i) => i.id === id)
        return { name: item ? `${item.type} ${item.color}` : "Desconocido", value: data.count }
      })

    const leastUsed = Object.entries(clothingUsage)
      .filter(([, data]) => data.count > 0) // Only show items that have been used at least once
      .sort(([, a], [, b]) => a.count - b.count)
      .slice(0, 5)
      .map(([id, data]) => {
        const item = clothingItems.find((i) => i.id === id)
        return { name: item ? `${item.type} ${item.color}` : "Desconocido", value: data.count }
      })

    const unusedItems = clothingItems
      .filter((item) => !clothingUsage[item.id] || clothingUsage[item.id].count === 0)
      .map((item) => ({ name: `${item.type} ${item.color}`, value: 0 }))

    return { totalItems, usedItemsCount, neverUsedCount, usagePercentage, mostUsed, leastUsed, unusedItems }
  }

  // --- Material Statistics ---
  const getMaterialStats = () => {
    const stats: { [material: string]: number } = {}
    clothingItems.forEach((item) => {
      if (item.material && typeof item.material === "string") {
        // Ensure material exists and is a string
        const materialName = item.material.toLowerCase()
        stats[materialName] = (stats[materialName] || 0) + 1
      }
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  // --- Look Statistics ---
  const getLookUsageStats = () => {
    const totalLooks = Object.keys(lookUsage).length
    const usedLooksCount = Object.values(lookUsage).filter((data) => data.count > 0).length
    const neverUsedLooksCount = totalLooks - usedLooksCount
    const usagePercentage = totalLooks > 0 ? Math.round((usedLooksCount / totalLooks) * 100) : 0

    const mostUsedLooks = Object.entries(lookUsage)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({ name: `Look ${id.substring(0, 4)}`, value: data.count })) // Placeholder name for looks

    return { totalLooks, usedLooksCount, neverUsedLooksCount, usagePercentage, mostUsedLooks }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
        </div>
        <ArinChat />
      </div>
    )
  }

  const clothingCategoryStats = getClothingCategoryStats()
  const clothingUsageStats = getClothingUsageOverview()
  const materialStats = getMaterialStats() // Call the function here
  const lookStats = getLookUsageStats()

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Estadísticas de tu Armario</h1>

      <Tabs defaultValue="clothing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="clothing">Prendas</TabsTrigger>
          <TabsTrigger value="looks">Looks</TabsTrigger>
          <TabsTrigger value="sustainability">Sostenibilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="clothing" className="mt-6 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Resumen de Prendas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-primary">{clothingUsageStats.totalItems}</div>
                <p className="text-muted-foreground">Prendas en total</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">{clothingUsageStats.usedItemsCount}</div>
                <p className="text-muted-foreground">Prendas usadas</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600">{clothingUsageStats.neverUsedCount}</div>
                <p className="text-muted-foreground">Prendas sin usar</p>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clothingCategoryStats.length > 0 ? (
                <SimpleBarChart data={clothingCategoryStats} />
              ) : (
                <p className="text-muted-foreground text-center">No hay datos de categorías.</p>
              )}
            </CardContent>
          </Card>

          {/* Material Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Materiales Predominantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materialStats.length > 0 ? (
                <SimpleBarChart data={materialStats} />
              ) : (
                <p className="text-muted-foreground text-center">No hay datos de materiales registrados.</p>
              )}
            </CardContent>
          </Card>

          {/* Most Used Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Prendas Más Usadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clothingUsageStats.mostUsed.length > 0 ? (
                <SimpleBarChart data={clothingUsageStats.mostUsed} />
              ) : (
                <p className="text-muted-foreground text-center">Aún no hay prendas usadas.</p>
              )}
            </CardContent>
          </Card>

          {/* Least Used Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Prendas Menos Usadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clothingUsageStats.leastUsed.length > 0 ? (
                <SimpleBarChart data={clothingUsageStats.leastUsed} />
              ) : (
                <p className="text-muted-foreground text-center">
                  Todas tus prendas están bien usadas o no hay suficientes datos.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Unused Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Prendas Sin Usar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clothingUsageStats.unusedItems.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {clothingUsageStats.unusedItems.map((item) => (
                    <li key={item.name} className="capitalize text-muted-foreground">
                      {item.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center">¡Excelente! Todas tus prendas han sido usadas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="looks" className="mt-6 space-y-6">
          {/* Look Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Resumen de Looks
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-primary">{lookStats.totalLooks}</div>
                <p className="text-muted-foreground">Looks guardados</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">{lookStats.usedLooksCount}</div>
                <p className="text-muted-foreground">Looks usados</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600">{lookStats.neverUsedLooksCount}</div>
                <p className="text-muted-foreground">Looks sin usar</p>
              </div>
            </CardContent>
          </Card>

          {/* Most Used Looks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Looks Más Usados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lookStats.mostUsedLooks.length > 0 ? (
                <SimpleBarChart data={lookStats.mostUsedLooks} />
              ) : (
                <p className="text-muted-foreground text-center">Aún no hay looks usados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sustainability" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Consejos de Sostenibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ¡Felicidades por usar ARIN para maximizar tu armario! Aquí tienes algunos consejos para ser aún más
                  sostenible:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    **Reutiliza y Recicla**: Considera donar o reciclar prendas que ya no uses en lugar de tirarlas.
                  </li>
                  <li>
                    **Cuidado de la Ropa**: Lava la ropa con agua fría y sécala al aire libre para prolongar su vida
                    útil y reducir el consumo de energía.
                  </li>
                  <li>
                    **Compra Consciente**: Antes de comprar algo nuevo, pregúntate si realmente lo necesitas y si puedes
                    crear un look similar con lo que ya tienes.
                  </li>
                  <li>
                    **Repara en lugar de Reemplazar**: Un pequeño arreglo puede darle una segunda vida a tu prenda
                    favorita.
                  </li>
                  <li>
                    **Intercambio de Ropa**: Organiza o participa en intercambios de ropa con amigos para renovar tu
                    armario de forma sostenible.
                  </li>
                </ul>
                <p>Cada pequeña acción cuenta para un armario más sostenible y un planeta más saludable.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ArinChat />
    </div>
  )
}
