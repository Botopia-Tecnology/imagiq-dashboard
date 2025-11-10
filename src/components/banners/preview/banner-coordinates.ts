// Convierte coordenadas de cuadrícula (0-8, 0-8) a formato string "x-y"
export function coordinatesToString(x: number, y: number): string {
  return `${x}-${y}`;
}

// Parsea coordenadas desde string "x-y" a números
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

// Convierte coordenadas de cuadrícula a clases de alineación CSS
export function getAlignmentClasses(coordinates?: string): string {
  const { x, y } = parseCoordinates(coordinates);

  // Mapear X (0-8) a horizontal
  let horizontalClass: string;
  if (x <= 2) {
    horizontalClass = "items-start text-left";
  } else if (x >= 6) {
    horizontalClass = "items-end text-right";
  } else {
    horizontalClass = "items-center text-center";
  }

  // Mapear Y (0-8) a vertical
  let verticalClass: string;
  if (y <= 2) {
    verticalClass = "justify-start";
  } else if (y >= 6) {
    verticalClass = "justify-end";
  } else {
    verticalClass = "justify-center";
  }

  return `${horizontalClass} ${verticalClass}`;
}

// Obtiene la posición en porcentaje para posicionamiento absoluto
export function getPositionStyles(coordinates?: string): { left: string; top: string } {
  const { x, y } = parseCoordinates(coordinates);

  // Convertir de grid 0-4 a porcentaje
  const leftPercent = (x * 25); // 0, 25, 50, 75, 100
  const topPercent = (y * 25);

  return {
    left: `${leftPercent}%`,
    top: `${topPercent}%`
  };
}
