"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, ArrowLeft, Camera, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loadExampleItems } from "@/lib/example-items"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
  suggestions?: string[]
}

type OnboardingState = "welcome" | "asking_name" | "explaining_app" | "showing_steps" | "ready_to_start" | "completed"

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [onboardingState, setOnboardingState] = useState<OnboardingState>("welcome")
  const [isLoading, setIsLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [userName, setUserName] = useState("")
  // Cambiar la lógica de scroll para mostrar el inicio del último mensaje de ARIN
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Modificar el useEffect de scroll:
  useEffect(() => {
    if (lastMessageRef.current) {
      // Hacer scroll al inicio del último mensaje con un pequeño delay
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      }, 100)
    }
  }, [messages])

  // Iniciar onboarding automáticamente
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        startOnboarding()
      }, 1000)
    }
  }, [])

  const startOnboarding = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `¡Hola! 💕 Soy ARIN, tu asistente de moda.

Te ayudo a crear looks increíbles con la ropa que ya tenés, sin necesidad de comprar más.

¿Cómo te gusta que te llamen?`,
      timestamp: new Date(),
      suggestions: [],
    }

    setMessages([welcomeMessage])
    setOnboardingState("asking_name")
    setIsLoading(false)
  }

  const processUserResponse = async (message: string): Promise<{ content: string; suggestions?: string[] }> => {
    const lowerMessage = message.toLowerCase()

    // Manejar preguntas específicas que se ofrecen como sugerencias
    if (lowerMessage.includes("cuántas prendas necesito") || lowerMessage.includes("cuantas prendas necesito")) {
      return {
        content: `¡Buena pregunta ${userName}! 📊

Para empezar necesitás:
• 3-5 remeras/blusas
• 2-3 pantalones/faldas  
• 1-2 abrigos
• 2-3 pares de zapatos

¡Pero podés empezar con menos! Con 5-6 prendas ya funciona.`,
        suggestions: ["¡Sí, empiezo ahora!", "¿Qué categorías hay?", "Prefiero ver ejemplos primero"],
      }
    }

    if (lowerMessage.includes("cómo eliges los looks") || lowerMessage.includes("como eliges los looks")) {
      return {
        content: `¡Me encanta que preguntes ${userName}! 🤖

Analizo:
• Ocasión (casual, formal, fiesta...)
• Clima (calor, templado, frío)
• Colores que combinen
• Tu estilo personal

¡Y aprendo de tus gustos!`,
        suggestions: ["¡Sí, creemos un look!", "Primero cargo mis prendas", "¿Cómo te digo mis gustos?"],
      }
    }

    if (lowerMessage.includes("puedo editar después") || lowerMessage.includes("editar")) {
      return {
        content: `¡Por supuesto ${userName}! 📝

Podés cambiar todo:
• Info de prendas
• Fotos
• Looks guardados
• Tus preferencias

¡Nada es definitivo!`,
        suggestions: ["¡Sí, perfecto!", "¿Cómo edito una prenda?", "Empiezo a cargar entonces"],
      }
    }

    if (lowerMessage.includes("qué categorías hay") || lowerMessage.includes("que categorias hay")) {
      return {
        content: `Las categorías son simples ${userName}! 👕

TIPOS: Remeras, pantalones, vestidos, zapatos, etc.
OCASIONES: Casual, formal, fiesta, trabajo
CLIMA: Caluroso, templado, frío

¡Súper fácil!`,
        suggestions: ["Está claro, empiezo", "¿Qué es 'templado'?", "¿Y los accesorios?"],
      }
    }

    if (
      lowerMessage.includes("qué es templado") ||
      lowerMessage.includes("que es templado") ||
      lowerMessage.includes("templado")
    ) {
      return {
        content: `¡Buena pregunta ${userName}! 🌤️

Templado = ni muy calor ni muy frío
• 15°C a 25°C
• Como otoño/primavera
• Perfecto para capas: remera + cardigan

¡La mayoría de tu ropa funciona en templado!`,
        suggestions: ["¡Sí, perfecto!", "¿Y los accesorios?", "Empiezo a cargar prendas"],
      }
    }

    if (lowerMessage.includes("y los accesorios") || lowerMessage.includes("accesorios")) {
      return {
        content: `¡Excelente pregunta sobre accesorios ${userName}! 👜✨

Los accesorios incluyen:
• Carteras y bolsos - Para completar el look
• Bufandas y pañuelos - Para clima frío o como detalle
• Sombreros y gorros - Protección y estilo
• Cinturones - Para definir la silueta
• Joyas básicas - Collares, aros, pulseras
• Anteojos de sol - Funcionales y fashionistas

Tip de ARIN: Los accesorios pueden transformar completamente un look básico. ¡Una remera simple + jeans se vuelve súper chic con los accesorios correctos!

¿Empezamos cargando tus primeras prendas?`,
        suggestions: ["¡Sí, empiezo ahora!", "¿Cómo categorizo joyas?", "Prefiero ver ejemplos"],
      }
    }

    if (lowerMessage.includes("cómo categorizo joyas") || lowerMessage.includes("como categorizo joyas")) {
      return {
        content: `¡Buena pregunta ${userName}! Para las joyas es súper simple: 💎

Categorización de joyas:
• Tipo: Collar, aros, pulsera, anillo, etc.
• Color: Dorado, plateado, rose gold, colorido
• Ocasión: Casual (joyas simples), Formal (más elegantes)
• Clima: Todas las joyas funcionan en cualquier clima

Tip: No necesitás fotografiar cada joya individual. Podés hacer una foto de tu "set dorado" y otra de tu "set plateado" si querés mantenerlo simple.

¿Te parece práctico este enfoque?`,
        suggestions: ["¡Perfecto, empiezo!", "¿Y los cinturones?", "Mejor veo ejemplos primero"],
      }
    }

    if (onboardingState === "asking_name") {
      const name = message.trim()
      setUserName(name)
      setOnboardingState("explaining_app")

      // Guardar el nombre en las preferencias
      const preferences = {
        userName: name,
        favoriteColors: [],
        dislikedColors: [],
        preferredStyle: "",
        occasions: [],
        likedOutfits: [],
        dislikedOutfits: [],
        onboardingCompleted: false,
      }
      localStorage.setItem("userFashionPreferences", JSON.stringify(preferences))

      return {
        content: `¡Un placer conocerte, ${name}! 😊

ARIN tiene 4 secciones:
📸 Mi Armario - Cargás tus prendas
✨ Sugerir Look - Creo combinaciones
💕 Looks Guardados - Tus favoritos
📊 Estadísticas - Qué usás más

¿Te explico paso a paso?`,
        suggestions: ["¡Sí, explicame!", "Prefiero explorar sola", "¿Cómo cargo las fotos?"],
      }
    } else if (onboardingState === "explaining_app") {
      if (lowerMessage.includes("sí") || lowerMessage.includes("si") || lowerMessage.includes("explicame")) {
        setOnboardingState("showing_steps")

        return {
          content: `¡Perfecto ${userName}! 💫

PASO 1: Sacá fotos de tu ropa
• Superficie clara
• Buena luz
• Prenda extendida

PASO 2: Completá la info
• Tipo, color, ocasión, clima

PASO 3: ¡Creá looks!

¿Empezamos?`,
          suggestions: ["Cargar mi primera prenda", "Ver ejemplos", "¿Cuántas prendas necesito?"],
        }
      } else if (lowerMessage.includes("explorar") || lowerMessage.includes("sola")) {
        setOnboardingState("ready_to_start")

        return {
          content: `¡Me encanta tu independencia, ${userName}! 💪

Podés explorar la app libremente. Si en algún momento necesitás ayuda, siempre podés:
• Tocar mi ícono (el bot) para chatear conmigo
• Ir a la sección "Guía" para ver instrucciones detalladas
• Preguntarme lo que necesites

¿Por dónde te gustaría empezar?`,
          suggestions: ["Mi Armario", "Ver ejemplos", "Guía completa", "Crear mi primer look"],
        }
      } else if (lowerMessage.includes("foto") || lowerMessage.includes("cargar")) {
        setOnboardingState("showing_steps")

        return {
          content: `¡Excelente pregunta, ${userName}! 📸

Cómo tomar buenas fotos de tus prendas:

1. Preparación
   • Elegí un lugar con buena luz natural (cerca de una ventana)
   • Usá una superficie clara: cama con sábanas blancas, mesa clara, etc.
   • Evitá sombras y reflejos

2. La prenda
   • Extendé bien la prenda, sin arrugas
   • Si es una remera/camisa, acomodá las mangas
   • Si es un pantalón, estiralo completamente
   • Para vestidos, mostrá la forma completa

3. La foto
   • Centrá la prenda en el encuadre
   • Asegurate de que se vea completa
   • Una foto por prenda es suficiente
   • No te preocupes por la perfección, ¡yo entiendo!

¿Te animas a cargar tu primera prenda ahora?`,
          suggestions: ["¡Sí, vamos!", "Primero quiero ver ejemplos", "Tengo más preguntas"],
        }
      }
    } else if (onboardingState === "showing_steps") {
      if (
        lowerMessage.includes("primera prenda") ||
        lowerMessage.includes("vamos") ||
        lowerMessage.includes("cargar")
      ) {
        setOnboardingState("completed")

        // Marcar onboarding como completado
        const storedPreferences = localStorage.getItem("userFashionPreferences")
        if (storedPreferences) {
          const preferences = JSON.parse(storedPreferences)
          preferences.onboardingCompleted = true
          localStorage.setItem("userFashionPreferences", JSON.stringify(preferences))
        }

        return {
          content: `¡Perfecto ${userName}! 🎉

Te voy a llevar a la sección "Mi Armario" donde podés cargar tu primera prenda. 

Recordá los consejos que te di:
✅ Buena luz natural
✅ Superficie clara
✅ Prenda bien extendida
✅ Completar toda la información

¡Nos vemos del otro lado! Cualquier duda, solo preguntame 💕`,
          suggestions: [],
        }
      } else if (lowerMessage.includes("cargar prendas de ejemplo") || lowerMessage.includes("ejemplo")) {
        setOnboardingState("completed")

        // Cargar ejemplos inmediatamente aquí
        loadExampleItems()

        return {
          content: `¡Excelente idea ${userName}! 👚👖👗

He cargado algunas prendas de ejemplo en tu armario para que puedas ver cómo funciona la app sin tener que subir tus propias fotos todavía.

Con estas prendas podrás:
• Ver cómo se organizan en tu armario
• Probar a crear looks combinándolas
• Entender mejor cómo funciona todo

¡Te llevo a tu armario con las prendas ya cargadas!`,
          suggestions: [],
        }
      }
    } else if (onboardingState === "ready_to_start") {
      if (lowerMessage.includes("armario")) {
        setOnboardingState("completed")
        return {
          content: `¡Excelente elección ${userName}! Te llevo a "Mi Armario" para que empieces a cargar tus prendas 📸`,
          suggestions: [],
        }
      } else if (lowerMessage.includes("cargar prendas de ejemplo") || lowerMessage.includes("ejemplo")) {
        setOnboardingState("completed")
        return {
          content: `¡Buena idea ${userName}! Te muestro algunos ejemplos para que veas cómo funciona 👀`,
          suggestions: [],
        }
      } else if (lowerMessage.includes("guía")) {
        setOnboardingState("completed")
        return {
          content: `¡Perfecto ${userName}! Te llevo a la guía completa donde tenés toda la información detallada 📚`,
          suggestions: [],
        }
      } else if (lowerMessage.includes("look")) {
        return {
          content: `${userName}, para crear looks necesito que primero tengas algunas prendas cargadas en tu armario 😊

¿Querés que te ayude a cargar tus primeras prendas o preferís ver algunos ejemplos primero?`,
          suggestions: ["Cargar mis prendas", "Ver ejemplos", "Entiendo, voy al armario"],
        }
      }
    }

    // Manejar respuestas a preguntas específicas
    if (lowerMessage.includes("empiezo ahora") || lowerMessage.includes("empiezo")) {
      setOnboardingState("completed")
      return {
        content: `¡Perfecto ${userName}! Te llevo a "Mi Armario" para que cargues tu primera prenda 🚀`,
        suggestions: [],
      }
    }

    if (lowerMessage.includes("creemos un look") || lowerMessage.includes("crear look")) {
      return {
        content: `${userName}, me encantaría crear un look contigo, pero primero necesito que tengas algunas prendas cargadas en tu armario 😊

¿Querés empezar cargando tus prendas ahora?`,
        suggestions: ["¡Sí, vamos al armario!", "Prefiero ver ejemplos", "¿Cuántas necesito mínimo?"],
      }
    }

    if (lowerMessage.includes("cómo te digo mis gustos") || lowerMessage.includes("como te digo mis gustos")) {
      return {
        content: `¡Excelente pregunta ${userName}! 💕

Hay varias formas de contarme tus gustos:
• Cuando veas un look que te guste, marcalo como favorito ❤️
• Si no te gusta algo, también podés decírmelo
• En tu perfil podés elegir colores favoritos
• Mientras charlamos, siempre podés contarme qué te gusta

¡Yo voy aprendiendo de vos con cada interacción!

¿Empezamos cargando prendas para que pueda conocer tu estilo?`,
        suggestions: ["¡Sí, empezamos!", "¿Dónde está mi perfil?", "Primero quiero ver ejemplos"],
      }
    }

    // Respuesta genérica
    return {
      content: `${userName}, no estoy segura de entender. ¿Podrías decirme qué te gustaría hacer?`,
      suggestions: ["Cargar prendas", "Ver ejemplos", "¿Cuántas prendas necesito?", "Explorar la app"],
    }
  }

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

      // Manejar navegación después del mensaje
      if (onboardingState === "completed") {
        setTimeout(() => {
          if (textToSend.toLowerCase().includes("primera prenda") || textToSend.toLowerCase().includes("armario")) {
            router.push("/upload")
          } else if (
            textToSend.toLowerCase().includes("ejemplo") ||
            textToSend.toLowerCase().includes("cargar prendas de ejemplo")
          ) {
            // Redirigir al armario después de cargar los ejemplos
            router.push("/gallery")
          } else if (textToSend.toLowerCase().includes("guía")) {
            router.push("/guia")
          }
        }, 2000)
      }
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

  const handleQuickSuggestion = (suggestion: string) => {
    if (isLoading) return
    handleSendMessage(suggestion)
  }

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
              <h1 className="text-xl font-bold">Bienvenida a ARIN</h1>
              <p className="text-sm text-muted-foreground">Tu asistente personal de moda</p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards - Solo 2 opciones */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link href="/upload">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Cargar Prendas</h3>
                <p className="text-xs text-muted-foreground">Subí fotos de tu ropa</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/guia">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Guía Completa</h3>
                <p className="text-xs text-muted-foreground">Instrucciones detalladas</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Chat Container */}
        <Card className="h-[500px] flex flex-col shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Conversación con ARIN
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.length === 0 && isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">ARIN se está preparando para conocerte...</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1
                  const isArinMessage = message.role === "assistant"

                  return (
                    <div
                      key={message.id}
                      ref={isLastMessage && isArinMessage ? lastMessageRef : null}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-left duration-300`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`rounded-lg p-4 max-w-[85%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border"
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
                                {suggestion === "Ver ejemplos" ? "Cargar prendas de ejemplo" : suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {isLoading && messages.length > 0 && (
                <div className="flex justify-start animate-in slide-in-from-left duration-300">
                  <div className="rounded-lg p-4 bg-muted border border-border flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">ARIN está pensando...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Input Area */}
          {onboardingState !== "completed" && (
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
