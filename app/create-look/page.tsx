"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function CreateLookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasPreselected = searchParams.get("preselected") === "true"

  useEffect(() => {
    // Si hay prendas preseleccionadas, redirigir a la página de sugerencias con la primera como base
    if (hasPreselected) {
      const preselectedIds = localStorage.getItem("preselectedItems")
      if (preselectedIds) {
        const ids = JSON.parse(preselectedIds) as string[]
        if (ids.length > 0) {
          router.push(`/suggest?baseItem=${ids[0]}`)
        } else {
          router.push("/suggest")
        }
      } else {
        router.push("/suggest")
      }
    } else {
      // Si no hay prendas preseleccionadas, simplemente redirigir a la página de sugerencias
      router.push("/suggest")
    }
  }, [hasPreselected, router])

  return null
}
