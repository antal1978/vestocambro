"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Shirt,
  Users,
  Briefcase,
  PartyPopper,
  Sun,
  Cloud,
  Snowflake,
  PinIcon as PantsIcon,
  DiamondIcon as DressIcon,
  PocketIcon as JacketIcon,
  FootprintsIcon as ShoesIcon,
  ActivityIcon as AccessoryIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Iconos personalizados para prendas
const ClothingIcons = {
  remera: Shirt,
  pantalon: PantsIcon,
  vestido: DressIcon,
  chaqueta: JacketIcon,
  zapatos: ShoesIcon,
  accesorio: AccessoryIcon,
}

// Datos mínimos de ejemplo
const exampleItems = [
  {
    id: 1,
    name: "Remera Básica Blanca",
    type: "remera",
    color: "Blanco",
    occasion: "casual",
    climate: "templado",
    icon: Shirt,
    description: "Perfecta para combinar con todo",
  },
  {
    id: 2,
    name: "Jeans Azul Clásico",
    type: "pantalon",
    color: "Azul",
    occasion: "casual",
    climate: "templado",
    icon: PantsIcon,
    description: "El básico que nunca falla",
  },
  {
    id: 3,
    name: "Blazer Negro Formal",
    type: "chaqueta",
    color: "Negro",
    occasion: "formal",
    climate: "templado",
    icon: JacketIcon,
    description: "Para looks profesionales",
  },
  {
    id: 4,
    name: "Vestido Floral",
    type: "vestido",
    color: "Multicolor",
    occasion: "casual",
    climate: "caluroso",
    icon: DressIcon,
    description: "Ideal para días soleados",
  },
  {
    id: 5,
    name: "Zapatillas Blancas",
    type: "zapatos",
    color: "Blanco",
    occasion: "casual",
    climate: "templado",
    icon: ShoesIcon,
    description: "Comodidad y estilo",
  },
  {
    id: 6,
    name: "Cartera Negra",
    type: "accesorio",
    color: "Negro",
    occasion: "formal",
    climate: "templado",
    icon: AccessoryIcon,
    description: "El toque final perfecto",
  },
]

// Ejemplo de look generado
const exampleLook = {
  occasion: "Trabajo",
  climate: "Templado",
  items: [
    { name: "Remera Básica Blanca", type: "remera", icon: Shirt },
    { name: "Blazer Negro Formal", type: "chaqueta", icon: JacketIcon },
    { name: "Jeans Azul Clásico", type: "pantalon", icon: PantsIcon },
    { name: "Zapatillas Blancas", type: "zapatos", icon: ShoesIcon },
    { name: "Cartera Negra", type: "accesorio", icon: AccessoryIcon },
  ],
}

const occasionIcons = {
  casual: Users,
  formal: Briefcase,
  fiesta: PartyPopper,
}

const climateIcons = {
  caluroso: Sun,
  templado: Cloud,
  frio: Snowflake,
}

const occasionColors = {
  casual: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  formal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  fiesta: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
}

