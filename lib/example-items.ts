import type { ClothingItem } from "@/types/ClothingItem"

// Función para cargar prendas de ejemplo en el localStorage
export function loadExampleItems(): void {
  // Verificar si ya existen prendas
  const existingItems = localStorage.getItem("clothingItems")
  if (existingItems && JSON.parse(existingItems).length > 0) {
    // Si ya hay prendas, no cargar ejemplos
    return
  }

  // Prendas de ejemplo usando el formato correcto de ClothingItem
  const exampleItems: ClothingItem[] = [
    {
      id: "example-1",
      image: "/white-tshirt.png",
      type: "remera",
      color: "blanco",
      occasion: "dia-casual",
      climate: "calor",
      isOuterwear: false,
    },
    {
      id: "example-2",
      image: "/blue-jeans.png",
      type: "jean",
      color: "azul",
      occasion: "dia-casual",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-3",
      image: "/black-dress.png",
      type: "vestido",
      color: "negro",
      occasion: "salidas-formales",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-4",
      image: "/white-formal-shirt.png",
      type: "camisa",
      color: "blanco",
      occasion: "trabajo",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-5",
      image: "/black-pants.png",
      type: "pantalon",
      color: "negro",
      occasion: "trabajo",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-6",
      image: "/black-jacket.png",
      type: "campera",
      color: "negro",
      occasion: "salidas-informales",
      climate: "frio",
      isOuterwear: true,
    },
    {
      id: "example-7",
      image: "/white-sneakers.png",
      type: "zapatillas",
      color: "blanco",
      occasion: "dia-casual",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-8",
      image: "/blue-shirt.png",
      type: "blusa",
      color: "azul",
      occasion: "salidas-informales",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-9",
      image: "/black-skirt.png",
      type: "falda",
      color: "negro",
      occasion: "trabajo",
      climate: "templado",
      isOuterwear: false,
    },
    {
      id: "example-10",
      image: "/brown-shoes.png",
      type: "zapatos",
      color: "marrón",
      occasion: "salidas-formales",
      climate: "templado",
      isOuterwear: false,
    },
  ]

  // Guardar en localStorage
  localStorage.setItem("clothingItems", JSON.stringify(exampleItems))

  // Marcar que se han cargado los ejemplos
  localStorage.setItem("examplesLoaded", "true")
}
