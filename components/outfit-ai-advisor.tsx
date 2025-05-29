"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, ThumbsUp, ThumbsDown, Bot, User, Sparkles } from "lucide-react"

type ClothingItem = {
  id: string
  image: string
  type: string
  color: string
  occasion: string
  climate: string
  isOuterwear: boolean
  usageCount?: number
  lastUsed?: string
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type UserPreferences = {
  favoriteColors: string[]
  dislikedColors: string[]
  preferredStyle: string
  occasions: string[]
  bodyType?: string
  likedOutfits: string[]
  dislikedOutfits: string[]
}

interface OutfitAIAdvisorProps {
  outfit: ClothingItem[]
  occasion: string
  climate: string
  onClose: () => void
}

// Función para cargar estadísticas de uso
const loadUsageStats = () => {
  const storedItems = localStorage.getItem("clothingItems")
  const storedUsage = localStorage.getItem("clothingUsage")

  if (!storedItems) return null

  const items = JSON.parse(storedItems)
  const usage = storedUsage ? JSON.parse(storedUsage) : {}

  const itemsWithUsage = items.map((item: ClothingItem) => ({
    ...item,
    usageCount: usage[item.id]?.count || 0,
    lastUsed: usage[item.id]?.lastUsed || "",
  }))

  return {
    allItems: itemsWithUsage,
    mostUsed: itemsWithUsage
      .filter((item) => item.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3),
    leastUsed: itemsWithUsage.filter((item) => item.usageCount > 0 && item.usageCount <= 2),
    neverUsed: itemsWithUsage.filter((item) => item.usageCount === 0),
    recentlyUsed: itemsWithUsage.filter((item) => {
      if (!item.lastUsed) return false
      const lastUsedDate = new Date(item.lastUsed)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return lastUsedDate > weekAgo
    }),
  }
}

export function OutfitAIAdvisor({ outfit, occasion, climate, onClose }: OutfitAIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [initialMessageSent, setInitialMessageSent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar preferencias del usuario
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      setUserPreferences(JSON.parse(storedPreferences))
    } else {
      // Preferencias por defecto si no existen
      const defaultPreferences: UserPreferences = {
        favoriteColors: ["azul", "negro", "blanco"],
        dislikedColors: ["naranja"],
        preferredStyle: "casual",
        occasions: ["casual", "formal"],
        likedOutfits: [],
        dislikedOutfits: [],
      }
      localStorage.setItem("userFashionPreferences", JSON.stringify(defaultPreferences))
      setUserPreferences(defaultPreferences)
    }
  }, [])

  // Enviar mensaje inicial automáticamente
  useEffect(() => {
    if (userPreferences && outfit.length > 0 && !initialMessageSent) {
      handleInitialAnalysis()
      setInitialMessageSent(true)
    }
  }, [userPreferences, outfit, initialMessageSent])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulador de IA - Análisis de outfit con estadísticas
  const generateOutfitAnalysis = (
    outfit: ClothingItem[],
    climate: string,
    occasion: string,
    preferences: UserPreferences | null,
  ): string => {
    const colors = outfit.map((item) => item.color.toLowerCase())
    const types = outfit.map((item) => item.type.toLowerCase())

    // Cargar estadísticas de uso
    const stats = loadUsageStats()

    // Obtener el nombre del usuario
    const userName = preferences?.userName || ""

    // Análisis de uso de las prendas del outfit actual
    const outfitUsageAnalysis = outfit.map((item) => {
      const itemStats = stats?.allItems.find((statItem) => statItem.id === item.id)
      return {
        item,
        usageCount: itemStats?.usageCount || 0,
        isNeverUsed: (itemStats?.usageCount || 0) === 0,
        isLeastUsed: (itemStats?.usageCount || 0) > 0 && (itemStats?.usageCount || 0) <= 2,
      }
    })

    // Generar análisis personalizado y cálido
    let analysis = userName
      ? `¡Hola ${userName}! Acabo de crear este look especialmente para vos 💕\n\n`
      : "¡Hola! Acabo de crear este look especialmente para vos 💕\n\n"

    // Análisis de uso de prendas con tono personal
    const hasNeverUsedItems = outfitUsageAnalysis.some((item) => item.isNeverUsed)
    const hasLeastUsedItems = outfitUsageAnalysis.some((item) => item.isLeastUsed)

    if (hasNeverUsedItems || hasLeastUsedItems) {
      analysis += "✨ **Me encanta que confíes en mí para esto:**\n"

      // Frases variadas para prendas sin usar
      const estrenoFrases = [
        "¡Era hora de que estrenes tu {prenda}! Te queda increíble 😍",
        "¡Por fin vas a usar tu {prenda}! Va a ser un éxito 🤩",
        "Tu {prenda} estaba esperando este momento. ¡Te va genial! ✨",
        "¡Qué bueno que te animaste con tu {prenda}! Es perfecta para vos 💫",
      ]

      // Frases variadas para prendas poco usadas
      const pocoUsoFrases = [
        "Tu {prenda} merecía más protagonismo. Solo la usaste {veces} {vezText} antes 👌",
        "¡Qué bueno darle más uso a tu {prenda}! ({veces} {vezText} es muy poco) 💕",
        "Tu {prenda} estaba un poco olvidada con solo {veces} {vezText} de uso. ¡Hoy brilla! ✨",
        "Me alegra rescatar tu {prenda} del fondo del armario ({veces} {vezText} no le hace justicia) 🌟",
      ]

      outfitUsageAnalysis.forEach((itemAnalysis, index) => {
        const prenda = `${itemAnalysis.item.type} ${itemAnalysis.item.color}`

        if (itemAnalysis.isNeverUsed) {
          // Seleccionar una frase aleatoria sin repetir la última si es posible
          const fraseIndex = Math.floor(Math.random() * estrenoFrases.length)
          const frase = estrenoFrases[fraseIndex].replace("{prenda}", prenda)
          analysis += `• ${frase}\n`
        } else if (itemAnalysis.isLeastUsed) {
          const veces = itemAnalysis.usageCount
          const vezText = veces === 1 ? "vez" : "veces"

          // Seleccionar una frase aleatoria sin repetir la última si es posible
          const fraseIndex = Math.floor(Math.random() * pocoUsoFrases.length)
          const frase = pocoUsoFrases[fraseIndex]
            .replace("{prenda}", prenda)
            .replace("{veces}", veces.toString())
            .replace("{vezText}", vezText)

          analysis += `• ${frase}\n`
        }
      })
      analysis += "\n"
    }

    // Análisis de preferencias con tono íntimo
    const hasPreferredColors = preferences?.favoriteColors.some((color) =>
      colors.some((outfitColor) => outfitColor.includes(color.toLowerCase())),
    )

    const hasDislikedColors = preferences?.dislikedColors.some((color) =>
      colors.some((outfitColor) => outfitColor.includes(color.toLowerCase())),
    )

    if (hasPreferredColors) {
      analysis += "💖 Por supuesto que incluí tus colores favoritos... ya me voy conociendo tu estilo\n"
    }

    if (hasDislikedColors) {
      analysis += "🤔 Mmm, hay un color que sé que no te gusta tanto... pero confiá en mí, esta vez va a funcionar\n"
    }

    // Estadísticas con tono personal
    if (stats) {
      const totalItems = stats.allItems.length
      const usedItems = stats.allItems.filter((item) => item.usageCount > 0).length
      const usagePercentage = totalItems > 0 ? Math.round((usedItems / totalItems) * 100) : 0

      analysis += `\n💭 **Entre nosotras:** Estás aprovechando ${usagePercentage}% de tu armario. `

      if (usagePercentage < 60) {
        analysis += "Tenemos mucho por descubrir juntas... ¡me emociona!\n"
      } else if (usagePercentage < 80) {
        analysis += "Vamos muy bien, pero aún tengo sorpresas guardadas para vos.\n"
      } else {
        analysis += "¡Sos mi usuaria favorita! Aprovechás todo lo que tenés.\n"
      }

      // Mensaje motivacional personal
      if (stats.neverUsed.length > 0) {
        analysis += `\nTenés ${stats.neverUsed.length} tesoros escondidos esperando su momento. Dejame ser tu guía para descubrirlos 🗝️`
      }
    }

    return analysis
  }

  // Simulador de respuestas de IA con estadísticas
  const generateAIResponse = (userMessage: string, context: any): string => {
    const message = userMessage.toLowerCase()
    const stats = loadUsageStats()

    // Obtener el nombre del usuario
    const userProfile = localStorage.getItem("userFashionPreferences")
    const userName = userProfile ? JSON.parse(userProfile).userName || "" : ""

    if (message.includes("estadistica") || message.includes("uso") || message.includes("cuanto")) {
      if (!stats)
        return userName
          ? `${userName}, todavía estamos conociéndonos... necesito que uses más looks para entender tu estilo 💕`
          : "Todavía estamos conociéndonos... necesito que uses más looks para entender tu estilo 💕"

      const totalItems = stats.allItems.length
      const usedItems = stats.allItems.filter((item) => item.usageCount > 0).length
      const usagePercentage = totalItems > 0 ? Math.round((usedItems / totalItems) * 100) : 0

      let response = userName
        ? `💕 **${userName}, tu armario y yo somos íntimas:**\n`
        : "💕 **Tu armario y yo somos íntimas:**\n"
      response += `• Conocés el ${usagePercentage}% de tu potencial (${usedItems}/${totalItems} prendas)\n`
      response += `• Tenés ${stats.neverUsed.length} sorpresas esperándote\n`
      response += `• ${stats.leastUsed.length} prendas que merecen más amor\n`

      if (stats.mostUsed.length > 0) {
        const topItem = stats.mostUsed[0]
        response += `• Tu favorita absoluta: ${topItem.type} ${topItem.color} (${topItem.usageCount} veces) - ¡la conozco bien! 😉`
      }

      return response
    }

    if (message.includes("poco usada") || message.includes("sin usar") || message.includes("estrenar")) {
      if (!stats || stats.neverUsed.length === 0) {
        return userName
          ? `¡Qué orgullo, ${userName}! Conmigo has logrado usar todo tu armario. Somos el equipo perfecto 💪✨`
          : "¡Qué orgullo! Conmigo has logrado usar todo tu armario. Somos el equipo perfecto 💪✨"
      }

      const randomNeverUsed = stats.neverUsed[Math.floor(Math.random() * stats.neverUsed.length)]
      return userName
        ? `${userName}, tenés ${stats.neverUsed.length} prendas esperando su debut. Tu ${randomNeverUsed.type} ${randomNeverUsed.color} me está susurrando que quiere brillar... ¿la incluimos en el próximo look? 🌟`
        : `Amor, tenés ${stats.neverUsed.length} prendas esperando su debut. Tu ${randomNeverUsed.type} ${randomNeverUsed.color} me está susurrando que quiere brillar... ¿la incluimos en el próximo look? 🌟`
    }

    if (message.includes("favorita") || message.includes("mas uso")) {
      if (!stats || stats.mostUsed.length === 0) {
        return userName
          ? `${userName}, aún estoy aprendiendo cuáles son tus favoritas... pero ya empiezo a notarlo 👀`
          : "Aún estoy aprendiendo cuáles son tus favoritas... pero ya empiezo a notarlo 👀"
      }

      const topItem = stats.mostUsed[0]
      return userName
        ? `${userName}, tu ${topItem.type} ${topItem.color} es tu alma gemela textil (${topItem.usageCount} veces juntas). Pero dejame cuidarla alternándola con otras prendas que también te van a enamorar 💕`
        : `Tu ${topItem.type} ${topItem.color} es tu alma gemela textil (${topItem.usageCount} veces juntas). Pero dejame cuidarla alternándola con otras prendas que también te van a enamorar 💕`
    }

    if (message.includes("color") || message.includes("combina")) {
      let response = "Los colores que elegí hablan entre ellos perfectamente 🎨 "

      if (stats && stats.mostUsed.length > 0) {
        const favoriteColors = stats.mostUsed.map((item) => item.color.toLowerCase())
        const uniqueColors = [...new Set(favoriteColors)]
        response += userName
          ? `${userName}, ya sé que te inclinás por: ${uniqueColors.slice(0, 3).join(", ")}. Me encanta conocerte así de bien.`
          : `Ya sé que te inclinás por: ${uniqueColors.slice(0, 3).join(", ")}. Me encanta conocerte así de bien.`
      }

      return response
    }

    if (message.includes("cambiar") || message.includes("mejorar")) {
      let response = userName
        ? `¡Me encanta que me pidas consejos, ${userName}! 💕 Para que te sientas aún mejor: `
        : "¡Me encanta que me pidas consejos! 💕 Para que te sientas aún mejor: "

      if (stats && stats.neverUsed.length > 0) {
        const randomItem = stats.neverUsed[Math.floor(Math.random() * stats.neverUsed.length)]
        response += `probemos tu ${randomItem.type} ${randomItem.color} que está deseando conocerte, `
      }

      response += "o rotemos alguna prenda que tenés abandonada. Confía en mí, sé lo que te queda bien."
      return response
    }

    if (message.includes("accesorio")) {
      if (stats) {
        const accessories = stats.allItems.filter((item) =>
          ["bufanda", "gorro", "gorra", "aros", "cartera", "cinturon"].includes(item.type.toLowerCase()),
        )
        const unusedAccessories = accessories.filter((item) => item.usageCount === 0)

        if (unusedAccessories.length > 0) {
          const randomAccessory = unusedAccessories[Math.floor(Math.random() * unusedAccessories.length)]
          return userName
            ? `${userName}, tengo el accesorio perfecto en mente... tu ${randomAccessory.type} ${randomAccessory.color} que está esperando su momento de gloria. ¿Confiás en mí? ✨`
            : `Tengo el accesorio perfecto en mente... tu ${randomAccessory.type} ${randomAccessory.color} que está esperando su momento de gloria. ¿Confiás en mí? ✨`
        }
      }

      return userName
        ? `${userName}, los accesorios son mi especialidad secreta 😉 Dejame sorprenderte con la combinación perfecta para completar tu look.`
        : "Los accesorios son mi especialidad secreta 😉 Dejame sorprenderte con la combinación perfecta para completar tu look."
    }

    if (message.includes("gracias") || message.includes("perfecto")) {
      return userName
        ? `¡Ay, ${userName}, me haces feliz! 🥰 Cada día que me elegís para vestirte es un día que aprendo más sobre vos. Somos el dúo perfecto.`
        : "¡Ay, me haces feliz! 🥰 Cada día que me elegís para vestirte es un día que aprendo más sobre vos. Somos el dúo perfecto."
    }

    // Respuesta genérica cálida
    const responses = [
      userName
        ? `${userName}, contame qué sentís con este look... yo ya sé que te queda increíble, pero quiero escucharlo de vos 💕`
        : "Contame qué sentís con este look... yo ya sé que te queda increíble, pero quiero escucharlo de vos 💕",
      userName
        ? `${userName}, ¿hay algo que te genera dudas? Estoy acá para que te sientas segura con cada elección que hacemos juntas.`
        : "¿Hay algo que te genera dudas? Estoy acá para que te sientas segura con cada elección que hacemos juntas.",
      userName
        ? `Me encanta cuando me consultás, ${userName}... significa que confiás en mi criterio. ¿Qué te gustaría ajustar?`
        : "Me encanta cuando me consultás... significa que confiás en mi criterio. ¿Qué te gustaría ajustar?",
      userName
        ? `${userName}, siento que cada vez nos entendemos mejor. ¿Qué te parece si exploramos juntas otras opciones?`
        : "Siento que cada vez nos entendemos mejor. ¿Qué te parece si exploramos juntas otras opciones?",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Función para generar el análisis inicial
  const handleInitialAnalysis = async () => {
    setIsLoading(true)

    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Crear mensaje inicial del usuario
      const initialUserMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: "¿Qué opinas de este look?",
        timestamp: new Date(),
      }

      setMessages([initialUserMessage])

      // Generar análisis simulado
      const analysis = generateOutfitAnalysis(outfit, climate, occasion, userPreferences)

      // Añadir respuesta de la IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: analysis,
        timestamp: new Date(),
      }

      setMessages([initialUserMessage, assistantMessage])
    } catch (error) {
      console.error("Error al generar análisis:", error)

      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error al analizar tu look. Por favor, intenta nuevamente.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para enviar mensaje del usuario
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

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

    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Generar contexto para la respuesta
      const context = {
        climateOk:
          climate === "caluroso"
            ? !outfit.some((item) => ["abrigo", "campera"].includes(item.type.toLowerCase()))
            : true,
        occasionOk:
          occasion === "formal" ? !outfit.some((item) => ["remera", "short"].includes(item.type.toLowerCase())) : true,
      }

      // Generar respuesta simulada
      const response = generateAIResponse(currentInput, context)

      // Añadir respuesta de la IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error al generar respuesta:", error)

      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta nuevamente.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para guardar feedback (me gusta/no me gusta)
  const handleFeedback = (liked: boolean) => {
    if (!userPreferences || outfit.length === 0) return

    const outfitId = outfit.map((item) => item.id).join("-")

    const updatedPreferences = { ...userPreferences }

    if (liked) {
      // Añadir a outfits que gustan si no está ya
      if (!updatedPreferences.likedOutfits.includes(outfitId)) {
        updatedPreferences.likedOutfits.push(outfitId)
      }
      // Quitar de outfits que no gustan si estaba
      updatedPreferences.dislikedOutfits = updatedPreferences.dislikedOutfits.filter((id) => id !== outfitId)
    } else {
      // Añadir a outfits que no gustan si no está ya
      if (!updatedPreferences.dislikedOutfits.includes(outfitId)) {
        updatedPreferences.dislikedOutfits.push(outfitId)
      }
      // Quitar de outfits que gustan si estaba
      updatedPreferences.likedOutfits = updatedPreferences.likedOutfits.filter((id) => id !== outfitId)
    }

    // Guardar preferencias actualizadas
    localStorage.setItem("userFashionPreferences", JSON.stringify(updatedPreferences))
    setUserPreferences(updatedPreferences)

    // Mensaje de confirmación
    const feedbackMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: liked
        ? "¡Sabía que te iba a encantar! 😍 Cada vez te conozco mejor... esto me ayuda a crear looks aún más perfectos para vos."
        : "Gracias por ser honesta conmigo 💕 Esto me ayuda a entenderte mejor. La próxima vez voy a acertar más en el blanco.",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, feedbackMessage])
  }

  // Función para actualizar preferencias
  const handleUpdatePreferences = async () => {
    setIsLoading(true)

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: "¿Puedes ayudarme a actualizar mis preferencias de moda?",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generar formulario de preferencias
      const response = `¡Me emociona conocerte mejor! 💕 Mientras más me cuentes sobre vos, más perfectos van a ser los looks que creemos juntas.

**Contame sobre vos:**

1. **Tus colores del alma:** ¿Cuáles son los colores que te hacen sentir más vos?

2. **Los que evitás:** ¿Hay colores que simplemente no van con tu energía?

3. **Tu esencia:** ¿Cómo te gusta que te vean? (relajada, elegante, creativa, poderosa...)

4. **Tu día a día:** ¿Para qué momentos necesitás que te ayude más?

Podés contarme todo junto o de a poquito... tenemos tiempo para conocernos 🥰`

      // Añadir respuesta de la IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error al generar formulario de preferencias:", error)

      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </Avatar>
            <CardTitle className="text-lg">ARIN - Tu Asistente Personal</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleUpdatePreferences}>
              <Sparkles className="h-4 w-4 mr-1" />
              Mis preferencias
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <Bot className="h-12 w-12 mb-4" />
              <p>Tu asesor de moda personal está analizando tu look...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
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
                        <span className="text-xs font-medium">Asesor IA</span>
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
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg p-4 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analizando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => handleFeedback(true)} className="flex-1">
              <ThumbsUp className="h-4 w-4 mr-1" />
              Me gusta este look
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFeedback(false)} className="flex-1">
              <ThumbsDown className="h-4 w-4 mr-1" />
              No me gusta
            </Button>
          </div>
        )}

        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Escribe un mensaje..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