const climateColors = {
  caluroso: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  templado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  frio: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

export default function EjemplosPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<"prendas" | "look">("prendas")

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-background">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ejemplos de Uso</h1>
            <p className="text-muted-foreground">Descubrí cómo funciona ARIN con estos ejemplos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={selectedTab === "prendas" ? "default" : "outline"}
            onClick={() => setSelectedTab("prendas")}
            className="flex items-center gap-2"
          >
            <Shirt className="h-4 w-4" />
            Prendas de Ejemplo
          </Button>
          <Button
            variant={selectedTab === "look" ? "default" : "outline"}
            onClick={() => setSelectedTab("look")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Look Generado
          </Button>
        </div>

        {/* Content */}
        {selectedTab === "prendas" && (
          <div className="space-y-8">
            {/* Intro */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">¿Cómo categorizar tus prendas?</h2>
                <p className="text-muted-foreground mb-4">
                  Cada prenda que cargues necesita esta información básica para que ARIN pueda crear looks perfectos:
                </p>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>
                      <strong>Tipo:</strong> Remera, pantalón, etc.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>
                      <strong>Color:</strong> Principal de la prenda
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>
                      <strong>Ocasión:</strong> Casual, formal, fiesta
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>
                      <strong>Clima:</strong> Caluroso, templado, frío
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Items Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exampleItems.map((item) => {
                const IconComponent = item.icon
                const OccasionIcon = occasionIcons[item.occasion as keyof typeof occasionIcons]
                const ClimateIcon = climateIcons[item.climate as keyof typeof climateIcons]

                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tipo:</span>
                        <Badge variant="secondary" className="capitalize">
                          {item.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Color:</span>
                        <Badge variant="outline">{item.color}</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Ocasión:</span>
                        <Badge className={occasionColors[item.occasion as keyof typeof occasionColors]}>
                          <OccasionIcon className="h-3 w-3 mr-1" />
                          {item.occasion}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Clima:</span>
                        <Badge className={climateColors[item.climate as keyof typeof climateColors]}>
                          <ClimateIcon className="h-3 w-3 mr-1" />
                          {item.climate}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* CTA */}
            <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-3">¿Lista para cargar tus prendas?</h3>
                <p className="text-muted-foreground mb-6">
                  Con solo 5-6 prendas ya podés empezar a crear looks increíbles
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/upload">
                    <Button size="lg" className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Cargar mis prendas
                    </Button>
                  </Link>
                  <Link href="/onboarding">
                    <Button variant="outline" size="lg">
                      Volver a la guía
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "look" && (
          <div className="space-y-8">
            {/* Intro */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">Así genera ARIN tus looks</h2>
                <p className="text-muted-foreground">
                  Cuando tengas prendas cargadas, ARIN analizará la ocasión y el clima para sugerirte combinaciones
                  perfectas como esta:
                </p>
              </CardContent>
            </Card>

            {/* Generated Look Example */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Look Sugerido por ARIN</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={occasionColors.formal}>
                      <Briefcase className="h-3 w-3 mr-1" />
                      {exampleLook.occasion}
                    </Badge>
                    <Badge className={climateColors.templado}>
                      <Cloud className="h-3 w-3 mr-1" />
                      {exampleLook.climate}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Look Items */}
                <div className="space-y-4">
                  {exampleLook.items.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ARIN's Explanation */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">¿Por qué ARIN eligió esta combinación?</p>
                      <p className="text-sm text-muted-foreground">
                        "Elegí esta combinación porque el blazer negro le da formalidad para el trabajo, pero los jeans
                        y zapatillas mantienen comodidad. La remera blanca es versátil y la cartera negra completa el
                        look profesional pero relajado."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" variant="outline">
                    💕 Me gusta
                  </Button>
                  <Button className="flex-1" variant="outline">
                    🔄 Generar otro
                  </Button>
                  <Button className="flex-1" variant="outline">
                    💾 Guardar look
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Ocasión Perfecta</h3>
                  <p className="text-sm text-muted-foreground">ARIN considera si es para trabajo, casual o fiesta</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Clima Apropiado</h3>
                  <p className="text-sm text-muted-foreground">Sugiere prendas según la temperatura del día</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shirt className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Combinaciones Armoniosas</h3>
                  <p className="text-sm text-muted-foreground">Colores y estilos que funcionan perfectamente juntos</p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-3">¿Querés que ARIN cree looks para vos?</h3>
                <p className="text-muted-foreground mb-6">
                  Cargá tus prendas y empezá a recibir sugerencias personalizadas
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/upload">
                    <Button size="lg" className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Empezar ahora
                    </Button>
                  </Link>
                  <Link href="/suggest">
                    <Button variant="outline" size="lg">
                      Ver sugerencias
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
