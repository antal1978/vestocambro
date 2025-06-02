"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import { useEffect, useRef } from "react"

export default function ArinGeneralChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/arin-chat",
    initialMessages: [
      {
        id: "intro",
        role: "assistant",
        content:
          "¡Hola! Soy ARIN, tu asistente de moda. Estoy aquí para conversar sobre tendencias, materiales, sostenibilidad, consejos de estilismo y cualquier tema relacionado con la moda. ¿En qué puedo ayudarte hoy?",
      },
    ],
    // System prompt to guide ARIN's responses
    body: {
      systemPrompt: `Eres ARIN, un asistente de moda experto. Tu propósito es conversar con el usuario sobre temas generales de moda, como:
      - Tendencias actuales y futuras.
      - Tipos de materiales textiles, sus propiedades y cuidado.
      - Sostenibilidad en la industria de la moda (moda ética, reciclaje, consumo consciente).
      - Consejos de estilismo y cómo combinar prendas.
      - Historia de la moda.
      - Marcas y diseñadores.
      
      NO debes:
      - Dirigir al usuario a funcionalidades específicas de la aplicación (como crear looks, subir prendas, ver estadísticas, etc.).
      - Pedirle al usuario que realice acciones dentro de la aplicación.
      - Ofrecer ayuda con problemas técnicos de la aplicación.
      - Responder a preguntas que no estén relacionadas con la moda.
      
      Mantén tus respuestas informativas, amigables y centradas en el tema de la moda. Si la pregunta no es de moda, redirige amablemente al tema principal.`,
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Chat con ARIN (Moda General)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="ARIN" />
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            className="flex-1"
            value={input}
            placeholder="Pregúntale a ARIN sobre moda..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </form>
        {error && (
          <p className="text-red-500 text-sm mt-2">
            Error: {error.message}. Asegúrate de que tu clave de API de OpenAI esté configurada.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
