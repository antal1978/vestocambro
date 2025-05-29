"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot } from "lucide-react"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

type UserProfile = {
  userName: string
  favoriteColors: string[]
  dislikedColors: string[]
  preferredStyle: string
  occasions: string[]
}

interface ArinPostOutfitChatProps {
  outfit: ClothingItem[]
  onRegenerateOutfit: () => void
  onRecordUsage: () => void
  onSaveOutfit: () => void
  usageUpdated: boolean
}

export function ArinPostOutfitChat({
  outfit,
  onRegenerateOutfit,
  onRecordUsage,
  onSaveOutfit,
  usageUpdated,
}: ArinPostOutfitChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [conversationState, setConversationState] = useState<
    "asking_approval" | "asking_usage" | "asking_save" | "completed"
  >("asking_approval")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar perfil del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserProfile(JSON.parse(storedPreferences))
    }
  }, [])

  // Iniciar conversación automáticamente cuando se monta el componente
  useEffect(() => {
    if (outfit.length > 0 && messages.length === 0) {
      setTimeout(() => {
        startPostOutfitConversation()
      }, 1000)
    }
  }, [outfit])

  // Scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Iniciar la conversación post-generación
  const startPostOutfitConversation = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userName = userProfile?.userName || ""

    const approvalMessage = userName
      ? `¡Listo ${userName}! 🎉 

Armé este look especialmente para vos basándome en lo que me dijiste. Combiné las prendas pensando en que te veas increíble y te sientas cómoda.

¿Te gusta cómo quedó? 💕`
      : `¡Listo! 🎉 

Armé este look especialmente para vos basándome en lo que me dijiste. Combiné las prendas pensando en que te veas increíble y te sientas cómoda.

¿Te gusta cómo quedó? 💕`

    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: approvalMessage,
      timestamp: new Date(),
      suggestions: ["¡Sí, me encanta!", "No, prefiero otro", "Me gusta pero..."],
    }

    setMessages([initialMessage])
    setConversationState("asking_approval")
    setIsLoading(false)
  }

  // Procesar respuesta del usuario
  const processUserResponse = async (message: string) => {
    const lowerMessage = message.toLowerCase()

    if (conversationState === "asking_approval") {
      if (
        lowerMessage.includes("sí") ||
        lowerMessage.includes("si") ||
        lowerMessage.includes("me encanta") ||
        lowerMessage.includes("me gusta") ||
        lowerMessage.includes("perfecto") ||
        lowerMessage.includes("genial")
      ) {
        setConversationState("asking_usage")

        const userName = userProfile?.userName || ""
        const usageQuestion = userName
          ? `¡Qué bueno ${userName}! Me alegra mucho que te guste 😊

¿Vas a usar este look hoy? Si me decís que sí, lo registro en tus estadísticas para ayudarte a llevar un mejor control de tu armario.`
          : `¡Qué bueno! Me alegra mucho que te guste 😊

¿Vas a usar este look hoy? Si me decís que sí, lo registro en tus estadísticas para ayudarte a llevar un mejor control de tu armario.`

        return {
          content: usageQuestion,
          suggestions: ["Sí, lo voy a usar", "No, es para otro día"],
        }
      } else if (
        lowerMessage.includes("no") ||
        lowerMessage.includes("otro") ||
        lowerMessage.includes("diferente") ||
        lowerMessage.includes("cambiar")
      ) {
        const userName = userProfile?.userName || ""
        const regenerateMessage = userName
          ? `¡No hay problema ${userName}! 💪 

Cada persona tiene su estilo único y es súper importante que te sientas cómoda con lo que usás.

¿Queres que arme otro look diferente para vos?`
          : `¡No hay problema! 💪 

Cada persona tiene su estilo único y es súper importante que te sientas cómoda con lo que usás.

¿Queres que arme otro look diferente para vos?`

        return {
          content: regenerateMessage,
          suggestions: ["Sí, armá otro", "Mejor después"],
        }
      } else {
        return {
          content: "Contame un poco más... ¿qué es lo que no te convence del look? 🤔",
          suggestions: ["No me gusta el color", "Prefiero otro estilo", "Armá otro diferente"],
        }
      }
    } else if (conversationState === "asking_usage") {
      if (
        lowerMessage.includes("sí") ||
        lowerMessage.includes("si") ||
        lowerMessage.includes("voy a usar") ||
        lowerMessage.includes("lo uso")
      ) {
        // Registrar uso
        onRecordUsage()
        setConversationState("completed")

        const userName = userProfile?.userName || ""
        const completedMessage = userName
          ? `¡Perfecto ${userName}! 📊 

Ya registré el uso de estas prendas en tus estadísticas. Esto me ayuda a entender mejor tus preferencias y a sugerirte looks cada vez más acertados.

¡Que tengas un día increíble! ✨`
          : `¡Perfecto! 📊 

Ya registré el uso de estas prendas en tus estadísticas. Esto me ayuda a entender mejor tus preferencias y a sugerirte looks cada vez más acertados.

¡Que tengas un día increíble! ✨`

        return {
          content: completedMessage,
          suggestions: [],
        }
      } else if (
        lowerMessage.includes("no") ||
        lowerMessage.includes("otro día") ||
        lowerMessage.includes("después") ||
        lowerMessage.includes("más tarde")
      ) {
        setConversationState("asking_save")

        const userName = userProfile?.userName || ""
        const saveQuestion = userName
          ? `Entiendo ${userName}! 💾 

¿Querés que guarde este look en tu colección para que puedas usarlo otro día? Así no se te olvida esta combinación que armamos juntas.`
          : `Entiendo! 💾 

¿Querés que guarde este look en tu colección para que puedas usarlo otro día? Así no se te olvida esta combinación que armamos juntas.`

        return {
          content: saveQuestion,
          suggestions: ["Sí, guardalo", "No, está bien así"],
        }
      }
    } else if (conversationState === "asking_save") {
      if (
        lowerMessage.includes("sí") ||
        lowerMessage.includes("si") ||
        lowerMessage.includes("guardalo") ||
        lowerMessage.includes("guardar")
      ) {
        // Guardar outfit
        onSaveOutfit()
        setConversationState("completed")

        const userName = userProfile?.userName || ""
        const savedMessage = userName
          ? `¡Listo ${userName}! 💾✨ 

Guardé tu look en la colección. Podés encontrarlo en la sección "Looks Guardados" cuando quieras usarlo.

¡Espero que te sirva para una ocasión especial! 🌟`
          : `¡Listo! 💾✨ 

Guardé tu look en la colección. Podés encontrarlo en la sección "Looks Guardados" cuando quieras usarlo.

¡Espero que te sirva para una ocasión especial! 🌟`

        return {
          content: savedMessage,
          suggestions: [],
        }
      } else {
        setConversationState("completed")

        const userName = userProfile?.userName || ""
        const finalMessage = userName
          ? `¡Perfecto ${userName}! 😊 

Cualquier cosa que necesites, acá estoy para ayudarte a crear looks increíbles con tu armario.

¡Que tengas un día genial! ✨`
          : `¡Perfecto! 😊 

Cualquier cosa que necesites, acá estoy para ayudarte a crear looks increíbles con tu armario.

¡Que tengas un día genial! ✨`

        return {
          content: finalMessage,
          suggestions: [],
        }
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

    // Manejar casos especiales
    if (textToSend.toLowerCase().includes("armá otro") || textToSend.toLowerCase().includes("arma otro")) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const regeneratingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "¡Dale! 🎨 Te armo otro look diferente...",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, regeneratingMessage])
      setIsLoading(false)

      // Regenerar outfit después de un delay
      setTimeout(() => {
        onRegenerateOutfit()
        // Resetear la conversación para el nuevo outfit
        setMessages([])
        setConversationState("asking_approval")
      }, 2000)

      return
    }

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

  if (messages.length === 0) return null

  return (
    <Card className="mt-4 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6 bg-primary/10">
            <Bot className="h-3 w-3 text-primary" />
          </Avatar>
          <span className="text-sm font-medium text-primary">ARIN te pregunta:</span>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-left duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`rounded-lg p-3 max-w-[85%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                {/* Sugerencias rápidas */}
                {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
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
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in slide-in-from-left duration-300">
              <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">ARIN está pensando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {conversationState !== "completed" && (
          <div className="flex w-full gap-2 mt-4">
            <Textarea
              placeholder="Escribe tu respuesta..."
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
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="transition-all"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
