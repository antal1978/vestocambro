"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, X, Maximize2, Minimize2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: Date
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type UserProfile = {
  userName: string
  favoriteColors: string[]
  dislikedColors: string[]
  preferredStyle: string
  occasions: string[]
  bodyType?: string
  likedOutfits: string[]
  dislikedOutfits: string[]
  lifestyle?: string
  personalityTraits?: string[]
  onboardingCompleted: boolean
}

const ArinChat: React.FC<{ autoOpen?: boolean }> = ({ autoOpen = false }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [isMinimized, setIsMinimized] = useState(!autoOpen)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cargar perfil del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserProfile(JSON.parse(storedPreferences))

      // Si autoOpen es true, abrir el chat automáticamente
      if (autoOpen) {
        openChat()
      }
    } else {
      // Si no hay perfil, usar valores por defecto
      const defaultProfile: UserProfile = {
        userName: "Usuario",
        favoriteColors: [],
        dislikedColors: [],
        preferredStyle: "",
        occasions: [],
        likedOutfits: [],
        dislikedOutfits: [],
        onboardingCompleted: false,
      }
      setUserProfile(defaultProfile)

      if (autoOpen) {
        openChat()
      }
    }
  }, [autoOpen])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Abrir chat
  const openChat = async () => {
    setIsOpen(true)
    setIsMinimized(false)

    if (messages.length === 0) {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mensaje inicial de ARIN con presentación completa
      const greeting: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: userProfile
          ? `¡Hola ${userProfile.userName}! 💕 Soy ARIN, tu asistente personal de moda.

Mi misión es ayudarte a optimizar el uso de todas las prendas que tenés en tu armario para crear looks increíbles, revalorizando cada pieza que ya tenés.

Creo firmemente que no necesitás comprar más ropa para verte espectacular - solo necesitás aprender a combinar mejor lo que ya tenés. Paulatinamente, también te voy a enseñar cómo tomar buenas decisiones de compra para que tu ropa sea funcional, dure más y nada quede olvidado en el fondo del armario. ✨

¿En qué puedo ayudarte hoy?

• Subir una nueva prenda
• Ver tu colección
• Crear un look nuevo
• Ver tus looks guardados
• Revisar estadísticas`
          : `¡Hola! 💕 Soy ARIN, tu asistente personal de moda.

Mi misión es ayudarte a optimizar el uso de todas las prendas que tenés en tu armario para crear looks increíbles, revalorizando cada pieza que ya tenés.

Creo firmemente que no necesitás comprar más ropa para verte espectacular - solo necesitás aprender a combinar mejor lo que ya tenés. Paulatinamente, también te voy a enseñar cómo tomar buenas decisiones de compra para que tu ropa sea funcional, dure más y nada quede olvidado en el fondo del armario. ✨

¿En qué puedo ayudarte hoy?

• Subir una nueva prenda
• Ver tu colección
• Crear un look nuevo
• Ver tus looks guardados
• Revisar estadísticas`,
        timestamp: new Date(),
      }

      setMessages([greeting])
      setIsLoading(false)
    }
  }

  // Cerrar chat
  const closeChat = () => {
    setIsOpen(false)
  }

  // Minimizar/maximizar chat
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Generar respuesta de ARIN
  const generateArinResponse = async (userMessage: string): Promise<string> => {
    // Palabras clave para detectar intenciones de navegación
    const navigationKeywords = {
      upload: ["subir", "cargar", "agregar", "nueva prenda", "añadir ropa", "foto", "fotografía", "imagen"],
      gallery: ["galería", "ver prendas", "mis prendas", "armario", "guardarropa", "ropa", "prendas"],
      suggest: ["sugerir", "look", "outfit", "combinación", "vestir", "combinar", "crear look", "generar look"],
      looks: ["mis looks", "looks guardados", "favoritos", "combinaciones guardadas"],
      stats: ["estadísticas", "stats", "uso", "análisis", "datos"],
      guide: ["guía", "ayuda", "tutorial", "cómo", "instrucciones", "manual"],
    }

    // Palabras clave para detectar intenciones generales
    const keywords = {
      suggestLook: ["look", "outfit", "vestir", "ropa", "sugerencia", "sugerir", "crear", "generar", "armario"],
      askStyle: ["estilo", "combinar", "combina", "color", "colores", "moda", "tendencia"],
      greeting: ["hola", "buenas", "hey", "saludos", "qué tal", "como estas", "cómo estás"],
      thanks: ["gracias", "genial", "excelente", "perfecto", "buenísimo"],
      help: ["ayuda", "ayudame", "no sé", "opciones", "qué puedo hacer", "funciones", "qué hacés"],
    }

    const message = userMessage.toLowerCase()

    // Detectar intención de navegación
    for (const [section, words] of Object.entries(navigationKeywords)) {
      if (words.some((word) => message.includes(word))) {
        // Preparar navegación
        setTimeout(() => {
          router.push(`/${section}`)
        }, 1000)

        const responses = {
          upload: "¡Vamos a subir una nueva prenda! Te llevo a la sección de carga...",
          gallery: "¡Perfecto! Vamos a ver tu colección de prendas...",
          suggest: "¡Genial! Vamos a crear un look nuevo juntas...",
          looks: "Te llevo a ver tus looks guardados...",
          stats: "Vamos a revisar las estadísticas de tu armario...",
          guide: "Te muestro la guía de uso para que aproveches al máximo la app...",
        }

        return responses[section as keyof typeof responses]
      }
    }

    // Detectar intención de ayuda/opciones
    if (keywords.help.some((word) => message.includes(word))) {
      return `${userProfile?.userName ? `${userProfile.userName}, ` : ""}soy ARIN, tu asistente de armario personal. Puedo ayudarte con:

• Subir una nueva prenda a tu armario
• Ver tu colección de prendas
• Crear un look nuevo
• Ver tus looks guardados
• Revisar estadísticas de uso
• Mostrarte la guía de uso

¿Qué te gustaría hacer?`
    }

    // Resto de la lógica existente
    if (keywords.suggestLook.some((word) => message.includes(word))) {
      return userProfile
        ? `¡Claro ${userProfile.userName}! Me encantaría ayudarte a crear un look. ¿Para qué ocasión lo necesitás? ¿Casual, trabajo, salida...?`
        : "¡Claro! Me encantaría ayudarte a crear un look. ¿Para qué ocasión lo necesitás? ¿Casual, trabajo, salida...?"
    }

    if (keywords.askStyle.some((word) => message.includes(word))) {
      if (userProfile && userProfile.favoriteColors.length > 0) {
        return `Sobre estilos y colores, recordá que tus favoritos son ${userProfile.favoriteColors.join(", ")}. Estos combinan muy bien con tonos neutros como blanco, negro o beige. ¿Querés que te muestre algunas combinaciones específicas?`
      }
      return "Los colores neutros como negro, blanco y gris combinan con todo. Para un look más interesante, podés añadir un toque de color con accesorios. ¿Te gustaría que te muestre algunas combinaciones?"
    }

    if (keywords.greeting.some((word) => message.includes(word))) {
      return userProfile
        ? `¡Hola ${userProfile.userName}! 💕 ¿En qué puedo ayudarte hoy? Puedo mostrarte tus prendas, crear un look, o lo que necesites.`
        : "¡Hola! 💕 ¿En qué puedo ayudarte hoy? Puedo mostrarte tus prendas, crear un look, o lo que necesites."
    }

    if (keywords.thanks.some((word) => message.includes(word))) {
      return "¡De nada! 😊 Siempre es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?"
    }

    // Respuesta genérica
    const genericResponses = [
      userProfile
        ? `${userProfile.userName}, soy tu asistente de armario personal. ¿Querés que te ayude a navegar por la app? Puedo mostrarte tus prendas, crear un look, o lo que necesites.`
        : "Soy tu asistente de armario personal. ¿Querés que te ayude a navegar por la app? Puedo mostrarte tus prendas, crear un look, o lo que necesites.",
      "Como tu asistente de armario, puedo ayudarte a explorar tu colección o crear un nuevo look.",
      "Estoy aquí para ser tu asistente de armario. ¿Necesitás ayuda para encontrar algo específico?",
      "Soy tu asistente personal de armario. ¿Querés ver tus prendas o crear una combinación nueva?",
    ]

    return genericResponses[Math.floor(Math.random() * genericResponses.length)]
  }

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Generar respuesta
      const response = await generateArinResponse(currentInput)

      // Mensaje de ARIN
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error al generar respuesta:", error)

      // Mensaje de error
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error. ¿Podés intentarlo de nuevo?",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Si no está abierto, mostrar botón flotante
  if (!isOpen) {
    return (
      <Button
        onClick={openChat}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 md:w-96 shadow-lg transition-all duration-300 ${isMinimized ? "h-14" : "h-[500px]"}`}>
        <CardHeader
          className="border-b p-3 flex flex-row items-center justify-between cursor-pointer"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </Avatar>
            <CardTitle className="text-sm">ARIN</CardTitle>
          </div>
          <div className="flex gap-1">
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <>
                <Minimize2 className="h-4 w-4 text-muted-foreground" />
                <X
                  className="h-4 w-4 text-muted-foreground ml-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeChat()
                  }}
                />
              </>
            )}
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-3 h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg p-3 max-w-[85%] ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Escribiendo...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="border-t p-3">
              <div className="flex w-full gap-2">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 resize-none min-h-[40px] max-h-[100px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button size="sm" onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

export { ArinChat }
