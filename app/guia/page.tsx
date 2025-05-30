import { ArinChat } from "@/components/arin-chat"

export default function Guia() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Guía de Uso</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Información General</h2>
          <p>
            Esta guía te proporcionará toda la información necesaria para utilizar nuestra plataforma de manera
            efectiva. Sigue los pasos detallados a continuación para aprovechar al máximo todas las funcionalidades.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Pasos Detallados</h2>
          <ol className="list-decimal pl-5">
            <li>
              <strong>Paso 1:</strong> Regístrate en nuestra plataforma creando una cuenta.
            </li>
            <li>
              <strong>Paso 2:</strong> Inicia sesión con tus credenciales.
            </li>
            <li>
              <strong>Paso 3:</strong> Explora las diferentes secciones y funcionalidades disponibles.
            </li>
            <li>
              <strong>Paso 4:</strong> Utiliza la barra de búsqueda para encontrar información específica.
            </li>
            <li>
              <strong>Paso 5:</strong> Personaliza tu perfil y preferencias.
            </li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Información de Contacto</h2>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
          <p>Puedes contactarnos a través de los siguientes medios:</p>
          <div className="flex space-x-4">
            <a
              href="https://wa.me/TUNUMERODEWHATSAPP"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              WhatsApp
            </a>
            <a
              href="mailto:tuemail@example.com"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Email
            </a>
          </div>
        </section>
      </div>
      <ArinChat />
    </div>
  )
}
