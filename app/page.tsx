import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Shirt, Wand2, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ArinChat } from "@/components/arin-chat"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-700/20 -z-10" />
        <div className="absolute inset-0 bg-[url('/pattern-bg.png')] bg-repeat opacity-5 -z-10" />

        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Tu armario
                <br />
                <span className="gradient-text">reinventado</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Tu asistente de armario - Organizá tus prendas y creá nuevos looks con lo que ya tenés. Reutilizá,
                reinventá, reestrená.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link href="/onboarding">
                  <Button size="lg" className="gap-2 btn-hover bg-primary-600 hover:bg-primary-700">
                    Comenzar ahora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative animate-fade-in-right">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/colorful-wardrobe.png"
                  alt="Vestocambro"
                  fill
                  className="object-cover rounded-2xl shadow-soft-lg"
                  priority
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10 dark:ring-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto">
          <h2 className="section-title text-center">¿Qué podés hacer con ARIN?</h2>
          <p className="section-subtitle text-center">
            Una forma inteligente de organizar tu ropa y crear combinaciones perfectas
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 shadow-soft card-hover">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Shirt className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Organizá tu armario</h3>
              <p className="text-muted-foreground">
                Catalogá todas tus prendas por tipo, color, ocasión y clima para tener un inventario completo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 shadow-soft card-hover">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Generá looks automáticos</h3>
              <p className="text-muted-foreground">
                Dejá que ARIN te sugiera combinaciones perfectas basadas en tus prendas favoritas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 shadow-soft card-hover">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Guardá tus looks favoritos</h3>
              <p className="text-muted-foreground">
                Creá una colección de tus combinaciones preferidas para acceder a ellas rápidamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <h2 className="section-title text-center">Beneficios de usar ARIN</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              {/* Benefit 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Ahorrá tiempo cada mañana</h3>
                  <p className="text-muted-foreground">
                    Olvidate de pasar horas decidiendo qué ponerte. Encontrá el look perfecto en segundos.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Aprovechá mejor tu guardarropa</h3>
                  <p className="text-muted-foreground">
                    Descubrí prendas olvidadas y nuevas formas de combinarlas para sacarles el máximo partido.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Comprá con más conciencia</h3>
                  <p className="text-muted-foreground">
                    Identificá qué tipo de prendas realmente necesitás y evitá compras innecesarias.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Benefit 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Llevá un registro de uso</h3>
                  <p className="text-muted-foreground">
                    Visualizá estadísticas sobre qué prendas usás más y cuáles podrías donar o vender.
                  </p>
                </div>
              </div>

              {/* Benefit 5 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Planificá tus looks con anticipación</h3>
                  <p className="text-muted-foreground">
                    Prepará combinaciones para toda la semana o para ocasiones especiales con antelación.
                  </p>
                </div>
              </div>

              {/* Benefit 6 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Accedé desde cualquier dispositivo</h3>
                  <p className="text-muted-foreground">
                    Tu guardarropa virtual siempre con vos, en tu teléfono, tablet o computadora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Lista para transformar tu armario?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Comenzá a organizar tus prendas y descubrí nuevas combinaciones hoy mismo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" variant="secondary" className="gap-2 btn-hover">
                Comenzar ahora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/guia">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 btn-hover bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Ver guía de uso
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50">
        <div className="container px-4 mx-auto text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} ARIN. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ARIN Chat */}
      <ArinChat autoOpen={false} />
    </div>
  )
}
