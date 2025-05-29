"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type ConversationState =
  | "idle"
  | "asking_occasion"
  | "asking_weather"
  | "asking_base_item"
  | "generating_suggestions"
  | "showing_suggestions"
  | "completed"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface ArinSuggestChatProps {
  isOpen: boolean
  onClose: () => void
  onDecision: (climate: string, occasion: string) => void
  items: ClothingItem[]
  baseItem?: ClothingItem | null
  startWithPresentation?: boolean
}

export const ArinSuggestChat: React.FC<ArinSuggestChatProps> = ({
  isOpen,
  onClose,
  onDecision,
  items,
  baseItem,
  startWithPresentation = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationState, setConversationState] = useState<ConversationState>("idle")
  const [isLoading, setIsLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [userProfile, setUserProfile] = useState<{ userName?: string }>({})
  const [selectedOccasion, setSelectedOccasion] = useState<string>("")
  const [selectedClimate, setSelectedClimate] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cargar perfil del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserProfile(JSON.parse(storedPreferences))
    }
  }, [])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Iniciar con presentación si se solicita
  useEffect(() => {
    if (isOpen && startWithPresentation && messages.length === 0) {
      setIsLoading(true)

      // Simular tiempo de "pensamiento" de ARIN
      setTimeout(() => {
        const userName = userProfile?.userName || ""

        const presentationMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `¡Hola${userName ? " " + userName : ""}! 💕 Soy ARIN, tu asistente personal de moda.

Mi misión es ayudarte a optimizar el uso de todas las prendas que tenés en tu armario para crear looks increíbles, revalorizando cada pieza que ya tenés.

Creo firmemente que no necesitás comprar más ropa para verte espectacular - solo necesitás aprender a combinar mejor lo que ya tenés. Paulatinamente, también te voy a enseñar cómo tomar buenas decisiones de compra para que tu ropa sea funcional, dure más y nada quede olvidado en el fondo del armario. ✨

Para empezar a crear tu primer look, necesito conocer un poco sobre la ocasión y el clima. ¿Me contás para qué ocasión querés armar el look?`,
          timestamp: new Date(),
          suggestions: ["Trabajo", "Casual", "Fiesta", "Formal", "En casa"],
        }

        setMessages([presentationMessage])
        setConversationState("asking_occasion")
        setIsLoading(false)
      }, 1500)
    }
  }, [isOpen, startWithPresentation, messages.length, userProfile])

  // Procesar respuesta del usuario
  const processUserResponse = async (message: string): Promise<{ content: string; suggestions?: string[] }> => {
    const lowerMessage = message.toLowerCase()

    if (conversationState === "asking_occasion") {
      // Detectar ocasión
      let occasion = ""
      if (lowerMessage.includes("trabajo") || lowerMessage.includes("oficina") || lowerMessage.includes("laboral")) {
        occasion = "formal"
      } else if (
        lowerMessage.includes("casual") ||
        lowerMessage.includes("relajado") ||
        lowerMessage.includes("cómodo")
      ) {
        occasion = "casual"
      } else if (lowerMessage.includes("fiesta") || lowerMessage.includes("salir") || lowerMessage.includes("noche")) {
        occasion = "fiesta"
      } else if (
        lowerMessage.includes("formal") ||
        lowerMessage.includes("elegante") ||
        lowerMessage.includes("serio")
      ) {
        occasion = "formal"
      } else if (lowerMessage.includes("casa") || lowerMessage.includes("hogar") || lowerMessage.includes("descanso")) {
        occasion = "homewear"
      } else {
        // Si no detectamos la ocasión, usar el mensaje tal como viene
        occasion = message.toLowerCase()
      }

      setSelectedOccasion(occasion)
      setConversationState("asking_weather")

      return {
        content: `¡Perfecto! Entiendo que es para ${occasion}. 

Ahora necesito saber sobre el clima para elegir las prendas más adecuadas. ¿Cómo está el tiempo hoy?`,
        suggestions: ["Caluroso", "Templado", "Frío", "No sé"],
      }
    } else if (conversationState === "asking_weather") {
      // Detectar clima
      let climate = ""
      if (lowerMessage.includes("calor") || lowerMessage.includes("caluroso") || lowerMessage.includes("caliente")) {
        climate = "caluroso"
      } else if (
        lowerMessage.includes("templado") ||
        lowerMessage.includes("agradable") ||
        lowerMessage.includes("normal")
      ) {
        climate = "templado"
      } else if (lowerMessage.includes("frío") || lowerMessage.includes("frio") || lowerMessage.includes("fresco")) {
        climate = "frio"
      } else {
        climate = "templado" // Por defecto
      }

      setSelectedClimate(climate)
      setConversationState("generating_suggestions")

      // Simular generación de sugerencias
      setTimeout(() => {
        onDecision(climate, selectedOccasion)
        router.push(`/suggest-results?occasion=${selectedOccasion}&climate=${climate}`)
      }, 3000)

      return {
        content: `¡Excelente! Con ${selectedOccasion} y clima ${climate}, ya tengo todo lo que necesito.

✨ Estoy analizando tu armario y creando el look perfecto para vos...

Esto puede tomar unos segundos mientras reviso todas tus prendas y encuentro las mejores combinaciones.`,
        suggestions: [],
      }
    }

    return {
      content: "No entendí bien... ¿podrías repetirme?",
      suggestions: [],
    }
  }

  // Manejar envío de mensaje
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isLoading) return

    // Mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      const response = await processUserResponse(textToSend)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error al procesar respuesta:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error. ¿Podés intentarlo de nuevo?",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar sugerencia rápida
  const handleQuickSuggestion = (suggestion: string) => {
    if (isLoading) return
    handleSendMessage(suggestion)
  }

  if (!isOpen) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-background">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Conversación con ARIN</h1>
              <p className="text-sm text-muted-foreground">Tu asistente personal de moda</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Creando tu look perfecto
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.length === 0 && isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">ARIN se está preparando para ayudarte...</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-left duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`rounded-lg p-4 max-w-[85%] ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === "user" ? (
                          <>
                            <span className="text-xs font-medium opacity-90">Tú</span>
                            <User className="h-3 w-3 opacity-90" />
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">ARIN</span>
                          </>
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {/* Sugerencias rápidas */}
                      {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {message.suggestions.map((suggestion, suggestionIndex) => (
                            <Button
                              key={suggestionIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickSuggestion(suggestion)}
                              className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                              disabled={isLoading}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isLoading && messages.length > 0 && (
                <div className="flex justify-start animate-in slide-in-from-left duration-300">
                  <div className="rounded-lg p-4 bg-muted border border-border flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">ARIN está pensando...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          {conversationState !== "generating_suggestions" && conversationState !== "completed" && (
            <div className="border-t p-4 bg-muted/30">
              <div className="flex w-full gap-3">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 resize-none min-h-[50px] max-h-[120px]"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="self-end"
                  size="lg"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Presiona Enter para enviar, Shift + Enter para nueva línea
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
