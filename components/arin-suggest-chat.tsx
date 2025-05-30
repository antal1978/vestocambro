"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { getSuggestedLooks } from "@/lib/outfit-suggestion-algorithm"
import type { ClothingItem } from "@/types/ClothingItem"

export interface ArinSuggestChatProps {
  isOpen: boolean
  onClose: () => void
  onDecision: () => void
  items: any[]
  baseItem: any | null
  startWithPresentation: boolean
}

interface Message {
  id: string
  sender: "arin" | "user"
  content: string
  type?: "text" | "options" | "look"
  options?: string[]
  look?: ClothingItem[]
}

export function ArinSuggestChat({
  isOpen,
  onClose,
  onDecision,
  items,
  baseItem,
  startWithPresentation,
}: ArinSuggestChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState("dayOrNight")
  const [selectedDayNight, setSelectedDayNight] = useState("")
  const [selectedActivity, setSelectedActivity] = useState("")
  const [selectedClimate, setSelectedClimate] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [allSuggestedLooks, setAllSuggestedLooks] = useState<ClothingItem[][]>([])
  const [currentLookIndex, setCurrentLookIndex] = useState(0)
  const [currentLook, setCurrentLook] = useState<ClothingItem[] | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (startWithPresentation && messages.length === 0 && !isResetting) {
      // Obtener el nombre del usuario del localStorage
      const userData = localStorage.getItem("arinUserData")
      const userName = userData ? JSON.parse(userData).name : null

      let initialMessage = ""

      if (userName) {
        // Si ya conocemos al usuario, conversación personalizada
        const greetings = [
          `¡Hola ${userName}! ¿Cómo andás? 😊`,
          `¡Ey ${userName}! ¡Qué bueno verte de nuevo! ✨`,
          `¡${userName}! ¡Hola amiga! ¿Qué vamos a armar hoy?`,
          `¡${userName}! ¿Lista para crear un look increíble? 💫`,
          `¡Hola ${userName}! ¿Qué tal? ¡Vamos a vestirte divina! ✨`,
        ]
        initialMessage = greetings[Math.floor(Math.random() * greetings.length)]
      } else {
        // Si no conocemos al usuario, presentación completa
        const introductions = [
          "¡Hola! Soy ARIN, tu nueva amiga fashionista. 👗✨ ¡Vamos a armar looks increíbles juntas!",
          "¡Hola! Soy ARIN y me encanta la moda. 💕 ¡Vamos a crear algo hermoso para vos!",
          "¡Hola! Soy ARIN, tu asesora de estilo personal. ✨ ¡Preparate para verte increíble!",
        ]
        initialMessage = introductions[Math.floor(Math.random() * introductions.length)]
      }

      const dayNightQuestions = [
        "¡Dale! ¿Estás buscando algo para el día o para la noche?",
        "Contame, ¿necesitás un look para el día o para la noche?",
        "¿Qué vamos a armar? ¿Algo para el día o para la noche?",
        "¿Para cuándo es el look? ¿Día o noche?",
      ]

      setMessages([
        {
          id: "1",
          sender: "arin",
          content: `${initialMessage} ${dayNightQuestions[Math.floor(Math.random() * dayNightQuestions.length)]}`,
          type: "options",
          options: ["🌅 Día", "🌙 Noche"],
        },
      ])
    }
  }, [startWithPresentation, messages.length, isResetting])

  const addMessage = (
    sender: "arin" | "user",
    content: string,
    type: "text" | "options" | "look" = "text",
    options?: string[],
    look?: ClothingItem[],
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      type,
      options,
      look,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleDayNightSelection = (choice: string) => {
    const dayNightMap: { [key: string]: string } = {
      "🌅 Día": "dia",
      "🌙 Noche": "noche",
    }

    const selectedChoice = dayNightMap[choice]
    setSelectedDayNight(selectedChoice)
    addMessage("user", choice)

    setTimeout(() => {
      if (selectedChoice === "dia") {
        const dayQuestions = [
          "¡Perfecto! Contame, ¿qué vas a hacer?",
          "¡Buenísimo! ¿Qué tenés planeado para el día?",
          "¡Genial! ¿Cuál es el plan para hoy?",
          "¡Dale! ¿Qué actividad vas a hacer?",
        ]
        addMessage("arin", dayQuestions[Math.floor(Math.random() * dayQuestions.length)], "options", [
          "💼 Trabajar en oficina",
          "🏠 Trabajar desde casa o estar en casa",
          "🚶‍♀️ Salir a pasear",
        ])
      } else {
        const nightQuestions = [
          "¡Buenísimo! ¿Qué tipo de salida tenés planeada?",
          "¡Perfecto! ¿Qué vas a hacer esta noche?",
          "¡Genial! Contame, ¿qué tipo de evento es?",
          "¡Dale! ¿Cómo va a ser la salida?",
        ]
        addMessage("arin", nightQuestions[Math.floor(Math.random() * nightQuestions.length)], "options", [
          "🍷 Evento formal (cena elegante, fiesta)",
          "🎬 Salida informal (bar, cine, juntada)",
        ])
      }
      setCurrentStep("activity")
    }, 1000)
  }

  const handleActivitySelection = (activity: string) => {
    const activityMap: { [key: string]: string } = {
      "💼 Trabajar en oficina": "trabajo",
      "🏠 Trabajar desde casa o estar en casa": "dia-casual",
      "🚶‍♀️ Salir a pasear": "salidas-informales",
      "🍷 Evento formal (cena elegante, fiesta)": "salidas-formales",
      "🎬 Salida informal (bar, cine, juntada)": "salidas-informales",
    }

    const selectedActivityKey = activityMap[activity]
    setSelectedActivity(selectedActivityKey)
    addMessage("user", activity)

    setTimeout(() => {
      const climateQuestions = [
        "¡Genial! ¿Cómo está el clima por donde andás?",
        "¡Perfecto! ¿Qué tal está el tiempo hoy?",
        "¡Buenísimo! Contame del clima, ¿cómo está?",
        "¡Dale! ¿Hace calor, frío o está templado?",
      ]
      addMessage("arin", climateQuestions[Math.floor(Math.random() * climateQuestions.length)], "options", [
        "☀️ Caluroso",
        "🌤️ Templado",
        "❄️ Frío",
      ])
      setCurrentStep("climate")
    }, 1000)
  }

  const handleClimateSelection = (climate: string) => {
    const climateMap: { [key: string]: string } = {
      "☀️ Caluroso": "calor",
      "🌤️ Templado": "templado",
      "❄️ Frío": "frio",
    }

    const selectedClimateKey = climateMap[climate]
    setSelectedClimate(selectedClimateKey)
    addMessage("user", climate)

    setTimeout(() => {
      const styleQuestions = [
        "¡Perfecto! Ahora contame, ¿cómo te gusta vestirte? ¿Más...",
        "¡Genial! ¿Qué onda con tu estilo? ¿Te va más...",
        "¡Buenísimo! ¿Cómo querés sentirte hoy? ¿Más...",
        "¡Dale! ¿Qué vibra buscás? ¿Algo más...",
      ]
      addMessage("arin", styleQuestions[Math.floor(Math.random() * styleQuestions.length)], "options", [
        "😌 Cómodo",
        "✨ Arreglado",
        "🎨 Creativo",
        "🎲 Sorprendeme",
      ])
      setCurrentStep("style")
    }, 1000)
  }

  const handleStyleSelection = (style: string) => {
    const styleMap: { [key: string]: string } = {
      "😌 Cómodo": "comodo",
      "✨ Arreglado": "arreglado",
      "🎨 Creativo": "creativo",
      "🎲 Sorprendeme": "sorpresa",
    }

    const selectedStyleKey = styleMap[style]
    setSelectedStyle(selectedStyleKey)
    addMessage("user", style)

    setTimeout(() => {
      const generatingMessages = [
        "¡Amo! Ya sé exactamente qué necesitás. Déjame revisar tu armario y armar algo increíble... ✨",
        "¡Perfecto! Ya tengo la idea. Déjame buscar en tu armario y crear algo hermoso... 💫",
        "¡Buenísimo! Se me ocurrió algo genial. Voy a revisar tus prendas y armar el look perfecto... ✨",
        "¡Dale! Ya sé qué hacer. Déjame combinar tus prendas y crear algo divino... 🌟",
      ]
      addMessage("arin", generatingMessages[Math.floor(Math.random() * generatingMessages.length)])
      generateLooks(selectedActivity, selectedClimate, selectedStyleKey)
    }, 1000)
  }

  const generateLooks = (activity: string, climate: string, style: string) => {
    // Obtener prendas del localStorage
    const storedItems = localStorage.getItem("clothingItems")
    const wardrobeItems: ClothingItem[] = storedItems ? JSON.parse(storedItems) : []

    // Si no hay prendas, usar datos de ejemplo
    const itemsToUse =
      wardrobeItems.length > 0
        ? wardrobeItems
        : [
            {
              id: "1",
              name: "Remera Blanca",
              type: "remera",
              color: "blanco",
              occasion: "dia-casual",
              climate: "templado",
              image: "/white-tshirt.png",
            },
            {
              id: "2",
              name: "Jean Azul",
              type: "jean",
              color: "azul",
              occasion: "dia-casual",
              climate: "templado",
              image: "/blue-jeans.png",
            },
            {
              id: "3",
              name: "Zapatillas Blancas",
              type: "calzado",
              color: "blanco",
              occasion: "dia-casual",
              climate: "templado",
              image: "/white-sneakers.png",
            },
          ]

    const looks = getSuggestedLooks(itemsToUse, activity, climate, style, 5)
    setAllSuggestedLooks(looks)
    setCurrentLookIndex(0)

    setTimeout(() => {
      if (looks.length > 0) {
        const firstLook = looks[0]
        setCurrentLook(firstLook)

        const presentationMessages = [
          "¡Listo amiga! Mirá lo que armé para vos:",
          "¡Ta-da! Acá tenés tu look perfecto:",
          "¡Listo! Mirá esta combinación que creé:",
          "¡Terminé! Acá está tu nuevo look:",
        ]
        addMessage(
          "arin",
          presentationMessages[Math.floor(Math.random() * presentationMessages.length)],
          "look",
          undefined,
          firstLook,
        )

        setTimeout(() => {
          const feedbackQuestions = [
            "¿Qué te parece? ¿Te copa este look?",
            "¿Te gusta? ¿Qué opinás?",
            "¿Cómo lo ves? ¿Te convence?",
            "¿Qué tal? ¿Te gusta cómo quedó?",
          ]
          addMessage("arin", feedbackQuestions[Math.floor(Math.random() * feedbackQuestions.length)], "options", [
            "💕 ¡Me encanta!",
            "😕 No me convence",
          ])
          setCurrentStep("lookFeedback")
        }, 1500)
      } else {
        addMessage(
          "arin",
          "Lo siento, no encontré suficientes prendas en tu armario para estos criterios. ¿Te gustaría añadir más prendas o cambiar los criterios?",
          "options",
          ["➕ Añadir prendas", "🎯 Cambiar criterios"],
        )
      }
    }, 2000)
  }

  const handleLookFeedback = (feedback: string) => {
    addMessage("user", feedback)

    if (feedback === "💕 ¡Me encanta!") {
      setTimeout(() => {
        const usageQuestions = [
          "¡Sabía que te iba a gustar! ¿Te lo vas a poner? Me re sirve saberlo para conocerte mejor 😊",
          "¡Genial! ¿Lo vas a usar? Así aprendo más sobre tu estilo 💕",
          "¡Perfecto! ¿Te lo ponés? Me ayuda a conocer tus gustos ✨",
          "¡Amo que te guste! ¿Lo vas a estrenar? Así sé qué te queda bien 😊",
        ]
        addMessage("arin", usageQuestions[Math.floor(Math.random() * usageQuestions.length)], "options", [
          "✨ ¡Sí, me lo pongo!",
          "🤔 Me gusta pero no ahora",
        ])
        setCurrentStep("usageFeedback")
      }, 1000)
    } else {
      setTimeout(() => {
        const alternativeOffers = [
          "¡Tranqui! No pasa nada. ¿Qué querés hacer?",
          "¡No te preocupes! ¿Probamos otra cosa?",
          "¡Está bien! ¿Qué te parece si...?",
          "¡Dale! ¿Qué preferís hacer?",
        ]
        addMessage("arin", alternativeOffers[Math.floor(Math.random() * alternativeOffers.length)], "options", [
          "🔄 Ver otro look",
          "🎯 Cambiar criterios",
        ])
        setCurrentStep("nextAction")
      }, 1000)
    }
  }

  const handleUsageFeedback = (usage: string) => {
    addMessage("user", usage)

    if (usage === "✨ ¡Sí, me lo pongo!") {
      setTimeout(() => {
        const confirmationMessages = [
          "¡Genial! Ya lo anoté para conocerte mejor. ¡Vas a estar divina con ese look! ✨",
          "¡Perfecto! Lo guardé en mis notas. ¡Te va a quedar hermoso! 💕",
          "¡Buenísimo! Ya lo tengo anotado. ¡Vas a lucir increíble! ✨",
          "¡Amo! Lo registré para futuras sugerencias. ¡Vas a estar preciosa! 🌟",
        ]
        addMessage("arin", confirmationMessages[Math.floor(Math.random() * confirmationMessages.length)])
        saveUsageStats(currentLook)
      }, 1000)
    } else {
      setTimeout(() => {
        const nextStepOffers = [
          "¡Dale! ¿Querés que te muestre otra opción o cambiamos la búsqueda?",
          "¡Perfecto! ¿Vemos otro look o probamos con otros criterios?",
          "¡Buenísimo! ¿Te muestro otra alternativa o cambiamos el enfoque?",
          "¡Genial! ¿Otra opción o empezamos de nuevo?",
        ]
        addMessage("arin", nextStepOffers[Math.floor(Math.random() * nextStepOffers.length)], "options", [
          "🔄 Ver otro look",
          "🎯 Cambiar criterios",
        ])
        setCurrentStep("nextAction")
      }, 1000)
    }
  }

  const handleNextAction = (action: string) => {
    addMessage("user", action)

    if (action === "🔄 Ver otro look") {
      const nextIndex = currentLookIndex + 1
      if (nextIndex < allSuggestedLooks.length) {
        setCurrentLookIndex(nextIndex)
        const nextLook = allSuggestedLooks[nextIndex]
        setCurrentLook(nextLook)

        setTimeout(() => {
          const nextLookMessages = [
            "¡Mirá esta otra opción que tengo para vos!",
            "¡Acá va otra alternativa!",
            "¡Probemos con esta combinación!",
            "¡Te muestro otra idea!",
          ]
          addMessage(
            "arin",
            nextLookMessages[Math.floor(Math.random() * nextLookMessages.length)],
            "look",
            undefined,
            nextLook,
          )
          setTimeout(() => {
            const feedbackQuestions = [
              "¿Qué te parece? ¿Te copa este look?",
              "¿Te gusta? ¿Qué opinás?",
              "¿Cómo lo ves? ¿Te convence?",
              "¿Qué tal? ¿Te gusta cómo quedó?",
            ]
            addMessage("arin", feedbackQuestions[Math.floor(Math.random() * feedbackQuestions.length)], "options", [
              "💕 ¡Me encanta!",
              "😕 No me convence",
            ])
            setCurrentStep("lookFeedback")
          }, 1000)
        }, 1000)
      } else {
        setTimeout(() => {
          const noMoreLooksMessages = [
            "¡Uy! Se me acabaron las ideas con estos criterios. ¿Querés que invente algo nuevo?",
            "¡Ups! Ya no tengo más opciones con esta búsqueda. ¿Probamos algo diferente?",
            "¡Ay! Se me terminaron las combinaciones. ¿Generamos nuevas ideas?",
            "¡Oops! No tengo más looks con estos criterios. ¿Qué hacemos?",
          ]
          addMessage("arin", noMoreLooksMessages[Math.floor(Math.random() * noMoreLooksMessages.length)], "options", [
            "🎲 Generar nuevos looks",
            "🎯 Cambiar criterios",
          ])
        }, 1000)
      }
    } else if (action === "🎯 Cambiar criterios") {
      // Marcar que estamos reseteando para evitar el bucle
      setIsResetting(true)

      // Limpiar todos los estados
      setCurrentStep("dayOrNight")
      setSelectedDayNight("")
      setSelectedActivity("")
      setSelectedClimate("")
      setSelectedStyle("")
      setAllSuggestedLooks([])
      setCurrentLookIndex(0)
      setCurrentLook(null)

      // Limpiar mensajes anteriores y añadir nuevo mensaje inicial
      setTimeout(() => {
        setMessages([])
        setTimeout(() => {
          // Obtener el nombre del usuario del localStorage
          const userData = localStorage.getItem("arinUserData")
          const userName = userData ? JSON.parse(userData).name : null

          const restartMessages = [
            "¡Dale! Empecemos de nuevo.",
            "¡Perfecto! Vamos desde el principio.",
            "¡Buenísimo! Arrancamos otra vez.",
            "¡Genial! Probemos con algo diferente.",
          ]

          const dayNightQuestions = [
            "¿Buscás algo para el día o para la noche?",
            "¿Necesitás un look para el día o para la noche?",
            "¿Qué vamos a armar? ¿Día o noche?",
            "¿Para cuándo es? ¿Día o noche?",
          ]

          let initialMessage = ""
          if (userName) {
            initialMessage = `${restartMessages[Math.floor(Math.random() * restartMessages.length)]} ${userName}, ${dayNightQuestions[Math.floor(Math.random() * dayNightQuestions.length)]}`
          } else {
            initialMessage = `${restartMessages[Math.floor(Math.random() * restartMessages.length)]} ${dayNightQuestions[Math.floor(Math.random() * dayNightQuestions.length)]}`
          }

          setMessages([
            {
              id: Date.now().toString(),
              sender: "arin",
              content: initialMessage,
              type: "options",
              options: ["🌅 Día", "🌙 Noche"],
            },
          ])

          // Desmarcar el reseteo después de completar
          setIsResetting(false)
        }, 500)
      }, 1000)
    } else if (action === "🎲 Generar nuevos looks") {
      setTimeout(() => {
        const regenerateMessages = [
          "¡Obvio! Déjame que se me ocurra algo más... ✨",
          "¡Dale! Voy a crear nuevas combinaciones... 💫",
          "¡Perfecto! Déjame inventar algo diferente... ✨",
          "¡Buenísimo! Voy a armar otras opciones... 🌟",
        ]
        addMessage("arin", regenerateMessages[Math.floor(Math.random() * regenerateMessages.length)])
        generateLooks(selectedActivity, selectedClimate, selectedStyle)
      }, 1000)
    }
  }

  const saveUsageStats = (look: ClothingItem[] | null) => {
    if (!look) return

    console.log("💾 Guardando estadísticas de uso para:", look)

    // Obtener estadísticas existentes
    const existingUsage = localStorage.getItem("clothingUsage")
    const usageRecord = existingUsage ? JSON.parse(existingUsage) : {}

    // Actualizar estadísticas para cada prenda del look
    look.forEach((item) => {
      if (!usageRecord[item.id]) {
        usageRecord[item.id] = {
          count: 0,
          lastUsed: "",
        }
      }
      usageRecord[item.id].count++
      usageRecord[item.id].lastUsed = new Date().toISOString()

      console.log(`📊 Prenda ${item.name} (${item.id}): ${usageRecord[item.id].count} usos`)
    })

    // Guardar en localStorage
    localStorage.setItem("clothingUsage", JSON.stringify(usageRecord))
    console.log("✅ Estadísticas guardadas correctamente")

    // También guardar el look completo usado
    const usedLooks = localStorage.getItem("usedLooks")
    const lookHistory = usedLooks ? JSON.parse(usedLooks) : []

    lookHistory.push({
      id: Date.now().toString(),
      items: look,
      date: new Date().toISOString(),
      occasion: selectedActivity,
      climate: selectedClimate,
      style: selectedStyle,
    })

    localStorage.setItem("usedLooks", JSON.stringify(lookHistory))
    console.log("✅ Look guardado en historial")
  }

  const handleOptionClick = (option: string) => {
    if (currentStep === "dayOrNight") {
      handleDayNightSelection(option)
    } else if (currentStep === "activity") {
      handleActivitySelection(option)
    } else if (currentStep === "climate") {
      handleClimateSelection(option)
    } else if (currentStep === "style") {
      handleStyleSelection(option)
    } else if (currentStep === "lookFeedback") {
      handleLookFeedback(option)
    } else if (currentStep === "usageFeedback") {
      handleUsageFeedback(option)
    } else if (currentStep === "nextAction") {
      handleNextAction(option)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold">ARIN</h3>
                <p className="text-sm opacity-90">Tu asesora de armario</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-purple-700">
              ✕
            </Button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Options */}
                  {message.type === "options" && message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Single Look */}
                  {message.type === "look" && message.look && (
                    <div className="mt-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="grid grid-cols-3 gap-2">
                          {message.look.map((item) => (
                            <div key={item.id} className="text-center">
                              <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-gray-400 text-xs">{item.name}</div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 truncate">{item.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
