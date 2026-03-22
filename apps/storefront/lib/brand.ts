export const AMSTERDAM_HERO_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

export const AMSTERDAM_STORY_IMAGE =
  "https://images.unsplash.com/photo-1550985543-f47f38aee65f?auto=format&fit=crop&w=1600&q=80";

export const CATEGORY_COPY: Record<string, string> = {
  autoflorecientes: "Genéticas rápidas y resistentes, pensadas para ciclos cortos y colecciones activas.",
  banco: "Selecciones exclusivas de breeders europeos con trazabilidad y stock curado.",
  cbd: "Variedades enfocadas en perfiles de preservación con genética medicinal y estable.",
  cbg: "Exploraciones raras para coleccionistas que buscan nuevas familias botánicas.",
  croppers: "Líneas de gran vigor y alta producción para colecciones de alto rendimiento.",
  feminizadas: "Estabilidad, pureza genética y perfiles clásicos de los bancos más buscados.",
};

/**
 * Masks third-party brand names for white-label display.
 * "Merlin Seeds" (and variations) → "GG Seeds"
 * The original brand value is kept in DB for catalog logic.
 */
export function maskBrand(brand: string | null | undefined): string | null {
  if (!brand) return null;
  return brand.replace(/merl[ií]n\s*seeds/gi, "GG Seeds");
}

export const LEGAL_BULLETS = [
  "Venta exclusiva para mayores de 18 años.",
  "Semillas destinadas a coleccionismo y preservación genética.",
  "Pago y envío coordinados directamente por WhatsApp.",
];
