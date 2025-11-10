/**
 * Convierte coordenadas de cuadrícula (0-8, 0-8) a formato string "x-y"
 */
export function coordinatesToString(x: number, y: number): string {
  return `${x}-${y}`;
}

/**
 * Parsea coordenadas desde string "x-y" a números
 * @param coordinates - String en formato "x-y" (ej: "4-4")
 * @returns Objeto con coordenadas x e y (0-8), centro por defecto
 */
export function parseCoordinates(coordinates?: string): { x: number; y: number } {
  if (!coordinates) return { x: 4, y: 4 }; // Centro por defecto (cuadrícula 9x9)

  const parts = coordinates.split("-");
  const x = Number.parseInt(parts[0] ?? "", 10);
  const y = Number.parseInt(parts[1] ?? "", 10);

  // Si el parsing falla (NaN), usar centro por defecto
  const finalX = Number.isNaN(x) ? 4 : x;
  const finalY = Number.isNaN(y) ? 4 : y;

  // Asegurar que estén en rango 0-8
  return {
    x: Math.max(0, Math.min(8, finalX)),
    y: Math.max(0, Math.min(8, finalY))
  };
}
