import { ArinChat } from "@/components/arin-chat"

export default function Stats() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Stats Page</h1>

        <p className="mt-3 text-2xl">This is the stats page.</p>

        {/* All metrics and graphs */}
        {/* Tabs for most used, least used, unused */}
        {/* Multi-select mode */}
        {/* Create looks from stats */}
        {/* Sustainable tips */}
      </main>
      <ArinChat />
    </div>
  )
}
