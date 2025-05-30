"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, X, Maximize2, Minimize2, User } from "lucide-react" // Importar User
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
  firstVisit: boolean
}

const ArinChat: React.FC<{ autoOpen?: boolean }> = ({ autoOpen = false }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [isMinimized, setIsMinimized] = useState(!autoOpen)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [conversationState, setConversationState] = useState<string>("initial")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cargar perfil del usuario y detectar si es primera visita
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")

    if (storedPreferences) {
      const profile = JSON.parse(storedPreferences)
      setUserProfile({
        ...profile,
        firstVisit: !hasVisitedBefore,
      })
    } else {
      // Usuario completamente nuevo
      const defaultProfile: UserProfile = {
        userName: "",
        favoriteColors: [],
        dislikedColors: [],
        preferredStyle: "",
        occasions: [],
        likedOutfits: [],
        dislikedOutfits: [],
        onboardingCompleted: false,
        firstVisit: true,
      }
      setUserProfile(defaultProfile)
    }

    // Si autoOpen es true, abrir el chat automáticamente
    if (autoOpen) {
      openChat()
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

      let greeting: Message

      if (userProfile?.firstVisit || !userProfile?.userName) {
        // Usuario nuevo o sin nombre
        greeting = {
          id: Date.now().toString(),
          role: "assistant",
          content: `¡Hola! 💕 Soy ARIN, tu asistente de moda personal.

Te ayudo a crear looks increíbles con la ropa que ya tenés. Mi objetivo es que aproveches al máximo tu armario. ✨

¿Cómo te gusta que te llamen?`,
          timestamp: new Date(),
        }
        setConversationState("asking_name")
      } else {
        // Usuario recurrente
        greeting = {
          id: Date.now().toString(),
          role: "assistant",
          content: `¡Hola ${userProfile.userName}! 💕 

¿Qué hacemos hoy?

• Armario
• Look  
• Guardados
• Estadísticas
• Subir`,
          timestamp: new Date(),
        }
        setConversationState("main_menu")
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

  // Guardar nombre del usuario
  const saveUserName = (name: string) => {
    const updatedProfile = {
      ...userProfile,
      userName: name,
      firstVisit: false,
    } as UserProfile

    setUserProfile(updatedProfile)
    localStorage.setItem("userFashionPreferences", JSON.stringify(updatedProfile))
    localStorage.setItem("hasVisitedBefore", "true")
  }

  // Generar respuesta de ARIN
  const generateArinResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase().trim()

    // Si estamos pidiendo el nombre
    if (conversationState === "asking_name") {
      const name = userMessage.trim()
      if (name.length > 0) {
        saveUserName(name)
        setConversationState("main_menu")

        return `¡Encantada, ${name}! 😊

¿Por dónde empezamos?

• **Armario** - Ver tus prendas
• **Look** - Crear combinaciones
• **Subir** - Añadir prendas nuevas
• **Estadísticas** - Ver uso de ropa`
      } else {
        return "Me gustaría saber tu nombre para poder ayudarte mejor. ¿Cómo te gusta que te llamen?"
      }
    }

    // Palabras clave para detectar intenciones de navegación
    const navigationKeywords = {
      upload: ["subir", "cargar", "agregar", "nueva prenda", "añadir ropa", "foto", "fotografía", "imagen"],
      gallery: ["armario", "ver prendas", "mis prendas", "guardarropa", "ropa", "prendas", "colección"],
      suggest: ["look", "outfit", "combinación", "vestir", "combinar", "crear look", "generar look"],
      looks: ["guardados", "looks guardados", "favoritos", "combinaciones guardadas"],
      stats: ["estadísticas", "stats", "uso", "análisis", "datos"],
    }

    // Detectar intención de navegación
    for (const [section, words] of Object.entries(navigationKeywords)) {
      if (words.some((word) => message.includes(word))) {
        // Preparar navegación
        setTimeout(() => {
          router.push(`/${section}`)
        }, 1000)

        const responses = {
          upload: `¡Perfecto! Vamos a subir una prenda...`,
          gallery: `¡Genial! Te llevo a tu armario...`,
          suggest: `¡Dale! Creemos un look juntas...`,
          looks: `Te muestro tus guardados...`,
          stats: `Vamos a ver las estadísticas...`,
        }

        return responses[section as keyof typeof responses]
      }
    }

    // Respuestas contextuales
    const keywords = {
      greeting: ["hola", "buenas", "hey", "saludos", "qué tal", "como estas", "cómo estás"],
      thanks: ["gracias", "genial", "excelente", "perfecto", "buenísimo"],
      help: ["ayuda", "ayudame", "no sé", "opciones", "qué puedo hacer", "funciones", "qué hacés"],
    }

    if (keywords.greeting.some((word) => message.includes(word))) {
      return `¡Hola ${userProfile?.userName}! 💕 ¿En qué puedo ayudarte hoy?`
    }

    if (keywords.thanks.some((word) => message.includes(word))) {
      return `¡De nada, ${userProfile?.userName}! 😊 Siempre es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?`
    }

    if (keywords.help.some((word) => message.includes(word))) {
      return `Te puedo ayudar con:

• **Armario** - Ver prendas
• **Look** - Crear outfits  
• **Guardados** - Tus favoritos
• **Estadísticas** - Análisis de uso
• **Subir** - Añadir prendas

¿Qué necesitás?`
    }

    // Respuesta genérica
    return `¿En qué te ayudo, ${userProfile?.userName}? Puedo mostrarte tu armario, crear un look, o lo que necesites 😊`
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
      <div className="fixed bottom-6 right-6 z-50">
        {/* Botón principal más grande y destacado */}
        <Button
          onClick={openChat}
          className="relative rounded-full w-16 h-16 shadow-2xl flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110"
        >
          <Bot className="h-7 w-7 text-white" />
        </Button>

        {/* Tooltip/etiqueta flotante */}
        <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-bounce">
          💬 ¡Hola! Soy ARIN
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === "user" ? (
                          <>
                            <span className="text-xs font-medium">Tú</span>
                            <User className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3" />
                            <span className="text-xs font-medium">ARIN</span>
                          </>
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
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
