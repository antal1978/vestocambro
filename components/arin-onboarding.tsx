"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { useRouter } from "next/navigation"

type OnboardingStep = {
  id: string
  question: string
  type: "text" | "multiple" | "colors"
  options?: string[]
  key: string
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

const onboardingSteps: OnboardingStep[] = [
  {
    id: "1",
    question: "¡Hola! Soy ARIN, tu nueva asistente de armario personal 💕 ¿Cómo te gusta que te llamen?",
    type: "text",
    key: "userName",
  },
  {
    id: "2",
    question: "¡Perfecto! Ahora contame, ¿cuáles son tus colores favoritos para vestirte?",
    type: "colors",
    options: ["Negro", "Blanco", "Azul", "Rojo", "Verde", "Rosa", "Amarillo", "Violeta", "Gris", "Marrón"],
    key: "favoriteColors",
  },
  {
    id: "3",
    question: "¿Y hay algún color que no te guste usar?",
    type: "colors",
    options: ["Negro", "Blanco", "Azul", "Rojo", "Verde", "Rosa", "Amarillo", "Violeta", "Gris", "Marrón"],
    key: "dislikedColors",
  },
  {
    id: "4",
    question: "¿Cómo describirías tu estilo personal?",
    type: "multiple",
    options: ["Casual", "Elegante", "Deportivo", "Bohemio", "Minimalista", "Romántico", "Urbano", "Clásico"],
    key: "preferredStyle",
  },
  {
    id: "5",
    question: "¿Para qué ocasiones necesitás más ayuda para vestirte?",
    type: "multiple",
    options: ["Trabajo", "Casual/Diario", "Salidas nocturnas", "Eventos especiales", "Deportes", "Viajes"],
    key: "occasions",
  },
]

export function ArinOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    favoriteColors: [],
    dislikedColors: [],
    occasions: [],
    likedOutfits: [],
    dislikedOutfits: [],
  })
  const [textInput, setTextInput] = useState("")
  const router = useRouter()

  // Verificar si ya completó el onboarding
  useEffect(() => {
    const existingProfile = localStorage.getItem("userFashionPreferences")
    if (existingProfile) {
      const profile = JSON.parse(existingProfile)
      if (profile.onboardingCompleted) {
        router.push("/")
        return
      }
    }
  }, [router])

  const currentStepData = onboardingSteps[currentStep]

  const handleTextSubmit = () => {
    if (!textInput.trim()) return

    setUserProfile((prev) => ({
      ...prev,
      [currentStepData.key]: textInput.trim(),
    }))

    setTextInput("")
    nextStep()
  }

  const handleMultipleChoice = (option: string) => {
    if (currentStepData.type === "multiple") {
      setUserProfile((prev) => ({
        ...prev,
        [currentStepData.key]: option,
      }))
    } else if (currentStepData.type === "colors") {
      const currentColors = (userProfile[currentStepData.key as keyof UserProfile] as string[]) || []
      const updatedColors = currentColors.includes(option)
        ? currentColors.filter((color) => color !== option)
        : [...currentColors, option]

      setUserProfile((prev) => ({
        ...prev,
        [currentStepData.key]: updatedColors,
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const completeOnboarding = () => {
    const completeProfile: UserProfile = {
      userName: userProfile.userName || "Usuario",
      favoriteColors: userProfile.favoriteColors || [],
      dislikedColors: userProfile.dislikedColors || [],
      preferredStyle: userProfile.preferredStyle || "Casual",
      occasions: userProfile.occasions || [],
      bodyType: userProfile.bodyType,
      likedOutfits: [],
      dislikedOutfits: [],
      lifestyle: userProfile.lifestyle,
      personalityTraits: userProfile.personalityTraits,
      onboardingCompleted: true,
    }

    localStorage.setItem("userFashionPreferences", JSON.stringify(completeProfile))
    router.push("/")
  }

  const canProceed = () => {
    if (currentStepData.type === "text") {
      return textInput.trim().length > 0
    } else if (currentStepData.type === "colors") {
      const colors = userProfile[currentStepData.key as keyof UserProfile] as string[]
      return colors && colors.length > 0
    } else if (currentStepData.type === "multiple") {
      return userProfile[currentStepData.key as keyof UserProfile]
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-16 w-16 bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">ARIN</CardTitle>
          <p className="text-muted-foreground">Tu asistente de armario personal</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progreso */}
          <div className="flex justify-center space-x-2 mb-6">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${index <= currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          {/* Pregunta */}
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">{currentStepData.question}</h2>

            {/* Input de texto */}
            {currentStepData.type === "text" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProceed()) {
                      handleTextSubmit()
                    }
                  }}
                />
              </div>
            )}

            {/* Opciones múltiples */}
            {(currentStepData.type === "multiple" || currentStepData.type === "colors") && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentStepData.options?.map((option) => {
                  const isSelected =
                    currentStepData.type === "colors"
                      ? ((userProfile[currentStepData.key as keyof UserProfile] as string[]) || []).includes(option)
                      : userProfile[currentStepData.key as keyof UserProfile] === option

                  return (
                    <Button
                      key={option}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleMultipleChoice(option)}
                      className="h-12"
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStepData.type === "text" ? (
              <Button onClick={handleTextSubmit} disabled={!canProceed()}>
                {currentStep === onboardingSteps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()}>
                {currentStep === onboardingSteps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            )}
          </div>

          {/* Mensaje de ayuda para colores */}
          {currentStepData.type === "colors" && (
            <p className="text-sm text-muted-foreground text-center">
              Podés seleccionar varios colores. Hacé clic en los que te gusten.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
