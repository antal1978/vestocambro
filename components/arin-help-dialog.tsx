"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Bot, X } from "lucide-react"

type Message = {
  id: string
  role: "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

type UserProfile = {
  userName: string
}

interface ArinHelpDialogProps {
  isOpen: boolean
  onClose: () => void
  helpContext: string
  onAction?: (action: string) => void
}

const helpContexts = {
  "mi-armario": {
    title: "Mi Armario",
    introduction: `¡Hola! 💕 Soy ARIN, tu asistente personal de moda.
Mi misión es ayudarte a optimizar tu armario y crear looks increíbles con lo que ya tenés. ✨

En "Mi Armario" podés:
📸 **Subir prendas**
👗 **Ver tu colección**
🏷️ **Organizar por categorías**
✨ **Generar looks desde una prenda**

¿Querés que te guíe o preferís explorar?`,
    suggestions: ["Guíame paso a paso", "Subir mi primera prenda", "Ver ejemplos", "Explorar por mi cuenta"],
  },
  "sugerir-look": {
    title: "Sugerir Look",
    introduction: `¡Perfecto! Esta es una de mis funciones favoritas 💫

En "Sugerir Look" te ayudaré a crear combinaciones increíbles. Necesito saber:
🎯 **Ocasión** (trabajo, casual, fiesta, etc.)
🌤️ **Clima** (caluroso, templado, frío)
👗 **Prenda específica** (si querés usar una)

Mi objetivo es que redescubras prendas y veas tu armario con ojos nuevos.

¿Empezamos a crear tu look?`,
    suggestions: ["¡Sí, crear mi look!", "Ver ejemplos de looks", "Consejos de combinación", "Volver"],
  },
  looks: {
    title: "Mis Looks",
    introduction: `¡Aquí están todos tus looks guardados! 💕

En esta sección podés:
💾 **Ver looks**
📅 **Registrar uso**
⭐ **Marcar favoritos**
🔄 **Recrear looks**
📊 **Ver estadísticas**

Cada look es parte de tu biblioteca de estilo personal.

¿Querés que te ayude a organizar o preferís explorar?`,
    suggestions: ["Ayúdame a organizar", "Ver mis favoritos", "Crear un look nuevo", "Ver estadísticas"],
  },
  estadisticas: {
    title: "Estadísticas",
    introduction: `¡Las estadísticas son súper útiles para optimizar tu armario! 📊

Acá podés ver:
👗 **Prendas más usadas**
😴 **Prendas olvidadas**
🎯 **Ocasiones frecuentes**
💡 **Sugerencias de optimización**

Esta info te ayuda a tomar mejores decisiones y tener un guardarropa más funcional.

¿Querés que analicemos juntas tus datos?`,
    suggestions: ["Analizar mis datos", "Ver prendas olvidadas", "Consejos de optimización", "Volver"],
  },
  guia: {
    title: "Guía de Uso",
    introduction: `¡Bienvenida a la guía completa de ARIN! 📚

Podés elegir entre:
📖 **Leer la guía completa**
⚡ **Resumen rápido**
🎯 **Guía específica**
💬 **Preguntarme directamente**

La guía te ayudará a usar ARIN al máximo.

¿Qué preferís?`,
    suggestions: ["Resumen rápido", "Leer guía completa", "Pregunta específica", "Empezar a usar la app"],
  },
}

export function ArinHelpDialog({ isOpen, onClose, helpContext, onAction }: ArinHelpDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar perfil del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserProfile(JSON.parse(storedPreferences))
    }
  }, [])

  // Iniciar conversación automáticamente
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startHelpConversation()
    }
  }, [isOpen, helpContext])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Iniciar la conversación de ayuda
  const startHelpConversation = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userName = userProfile?.userName || ""
    const context = helpContexts[helpContext as keyof typeof helpContexts]

    if (!context) {
      setIsLoading(false)
      return
    }

    const greeting = userName ? context.introduction.replace("¡Hola!", `¡Hola ${userName}!`) : context.introduction

    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
      suggestions: context.suggestions,
    }

    setMessages([initialMessage])
    setIsLoading(false)
  }

  // Manejar sugerencia rápida
  const handleQuickSuggestion = (suggestion: string) => {
    if (onAction) {
      onAction(suggestion)
    }
    onClose()
  }

  if (!isOpen) return null

  const context = helpContexts[helpContext as keyof typeof helpContexts]
  if (!context) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
              <CardTitle className="text-lg">ARIN - {context.title}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex justify-start">
                <div className="rounded-lg p-3 max-w-[95%] bg-muted">
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                  {/* Sugerencias rápidas */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSuggestion(suggestion)}
                          className="text-xs"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">ARIN está preparando la ayuda...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="border-t p-4">
          <Button onClick={onClose} className="w-full">
            Entendido, ¡empecemos!
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
