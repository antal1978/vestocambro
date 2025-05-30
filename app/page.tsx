"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Wand2, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { ArinChat } from "@/components/arin-chat"
import { useState } from "react"

export default function Home() {
  const [showArinChat, setShowArinChat] = useState(false)

  const handleComenzar = () => {
    setShowArinChat(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Tu armario
                <span className="block text-primary-600">reinventado</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Descubrí nuevas combinaciones y sacale el máximo partido a tu ropa con la ayuda de ARIN, tu asistente
                personal de moda.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={handleComenzar}
                size="lg"
                className="text-lg px-12 py-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Comenzar
              </Button>
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/colorful-wardrobe.png"
                alt="Armario colorido con diferentes prendas organizadas"
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 animate-float"></div>
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary-200 rounded-full opacity-20 animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Qué podés hacer con ARIN?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu asistente personal de moda te ayuda a optimizar tu armario y crear looks increíbles
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="h-8 w-8 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Organizá tu armario</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Subí fotos de tus prendas y creá tu armario virtual. ARIN te ayuda a categorizar y organizar todo de
                manera inteligente.
              </CardDescription>
              <Button asChild variant="ghost" className="mt-4 group">
                <Link href="/upload">
                  Empezar a subir prendas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-secondary-600" />
              </div>
              <CardTitle className="text-xl">Creá looks únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                ARIN combina tus prendas de manera inteligente según la ocasión, clima y tu estilo personal para crear
                outfits perfectos.
              </CardDescription>
              <Button asChild variant="ghost" className="mt-4 group">
                <Link href="/suggest">
                  Crear un look ahora
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-accent-600" />
              </div>
              <CardTitle className="text-xl">Optimizá tu uso</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Descubrí qué prendas usás más, cuáles están olvidadas y recibí consejos para aprovechar mejor tu
                armario.
              </CardDescription>
              <Button asChild variant="ghost" className="mt-4 group">
                <Link href="/stats">
                  Ver mis estadísticas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">¿Lista para transformar tu armario?</h2>
              <p className="text-xl text-primary-100">
                Empezá hoy mismo y descubrí todo el potencial de tu ropa con la ayuda de ARIN
              </p>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleComenzar} size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Comenzar con ARIN
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Shirt className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ARIN</span>
            </div>
            <p className="text-gray-600">Tu asistente personal de moda - Optimizá tu armario, creá looks increíbles</p>
            <p className="text-sm text-gray-500">© 2024 ARIN. Hecho con 💜 para revolucionar tu forma de vestirte.</p>
          </div>
        </div>
      </footer>

      {/* ARIN Chat - Se abre automáticamente cuando showArinChat es true */}
      <ArinChat autoOpen={showArinChat} />
    </div>
  )
}
