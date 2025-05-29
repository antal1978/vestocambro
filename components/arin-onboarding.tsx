"use client"

// components/arin-onboarding.tsx

import type React from "react"
import { useState } from "react"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

const ArinOnboarding: React.FC<{
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setConversationState: React.Dispatch<React.SetStateAction<string>>
}> = ({ setMessages, setConversationState }) => {
  const [isLoading, setIsLoading] = useState(false)

  const startOnboarding = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `¡Hola! 💕 Soy ARIN, tu asistente personal de moda. 

Mi misión es ayudarte a optimizar el uso de todas las prendas que tenés en tu armario para crear looks increíbles, revalorizando cada pieza que ya tenés. 

Creo firmemente que no necesitás comprar más ropa para verte espectacular - solo necesitás aprender a combinar mejor lo que ya tenés. Paulatinamente, también te voy a enseñar cómo tomar buenas decisiones de compra para que tu ropa sea funcional, dure más y nada quede olvidado en el fondo del armario. ✨

Para poder ayudarte mejor, me gustaría conocerte un poco. ¿Cómo te gusta que te llamen?`,
      timestamp: new Date(),
    }

    setMessages([initialMessage])
    setConversationState("asking_name")
    setIsLoading(false)
  }

  return (
    <div>
      <button onClick={startOnboarding} disabled={isLoading}>
        {isLoading ? "Cargando..." : "Comenzar Onboarding"}
      </button>
    </div>
  )
}

export { ArinOnboarding }
