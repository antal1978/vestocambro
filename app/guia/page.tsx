"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Camera, Wand2, Heart, Bug, MessageSquare, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function GuiaPage() {
  const { toast } = useToast()
  const [contactoCopied, setContactoCopied] = useState(false)

  const contactoEmail = "taliercioandrea@gmail.com"
  const contactoWhatsapp = "+5491130328016"

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setContactoCopied(true)
      toast({
        title: "¡Copiado al portapapeles!",
        description: `${type} copiado. Podés pegarlo donde necesites.`,
        variant: "success",
      })

      setTimeout(() => setContactoCopied(false), 2000)
    })
  }

  const openWhatsApp = () => {
    // Formatear el número sin el signo +
    const formattedNumber = contactoWhatsapp.replace("+", "")
    // Crear el mensaje predefinido (codificado para URL)
    const message = encodeURIComponent("Hola, encontré un problema en Vestok:")
    // Abrir WhatsApp en una nueva pestaña
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <h1 className="text-2xl font-bold">Guía de ARIN</h1>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>¡Bienvenido a ARIN!</CardTitle>
            <CardDescription>
              Gracias por ayudarnos a probar esta aplicación. Esta guía te mostrará cómo usar ARIN y cómo reportar
              cualquier problema que encuentres.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ARIN es una app para organizar tu armario y crear looks con las prendas que ya tenés. Estamos en fase de
              pruebas y tu feedback es muy valioso.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Paso 1: Cargar tus prendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Tocá "Armario" en el menú inferior</li>
              <li>Tocá "Añadir prenda"</li>
              <li>Tomá una foto o seleccioná una imagen de tu prenda</li>
              <li>Completá los detalles: tipo, color, ocasión y clima</li>
              <li>Marcá si es un abrigo</li>
              <li>Tocá "Guardar prenda"</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              Probá cargar diferentes tipos de prendas: remeras, pantalones, vestidos, abrigos, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Paso 2: Generar looks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Tocá "Sugerir Look" en el menú inferior</li>
              <li>Seleccioná clima y ocasión para tu look</li>
              <li>Tocá "Generar sugerencia"</li>
              <li>Explorá el look generado</li>
              <li>Podés guardar el look o registrar que lo vas a usar</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              Probá diferentes combinaciones de clima y ocasión. También podés generar looks a partir de una prenda
              específica.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Paso 3: Guardar y gestionar looks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Después de generar un look, tocá "Guardar look"</li>
              <li>Visitá la sección "Looks" para ver tus looks guardados</li>
              <li>Podés registrar el uso de un look tocando el ícono de check</li>
              <li>Visitá "Estadísticas" para ver datos sobre el uso de tus prendas</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              Probá a guardar varios looks y registrar su uso para ver cómo funciona el sistema de estadísticas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Cómo reportar problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Si encontrás algún problema o tenés sugerencias, podés contactarme directamente. No necesitás llenar
              formularios complicados.
            </p>

            <div className="space-y-4 mt-4">
              <div className="flex flex-col space-y-2">
                <p className="font-medium">Por WhatsApp:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">{contactoWhatsapp}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contactoWhatsapp, "Número de WhatsApp")}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="font-medium">Por email:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">{contactoEmail}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contactoEmail, "Email")}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="font-medium mb-2">Al reportar un problema, por favor incluí:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Qué estabas haciendo cuando ocurrió</li>
                <li>Qué esperabas que sucediera</li>
                <li>Qué sucedió en realidad</li>
                <li>Si es posible, una captura de pantalla</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full gap-2" onClick={openWhatsApp}>
              <MessageSquare className="h-4 w-4" />
              Contactar por WhatsApp
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
