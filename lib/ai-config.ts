// Configuración para la IA de moda

// Tipos de estilos disponibles
export const FASHION_STYLES = [
  "casual",
  "formal",
  "minimalista",
  "bohemio",
  "deportivo",
  "elegante",
  "vintage",
  "urbano",
  "clásico",
  "romántico",
]

// Reglas de combinación de colores
export const COLOR_COMBINATION_RULES = {
  // Colores que combinan bien juntos
  combinations: {
    negro: ["blanco", "gris", "rojo", "azul", "verde", "beige", "rosa", "amarillo"],
    blanco: ["negro", "azul", "rojo", "verde", "gris", "beige", "rosa", "amarillo"],
    azul: ["blanco", "gris", "negro", "beige", "rosa", "rojo"],
    rojo: ["negro", "blanco", "gris", "azul", "beige"],
    verde: ["blanco", "beige", "gris", "negro", "azul"],
    gris: ["negro", "blanco", "azul", "rojo", "rosa", "verde"],
    beige: ["negro", "blanco", "azul", "verde", "marrón", "rojo"],
    rosa: ["blanco", "gris", "azul", "negro"],
    amarillo: ["blanco", "negro", "azul", "verde"],
    marrón: ["beige", "blanco", "azul", "verde"],
  },

  // Colores que no combinan bien
  clashes: {
    rojo: ["naranja", "rosa", "morado"],
    verde: ["naranja", "morado"],
    azul: ["marrón", "verde oscuro"],
    naranja: ["rosa", "rojo", "morado"],
    morado: ["naranja", "verde", "rojo"],
  },
}

// Reglas de clima para prendas
export const CLIMATE_RULES = {
  caluroso: {
    recommended: ["remera", "camisa", "blusa", "short", "falda", "vestido", "zapatillas", "sandalias"],
    avoid: ["abrigo", "campera", "tapado", "sweater", "bufanda", "gorro", "guantes"],
  },
  templado: {
    recommended: ["remera", "camisa", "blusa", "pantalon", "jean", "falda", "vestido", "cardigan", "chaleco"],
    avoid: ["abrigo pesado", "tapado grueso"],
  },
  frio: {
    recommended: ["sweater", "campera", "tapado", "abrigo", "bufanda", "gorro", "guantes", "botas"],
    avoid: ["short", "remera fina", "sandalias"],
  },
}

// Reglas de ocasión para prendas
export const OCCASION_RULES = {
  casual: {
    recommended: ["remera", "jean", "zapatillas", "sweater", "campera", "short"],
    avoid: ["traje", "vestido formal"],
  },
  formal: {
    recommended: ["camisa", "blusa", "pantalon", "falda", "vestido", "blazer", "zapatos"],
    avoid: ["remera", "jean roto", "zapatillas deportivas"],
  },
  deporte: {
    recommended: ["remera deportiva", "pantalon deportivo", "zapatillas deportivas"],
    avoid: ["jean", "camisa", "zapatos formales"],
  },
  fiesta: {
    recommended: ["vestido", "camisa", "blazer", "zapatos elegantes"],
    avoid: ["remera casual", "zapatillas", "ropa deportiva"],
  },
  homewear: {
    recommended: ["remera", "pantalon cómodo", "sweater", "zapatillas"],
    avoid: ["ropa formal", "zapatos incómodos"],
  },
}

// Consejos de estilo por tipo de cuerpo
export const BODY_TYPE_TIPS = {
  triangulo: {
    tips: [
      "Destaca la parte superior con colores vivos o estampados",
      "Usa pantalones oscuros para equilibrar la silueta",
      "Los pantalones rectos o ligeramente acampanados favorecen",
    ],
  },
  triangulo_invertido: {
    tips: [
      "Destaca la parte inferior con colores o detalles",
      "Evita hombreras o prendas que ensanchen los hombros",
      "Las faldas con volumen equilibran la silueta",
    ],
  },
  reloj_de_arena: {
    tips: [
      "Destaca la cintura con cinturones o prendas entalladas",
      "Los vestidos wrap son muy favorecedores",
      "Evita prendas muy holgadas que oculten tu figura",
    ],
  },
  rectangulo: {
    tips: [
      "Crea curvas con capas y texturas",
      "Los cinturones ayudan a definir la cintura",
      "Juega con diferentes largos para añadir dimensión",
    ],
  },
  oval: {
    tips: [
      "Las prendas con líneas verticales estilizan",
      "Evita estampados muy grandes o llamativos en el centro",
      "Los escotes en V favorecen y alargan el torso",
    ],
  },
}
