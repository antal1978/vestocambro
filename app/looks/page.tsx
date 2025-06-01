"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Heart, Calendar, TrendingUp } from "lucide-react"
// REMOVED: import { ArinChat } from "@/components/arin-chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

type SavedLook = {
  id: string
  name: string
  description?: string
  items: any[]
  occasion: string
  climate: string
  style: string
  dateCreated: string
  timesUsed?: number
  lastUsed?: string
  isFavorite?: boolean
}

const LooksPage = () => {
  const router = useRouter()
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLookId, setSelectedLookId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedLooks()
  }, [])

  const fetchSavedLooks = () => {
    try {
      // Get saved looks from localStorage
      const storedLooks = localStorage.getItem("savedLooks")
      const looks: SavedLook[] = storedLooks ? JSON.parse(storedLooks) : []

      // Get usage stats from localStorage
      const storedUsage = localStorage.getItem("usedLooks")
      const usageHistory = storedUsage ? JSON.parse(storedUsage) : []

      // Calculate usage stats for each look
      const looksWithStats = looks.map((look) => {
        const usageCount = usageHistory.filter((usage: any) =>
          usage.items.every((item: any) => look.items.some((lookItem: any) => lookItem.id === item.id)),
        ).length

        const lastUsage = usageHistory
          .filter((usage: any) =>
            usage.items.every((item: any) => look.items.some((lookItem: any) => lookItem.id === item.id)),
          )
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        return {
          ...look,
          timesUsed: usageCount,
          lastUsed: lastUsage?.date,
        }
      })

      setSavedLooks(looksWithStats)
    } catch (error) {
      console.error("Failed to fetch saved looks:", error)
      toast({
        title: "Error",
        description: "Failed to load saved looks.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogUsage = (look: SavedLook) => {
    try {
      // Get existing usage history
      const storedUsage = localStorage.getItem("usedLooks")
      const usageHistory = storedUsage ? JSON.parse(storedUsage) : []

      // Add new usage record
      const newUsage = {
        id: Date.now().toString(),
        items: look.items,
        date: new Date().toISOString(),
        occasion: look.occasion,
        climate: look.climate,
        style: look.style,
        lookId: look.id,
      }

      usageHistory.push(newUsage)
      localStorage.setItem("usedLooks", JSON.stringify(usageHistory))

      // Also update clothing usage stats
      const clothingUsage = localStorage.getItem("clothingUsage")
      const usageRecord = clothingUsage ? JSON.parse(clothingUsage) : {}

      look.items.forEach((item) => {
        if (!usageRecord[item.id]) {
          usageRecord[item.id] = { count: 0, lastUsed: "" }
        }
        usageRecord[item.id].count++
        usageRecord[item.id].lastUsed = new Date().toISOString()
      })

      localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))

      toast({
        title: "¡Genial!",
        description: "Uso registrado correctamente. ARIN aprenderá de tus preferencias.",
      })

      // Refresh the looks to update usage stats
      fetchSavedLooks()
    } catch (error) {
      console.error("Failed to log usage:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el uso.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = (lookId: string) => {
    try {
      const updatedLooks = savedLooks.map((look) =>
        look.id === lookId ? { ...look, isFavorite: !look.isFavorite } : look,
      )

      setSavedLooks(updatedLooks)
      localStorage.setItem("savedLooks", JSON.stringify(updatedLooks))

      const look = updatedLooks.find((l) => l.id === lookId)
      toast({
        title: look?.isFavorite ? "💕 Añadido a favoritos" : "Removido de favoritos",
        description: look?.isFavorite
          ? "Este look ahora está en tus favoritos"
          : "Este look ya no está en tus favoritos",
      })
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLook = (lookId: string) => {
    try {
      const updatedLooks = savedLooks.filter((look) => look.id !== lookId)
      setSavedLooks(updatedLooks)
      localStorage.setItem("savedLooks", JSON.stringify(updatedLooks))

      toast({
        title: "Look eliminado",
        description: "El look ha sido eliminado de tu colección.",
      })
    } catch (error) {
      console.error("Failed to delete look:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el look.",
        variant: "destructive",
      })
    } finally {
      closeDeleteDialog()
    }
  }

  const openDeleteDialog = (lookId: string) => {
    setSelectedLookId(lookId)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setSelectedLookId(null)
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tus looks...</p>
        </div>
        {/* REMOVED: <ArinChat /> */}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Looks Guardados</h1>
          <p className="text-muted-foreground mt-2">
            {savedLooks.length === 0
              ? "Aún no tienes looks guardados"
              : `${savedLooks.length} look${savedLooks.length !== 1 ? "s" : ""} en tu colección`}
          </p>
        </div>

        <Button onClick={() => router.push("/suggest")} className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Crear nuevo look
        </Button>
      </div>

      {savedLooks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes looks guardados</h3>
            <p className="text-muted-foreground mb-6">
              Empezá creando tu primer look con ARIN y guardalo para usarlo después
            </p>
            <Button onClick={() => router.push("/suggest")} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Crear mi primer look
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedLooks.map((look) => (
            <Card key={look.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{look.name || "Look sin nombre"}</CardTitle>
                    <CardDescription className="mt-1">Creado el {formatDate(look.dateCreated)}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(look.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Heart className={`h-4 w-4 ${look.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Look preview */}
                <div className="grid grid-cols-3 gap-2">
                  {look.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {look.items.length > 3 && (
                    <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-sm text-muted-foreground">
                      +{look.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Look details */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {look.occasion}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {look.climate}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {look.style}
                  </Badge>
                </div>

                {/* Usage stats */}
                {(look.timesUsed || 0) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Usado {look.timesUsed} {look.timesUsed === 1 ? "vez" : "veces"}
                    </div>
                    {look.lastUsed && <div className="text-xs">Última vez: {formatDate(look.lastUsed)}</div>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleLogUsage(look)} size="sm" className="flex-1">
                    Usar hoy
                  </Button>
                  <Button
                    onClick={() => openDeleteDialog(look.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Look</DialogTitle>
            <DialogDescription>
              ¿Estás segura de que querés eliminar este look? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => selectedLookId && handleDeleteLook(selectedLookId)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LooksPage
