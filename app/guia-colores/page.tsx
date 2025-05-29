"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorCombinationGuide } from "@/components/color-combination-guide"
import { COLORS, COLOR_CATEGORIES } from "@/lib/color-config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ColorGuidePage() {
  const [selectedColor, setSelectedColor] = useState<string>("")

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Guía de Colores</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ColorCombinationGuide />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paleta de colores</CardTitle>
              <CardDescription>Explora todos los colores disponibles en la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="neutros">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                  {Object.entries(COLOR_CATEGORIES).map(([category, label]) => (
                    <TabsTrigger key={category} value={category}>
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(COLOR_CATEGORIES).map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {COLORS.filter((color) => color.category === category).map((color) => (
                        <div key={color.id} className="flex flex-col items-center gap-1">
                          <div
                            className="w-full aspect-square rounded-md border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs text-center">{color.displayName}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consejos para combinar colores</CardTitle>
              <CardDescription>Aprende a crear combinaciones armoniosas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Reglas básicas</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Los colores neutros (negro, blanco, gris, beige) combinan con casi todo</li>
                  <li>Colores complementarios (opuestos en el círculo cromático) crean contraste</li>
                  <li>Colores análogos (cercanos en el círculo cromático) crean armonía</li>
                  <li>Evita combinar más de 3 colores diferentes en un mismo look</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Combinaciones clásicas</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-black text-white">
                      Negro
                    </Badge>
                    <span>+</span>
                    <Badge variant="outline" className="bg-white">
                      Blanco
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">Elegante y atemporal</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" style={{ backgroundColor: "#000080", color: "white" }}>
                      Azul marino
                    </Badge>
                    <span>+</span>
                    <Badge variant="outline" style={{ backgroundColor: "#F5F5DC" }}>
                      Beige
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">Clásico y sofisticado</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" style={{ backgroundColor: "#A67B5B", color: "white" }}>
                      Marrón
                    </Badge>
                    <span>+</span>
                    <Badge variant="outline" style={{ backgroundColor: "#87CEEB" }}>
                      Celeste
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">Equilibrado y natural</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
