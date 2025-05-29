"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, X, Maximize2, Minimize2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

export function ArinChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cargar perfil del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserProfile(JSON.parse(storedPreferences))
    } else {
      // Si no hay perfil, redirigir a onboarding
      router.push("/onboarding")
    }
  }, [router])

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

      // Mensaje inicial de ARIN
      const greeting: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: userProfile
          ? `¡Hola ${userProfile.userName}! 💕 ¿En qué puedo ayudarte hoy? ¿Querés que te sugiera un look o tenés alguna pregunta sobre tu armario?`
          : "¡Hola! 💕 ¿En qué puedo ayudarte hoy? ¿Querés que te sugiera un look o tenés alguna pregunta sobre tu armario?",
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
    // Palabras clave para detectar intenciones
    const keywords = {
      suggestLook: ["look", "outfit", "vestir", "ropa", "sugerencia", "sugerir", "crear", "generar", "armario"],
      askStyle: ["estilo", "combinar", "combina", "color", "colores", "moda", "tendencia"],
      greeting: ["hola", "buenas", "hey", "saludos", "qué tal", "como estas", "cómo estás"],
      thanks: ["gracias", "genial", "excelente", "perfecto", "buenísimo"],
    }

    const message = userMessage.toLowerCase()

    // Detectar intención
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
        ? `¡Hola de nuevo, ${userProfile.userName}! 💕 Siempre es un gusto charlar con vos. ¿En qué puedo ayudarte hoy?`
        : "¡Hola! 💕 ¿Cómo estás? ¿En qué puedo ayudarte hoy?"
    }

    if (keywords.thanks.some((word) => message.includes(word))) {
      return "¡De nada! 😊 Siempre es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?"
    }

    if (message.includes("crear look") || message.includes("nuevo look")) {
      return "¡Vamos a crear un look! Te voy a llevar a la página de sugerencias para que podamos trabajar juntas en algo increíble."
    }

    // Respuesta genérica
    const genericResponses = [
      userProfile
        ? `Me encanta cuando charlamos, ${userProfile.userName}. ¿Querés que te ayude a crear un look para hoy?`
        : "Me encanta charlar con vos. ¿Querés que te ayude a crear un look para hoy?",
      "¿Te gustaría explorar nuevas combinaciones con las prendas que ya tenés?",
      "¿Querés que te muestre cómo combinar alguna prenda específica de tu armario?",
      "¿Necesitás un look para alguna ocasión especial?",
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
      // Verificar si el usuario quiere crear un look
      if (
        currentInput.toLowerCase().includes("crear look") ||
        currentInput.toLowerCase().includes("nuevo look") ||
        currentInput.toLowerCase().includes("sugerir look") ||
        currentInput.toLowerCase().includes("generar look")
      ) {
        // Mensaje de redirección
        const redirectMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "¡Perfecto! Vamos a crear un look juntas. Te llevo a la página de sugerencias...",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, redirectMessage])

        // Redirigir después de un momento
        setTimeout(() => {
          router.push("/suggest")
        }, 1500)
      } else {
        // Generar respuesta normal
        const response = await generateArinResponse(currentInput)

        // Mensaje de ARIN
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      }
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
