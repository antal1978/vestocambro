"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User } from "lucide-react"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  expectsInput?: boolean
  inputType?: "text" | "options"
  options?: string[]
  fieldName?: string
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

export function ArinOnboarding() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    userName: "",
    favoriteColors: [],
    dislikedColors: [],
    preferredStyle: "",
    occasions: [],
    likedOutfits: [],
    dislikedOutfits: [],
    personalityTraits: [],
    onboardingCompleted: false,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Iniciar onboarding
  useEffect(() => {
    startOnboarding()
  }, [])

  // Pasos del onboarding
  const onboardingSteps = [
    {
      message:
        "¡Hola! Soy ARIN, tu nueva compañera de armario 💕 Estoy aquí para ayudarte a crear looks increíbles con lo que ya tenés. ¿Cómo te gusta que te llamen?",
      expectsInput: true,
      inputType: "text",
      fieldName: "userName",
    },
    {
      message: (name: string) =>
        `¡Encantada de conocerte, ${name}! 😊 Me encantaría saber más sobre tu estilo para poder ayudarte mejor. ¿Cuáles son tus colores favoritos? (podés mencionar varios)`,
      expectsInput: true,
      inputType: "text",
      fieldName: "favoriteColors",
    },
    {
      message: "¡Qué buena elección! 🎨 Y para conocerte mejor... ¿hay algún color que preferís evitar?",
      expectsInput: true,
      inputType: "text",
      fieldName: "dislikedColors",
    },
    {
      message:
        "Entendido. Ahora contame, ¿cómo describirías tu estilo? (casual, elegante, minimalista, bohemio, deportivo...)",
      expectsInput: true,
      inputType: "options",
      options: ["Casual", "Elegante", "Minimalista", "Bohemio", "Deportivo", "Urbano", "Clásico", "Romántico", "Otro"],
      fieldName: "preferredStyle",
    },
    {
      message:
        "¡Me encanta! Y... ¿para qué ocasiones necesitás más ayuda con tus looks? (trabajo, salidas, eventos especiales...)",
      expectsInput: true,
      inputType: "options",
      options: ["Trabajo", "Casual diario", "Salidas con amigos", "Citas", "Eventos formales", "Fiestas", "Otro"],
      fieldName: "occasions",
    },
    {
      message: (name: string) =>
        `¡Perfecto, ${name}! Ya tengo todo lo que necesito para empezar a crear looks increíbles para vos. ¿Querés que te muestre cómo funciona la app o preferís explorar por tu cuenta?`,
      expectsInput: true,
      inputType: "options",
      options: ["Mostrame cómo funciona", "Exploraré por mi cuenta"],
      fieldName: "tutorial",
    },
  ]

  // Iniciar onboarding
  const startOnboarding = async () => {
    // Verificar si ya existe un perfil
    const storedPreferences = localStorage.getItem("userFashionPreferences")
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences)
      if (preferences.onboardingCompleted) {
        // Si ya completó el onboarding, redirigir
        router.push("/gallery")
        return
      }

      // Si hay preferencias pero no completó onboarding, cargarlas
      setUserProfile((prev) => ({
        ...prev,
        ...preferences,
      }))
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Primer mensaje de ARIN
    const firstStep = onboardingSteps[0]
    const firstMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: firstStep.message,
      timestamp: new Date(),
      expectsInput: firstStep.expectsInput,
      inputType: firstStep.inputType,
      options: firstStep.options,
      fieldName: firstStep.fieldName,
    }

    setMessages([firstMessage])
    setIsLoading(false)
  }

  // Manejar respuesta del usuario
  const handleUserResponse = async () => {
    if (!inputMessage.trim() && !userProfile.userName) return

    const currentStepData = onboardingSteps[currentStep]
    const fieldName = currentStepData.fieldName as keyof UserProfile

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Actualizar perfil del usuario
    const updatedProfile = { ...userProfile }

    if (
      fieldName === "favoriteColors" ||
      fieldName === "dislikedColors" ||
      fieldName === "occasions" ||
      fieldName === "personalityTraits"
    ) {
      // Para campos que son arrays
      const values = inputMessage
        .split(/,|\s+y\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
      updatedProfile[fieldName] = values as any
    } else if (fieldName === "tutorial") {
      // No guardamos esto en el perfil, solo para navegación
    } else {
      // Para campos simples
      updatedProfile[fieldName as keyof UserProfile] = inputMessage as any
    }

    setUserProfile(updatedProfile)
    setInputMessage("")
    setIsLoading(true)

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Avanzar al siguiente paso
    const nextStep = currentStep + 1

    if (nextStep < onboardingSteps.length) {
      // Hay más pasos
      const nextStepData = onboardingSteps[nextStep]
      const nextMessage =
        typeof nextStepData.message === "function"
          ? nextStepData.message(updatedProfile.userName)
          : nextStepData.message

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: nextMessage,
        timestamp: new Date(),
        expectsInput: nextStepData.expectsInput,
        inputType: nextStepData.inputType,
        options: nextStepData.options,
        fieldName: nextStepData.fieldName,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentStep(nextStep)
    } else {
      // Onboarding completado
      const finalMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `¡Genial! Estoy muy emocionada de ayudarte con tu armario, ${updatedProfile.userName}. ¡Vamos a crear looks increíbles juntas! 💕`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, finalMessage])

      // Marcar onboarding como completado
      updatedProfile.onboardingCompleted = true

      // Guardar perfil completo
      localStorage.setItem("userFashionPreferences", JSON.stringify(updatedProfile))

      // Redirigir después de un momento
      setTimeout(() => {
        if (inputMessage.toLowerCase().includes("mostrame") || inputMessage.toLowerCase().includes("cómo funciona")) {
          router.push("/guia")
        } else {
          router.push("/gallery")
        }
      }, 3000)
    }

    setIsLoading(false)
  }

  // Seleccionar opción
  const selectOption = (option: string) => {
    setInputMessage(option)
    handleUserResponse()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/20 dark:to-secondary-950/20 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="border-b bg-primary-100/50 dark:bg-primary-900/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10 border-2 border-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </Avatar>
            <CardTitle className="text-xl">ARIN</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 h-[400px] overflow-y-auto">
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
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Escribiendo...</span>
                </div>
              </div>
            )}

            {messages.length > 0 &&
              messages[messages.length - 1].inputType === "options" &&
              messages[messages.length - 1].options && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {messages[messages.length - 1].options!.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="sm"
                      onClick={() => selectOption(option)}
                      className="bg-background hover:bg-muted/80"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="border-t p-3">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Escribe tu respuesta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleUserResponse()
                }
              }}
              disabled={isLoading || (messages.length > 0 && messages[messages.length - 1].inputType === "options")}
            />
            <Button onClick={handleUserResponse} disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
