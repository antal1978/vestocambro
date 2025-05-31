"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, X, Maximize2, Minimize2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
  suggestions?: string[] // Añadir sugerencias al tipo de mensaje
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

// Helper para normalizar texto (minúsculas, sin espacios extra, sin tildes)
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

// Definir la estructura para los contextos del chat
type ChatContextEntry = {
  introduction: string | ((userName: string) => string)
  state: string
  suggestions?: string[]
}

const ArinChat: React.FC<{ autoOpen?: boolean; context?: string }> = ({ autoOpen = false, context }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [isMinimized, setIsMinimized] = useState(!autoOpen)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [conversationState, setConversationState] = useState<string>("initial")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Definir los contextos de chat
  const chatContexts: Record<string, ChatContextEntry> = {
    initial: {
      introduction: `¡Hola! 💕 Soy ARIN, tu asistente de moda personal.

Te ayudo a crear looks increíbles con la ropa que ya tenés. Mi objetivo es que aproveches al máximo tu armario. ✨

¿Cómo te gusta que te llamen?`,
      state: "asking_name",
    },
    "main-menu": {
      introduction: (userName: string) => `¡Hola **${userName}**! 💕 

¿Qué hacemos hoy?

• **Armario** - Ver tus prendas
• **Look** - Crear combinaciones
• **Subir** - Añadir prendas nuevas
• **Estadísticas** - Ver uso de ropa`,
      state: "main_menu",
    },
    "upload-item": {
      introduction: `¡Hola! Estás en la sección de **Subir Prenda**. Aquí te guiaré para que añadas tu ropa fácilmente.

Para subir una prenda, seguí estos pasos:
1.  **Tomá una foto** o seleccioná una de tu galería.
2.  **Completá los detalles**: Categoría, color, clima, ocasión y, si querés, el material.
3.  **¡Listo!** Tu prenda se guardará en tu armario.

¿Necesitás ayuda con algún paso específico o tenés alguna duda sobre cómo categorizar tu ropa?`,
      suggestions: [
        "¿Cómo tomo una buena foto?",
        "¿Qué categoría elijo?",
        "¿Por qué es importante el material?",
        "Volver al menú principal",
      ],
      state: "upload_help",
    },
    "stats-page": {
      introduction: (userName: string) => `¡Hola **${userName}**! Estás en la sección de **Estadísticas**.

Aquí podés ver un resumen de tu armario y cómo lo usás. Te muestro datos sobre tus prendas, looks y consejos de sostenibilidad.

¿Te gustaría saber más sobre alguna estadística en particular o cómo interpretar los datos?`,
      suggestions: [
        "¿Qué significan las prendas sin usar?",
        "¿Cómo se calculan las estadísticas?",
        "¿Qué son los materiales predominantes?",
        "Volver al menú principal",
      ],
      state: "stats_help",
    },
    "gallery-page": {
      introduction: (userName: string) => `¡Hola **${userName}**! Estás en tu **Armario**.

Aquí podés ver todas tus prendas, filtrarlas, buscar y hasta crear looks directamente desde una prenda.

¿Necesitás ayuda para organizar tu armario o encontrar algo en particular?`,
      suggestions: [
        "¿Cómo añado una prenda nueva?",
        "¿Cómo busco una prenda?",
        "¿Cómo elimino una prenda?",
        "¿Qué significan los 'usos'?",
        "Volver al menú principal",
      ],
      state: "gallery_help",
    },
  }

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

      let initialMessageContent: string
      let initialState: string
      let initialSuggestions: string[] | undefined

      if (context && chatContexts[context as keyof typeof chatContexts]) {
        // Usar contexto específico si se proporciona
        const currentContextEntry = chatContexts[context as keyof typeof chatContexts]
        initialMessageContent =
          typeof currentContextEntry.introduction === "function"
            ? currentContextEntry.introduction(userProfile?.userName || "")
            : currentContextEntry.introduction
        initialState = currentContextEntry.state
        initialSuggestions = currentContextEntry.suggestions
      } else if (userProfile?.firstVisit || !userProfile?.userName) {
        // Usuario nuevo o sin nombre
        initialMessageContent = chatContexts["initial"].introduction
        initialState = chatContexts["initial"].state
        initialSuggestions = chatContexts["initial"].suggestions
      } else {
        // Usuario recurrente, menú principal
        initialMessageContent = chatContexts["main-menu"].introduction(userProfile?.userName || "")
        initialState = chatContexts["main-menu"].state
        initialSuggestions = chatContexts["main-menu"].suggestions
      }

      const initialMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: initialMessageContent,
        timestamp: new Date(),
        suggestions: initialSuggestions,
      }

      setMessages([initialMessage])
      setConversationState(initialState)
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

  const sustainabilityTips = [
    "¿Sabías que lavar tu ropa con agua fría y secarla al aire libre puede reducir significativamente tu huella de carbono? ¡Pequeños cambios hacen una gran diferencia! 💧",
    "Antes de comprar algo nuevo, pensá: ¿realmente lo necesito? Reutilizar y reparar tus prendas es una forma genial de ser más sostenible. ♻️",
    "La moda rápida tiene un gran impacto. Elegir prendas de calidad que duren más tiempo es una inversión para tu estilo y para el planeta. 🌍",
    "¿Conocés el material de tu ropa? Materiales como el algodón orgánico o el lino son más amigables con el medio ambiente. ¡Investigá un poco! 🌱",
    "Donar o intercambiar la ropa que ya no usás le da una segunda vida y reduce el desperdicio textil. ¡Tu armario puede ser parte del cambio! 🔄",
    "Evitá el microplástico: lavá la ropa sintética en bolsas especiales o considerá opciones de materiales naturales. ¡Cuidemos nuestros océanos! 🌊",
  ]

  // Manejar sugerencias rápidas
  const handleQuickSuggestion = async (suggestion: string) => {
    // Añadir la sugerencia del usuario como un mensaje
    const userSuggestionMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: suggestion,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userSuggestionMessage])
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular procesamiento

    let arinResponse = ""
    let newSuggestions: string[] | undefined

    switch (
      normalizeText(suggestion) // Normalizar la sugerencia para la comparación
    ) {
      case normalizeText("¿Cómo tomo una buena foto?"):
        arinResponse =
          "Para una buena foto, asegurate de que la prenda esté bien iluminada, sobre un fondo neutro y sin arrugas. ¡Así ARIN podrá identificarla mejor! 📸"
        break
      case normalizeText("¿Qué categoría elijo?"):
        arinResponse =
          "Elegí la categoría que mejor describa la prenda. Por ejemplo, si es una remera de manga corta, seleccioná 'Remera'. Si es un jean, 'Jean'. ¡No te preocupes, con la práctica será más fácil!"
        break
      case normalizeText("¿Por qué es importante el material?"):
        arinResponse =
          "El material es clave para entender la durabilidad, el cuidado y el impacto ambiental de tu ropa. ¡Además, me ayuda a darte consejos de sostenibilidad más precisos! 🌱"
        break
      case normalizeText("¿Qué significan las prendas sin usar?"):
        arinResponse =
          "Las **prendas sin usar** son aquellas que tenés en tu armario pero que ARIN no ha registrado como parte de ningún look o que no has marcado como usadas. ¡Es una oportunidad para redescubrirlas o darles una nueva vida!"
        newSuggestions = chatContexts["stats-page"].suggestions // Mantener sugerencias del contexto de stats
        break
      case normalizeText("¿Cómo se calculan las estadísticas?"):
        arinResponse =
          "Las estadísticas se calculan a partir de los datos que cargás de tus prendas y de cómo las usás al crear y guardar looks. Cada vez que generás un look y lo guardás, ARIN registra el uso de esas prendas. ¡Así podemos darte un panorama real de tu armario!"
        newSuggestions = chatContexts["stats-page"].suggestions // Mantener sugerencias del contexto de stats
        break
      case normalizeText("¿Qué son los materiales predominantes?"):
        arinResponse =
          "Los **materiales predominantes** te muestran qué tipos de tejidos son los más comunes en tu armario. Esto es útil para entender el impacto ambiental de tu ropa y para tomar decisiones más conscientes al comprar. Por ejemplo, si tenés mucho poliéster, podrías buscar alternativas más sostenibles en el futuro. 🌿"
        newSuggestions = chatContexts["stats-page"].suggestions // Mantener sugerencias del contexto de stats
        break
      case normalizeText("¿Cómo añado una prenda nueva?"):
        arinResponse =
          "Para añadir una prenda nueva, andá a la sección **'Subir Prenda'** (puedes ir desde el menú principal o el botón 'Añadir prenda' en tu armario). Allí podrás subir una foto y completar todos los detalles. ¡Es muy fácil! ✨"
        newSuggestions = chatContexts["gallery-page"].suggestions // Mantener sugerencias del contexto de armario
        break
      case normalizeText("¿Cómo busco una prenda?"):
        arinResponse =
          "En la parte superior de tu armario, tenés una barra de búsqueda y filtros. Podés escribir el tipo de prenda, color o incluso la ocasión. ¡Así encontrás lo que buscás en segundos! 🔍"
        newSuggestions = chatContexts["gallery-page"].suggestions // Mantener sugerencias del contexto de armario
        break
      case normalizeText("¿Cómo elimino una prenda?"):
        arinResponse =
          "Para eliminar una prenda, hacé clic sobre ella en tu armario para ver los detalles. Dentro de la vista de detalles, encontrarás un botón para eliminarla. ¡Tené cuidado, esta acción no se puede deshacer! 🗑️"
        newSuggestions = chatContexts["gallery-page"].suggestions // Mantener sugerencias del contexto de armario
        break
      case normalizeText("¿Qué significan los 'usos'?"):
        arinResponse =
          "Los 'usos' indican cuántas veces una prenda ha sido parte de un look que has generado y guardado. Te ayuda a ver qué tan seguido usás cada pieza de tu armario y a identificar prendas que quizás no estés aprovechando. ¡Es una forma de fomentar un armario más consciente! 📊"
        newSuggestions = chatContexts["gallery-page"].suggestions // Mantener sugerencias del contexto de armario
        break
      case normalizeText("Volver al menú principal"):
        arinResponse = chatContexts["main-menu"].introduction(userProfile?.userName || "") as string
        setConversationState("main_menu")
        // Al volver al menú principal, no hay sugerencias específicas de ese contexto
        newSuggestions = undefined
        break
      default:
        arinResponse = `Entendido: "${suggestion}". ¿Hay algo más en lo que pueda ayudarte?`
        break
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: arinResponse,
      timestamp: new Date(),
      suggestions: newSuggestions, // Asignar las nuevas sugerencias
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  // Generar respuesta de ARIN
  const generateArinResponse = async (userMessage: string): Promise<string> => {
    const normalizedUserMessage = normalizeText(userMessage) // Normalizar el mensaje del usuario

    // Palabras clave para detectar intenciones de navegación (normalizadas)
    const navigationKeywords = {
      upload: ["subir", "cargar", "agregar", "nueva prenda", "añadir ropa", "foto", "fotografia", "imagen"].map(
        normalizeText,
      ),
      gallery: ["armario", "ver prendas", "mis prendas", "guardarropa", "ropa", "prendas", "coleccion"].map(
        normalizeText,
      ),
      suggest: ["look", "outfit", "combinacion", "vestir", "combinar", "crear look", "generar look"].map(normalizeText),
      looks: ["guardados", "looks guardados", "favoritos", "combinaciones guardadas"].map(normalizeText),
      stats: ["estadisticas", "stats", "uso", "analisis", "datos"].map(normalizeText),
    }

    // Si estamos pidiendo el nombre
    if (conversationState === "asking_name") {
      const name = userMessage.trim()
      if (name.length > 0) {
        saveUserName(name)
        setConversationState("main_menu")

        return `¡Encantada, **${name}**! 😊

¿Por dónde empezamos?

• **Armario** - Ver tus prendas
• **Look** - Crear combinaciones
• **Subir** - Añadir prendas nuevas
• **Estadísticas** - Ver uso de ropa`
      } else {
        return "Me gustaría saber tu nombre para poder ayudarte mejor. ¿Cómo te gusta que te llamen?"
      }
    }

    // Detectar intención de navegación
    for (const [section, words] of Object.entries(navigationKeywords)) {
      if (words.some((word) => normalizedUserMessage.includes(word))) {
        // Preparar navegación
        setTimeout(() => {
          router.push(`/${section}`)
        }, 1000)

        const responses = {
          upload: `¡Perfecto! Vamos a **subir una prenda**...`,
          gallery: `¡Genial! Te llevo a tu **armario**...`,
          suggest: `¡Dale! **Creemos un look** juntas...`,
          looks: `Te muestro tus **guardados**...`,
          stats: `Vamos a ver las **estadísticas**...`,
        }

        return responses[section as keyof typeof responses]
      }
    }

    // Detectar intención de sostenibilidad (normalizadas)
    const sustainabilityKeywords = ["sostenibilidad", "sustentabilidad", "ecologia", "medio ambiente", "impacto"].map(
      normalizeText,
    )
    if (sustainabilityKeywords.some((word) => normalizedUserMessage.includes(word))) {
      const randomTip = sustainabilityTips[Math.floor(Math.random() * sustainabilityTips.length)]
      return `¡Claro! Me encanta hablar de eso. Aquí tienes un consejo: **${randomTip}**`
    }

    // Respuestas contextuales (normalizadas)
    const generalKeywords = {
      greeting: ["hola", "buenas", "hey", "saludos", "que tal", "como estas", "como estas"].map(normalizeText),
      thanks: ["gracias", "genial", "excelente", "perfecto", "buenisimo"].map(normalizeText),
      help: ["ayuda", "ayudame", "no se", "opciones", "que puedo hacer", "funciones", "que haces"].map(normalizeText),
    }

    if (generalKeywords.greeting.some((word) => normalizedUserMessage.includes(word))) {
      return `¡Hola **${userProfile?.userName}**! 💕 ¿En qué puedo ayudarte hoy?`
    }

    if (generalKeywords.thanks.some((word) => normalizedUserMessage.includes(word))) {
      return `¡De nada, **${userProfile?.userName}**! 😊 Siempre es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?`
    }

    if (generalKeywords.help.some((word) => normalizedUserMessage.includes(word))) {
      return `Te puedo ayudar con:

• **Armario** - Ver prendas
• **Look** - Crear outfits  
• **Guardados** - Tus favoritos
• **Estadísticas** - Análisis de uso
• **Subir** - Añadir prendas

¿Qué necesitás?`
    }

    // Respuesta genérica
    const genericResponses = [
      `¿En qué te ayudo, **${userProfile?.userName}**? Puedo mostrarte tu armario, crear un look, o lo que necesites 😊`,
      `Estoy aquí para ayudarte a sacar el máximo provecho de tu armario, **${userProfile?.userName}**. ¿Qué te gustaría hacer?`,
      `¡Hola de nuevo, **${userProfile?.userName}**! ¿Listo/a para explorar tu estilo?`,
      `Siempre es un placer verte por aquí, **${userProfile?.userName}**. ¿Qué tienes en mente hoy?`,
    ]

    let finalResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]

    // Añadir un tip de sostenibilidad de forma proactiva (20% de probabilidad)
    if (Math.random() < 0.2) {
      const randomTip = sustainabilityTips[Math.floor(Math.random() * sustainabilityTips.length)]
      finalResponse += `\n\n✨ **Un pequeño tip de ARIN:** ${randomTip}`
    }

    return finalResponse
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
                      {/* Renderizar contenido con ReactMarkdown */}
                      <div className="whitespace-pre-wrap text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>

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
