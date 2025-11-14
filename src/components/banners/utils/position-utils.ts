import type { BannerPosition } from "@/types/banner";
import { parseCoordinates } from "../preview/banner-coordinates";

/**
 * Convierte coordenadas del grid 9x9 a porcentajes de imagen
 * @param coordinates - String en formato "x-y" (ej: "4-4")
 * @returns BannerPosition con porcentajes o undefined si no hay coordenadas
 */
export function gridToPercentage(coordinates?: string): BannerPosition | undefined {
  if (!coordinates) return undefined;

  const { x, y } = parseCoordinates(coordinates);

  // Grid 9x9: cada celda es 1/9 del ancho/alto
  // Celda 0 = 5.555%, Celda 4 = 50%, Celda 8 = 94.444%
  const cellSize = 100 / 9;
  const percentX = x * cellSize + cellSize / 2; // Centro de la celda
  const percentY = y * cellSize + cellSize / 2;

  return {
    x: percentX,
    y: percentY
  };
}

/**
 * Convierte una posición de drag & drop a porcentajes de imagen
 * @param clientX - Posición X del cursor en el viewport
 * @param clientY - Posición Y del cursor en el viewport
 * @param containerRect - DOMRect del contenedor de la imagen
 * @param imageNaturalWidth - Ancho natural de la imagen (opcional)
 * @param imageNaturalHeight - Alto natural de la imagen (opcional)
 * @returns BannerPosition con porcentajes clampeados entre 0-100
 */
export function dragToPercentage(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  imageNaturalWidth?: number,
  imageNaturalHeight?: number
): BannerPosition {
  // Posición relativa al contenedor
  const relativeX = clientX - containerRect.left;
  const relativeY = clientY - containerRect.top;

  // Convertir a porcentajes
  const percentX = (relativeX / containerRect.width) * 100;
  const percentY = (relativeY / containerRect.height) * 100;

  return clampPosition({
    x: percentX,
    y: percentY,
    imageWidth: imageNaturalWidth,
    imageHeight: imageNaturalHeight
  });
}

/**
 * Limita la posición entre 0-100% para que no se salga de la imagen
 * @param position - Posición a limitar
 * @returns Posición con x e y entre 0-100
 */
export function clampPosition(position: BannerPosition): BannerPosition {
  return {
    ...position,
    x: Math.max(0, Math.min(100, position.x)),
    y: Math.max(0, Math.min(100, position.y))
  };
}

/**
 * Convierte porcentajes de imagen a coordenadas grid 9x9 (para compatibilidad hacia atrás)
 * @param position - BannerPosition con porcentajes
 * @returns String en formato "x-y" (ej: "4-4")
 */
export function percentageToGrid(position: BannerPosition): string {
  const cellSize = 100 / 9;

  // Convertir de porcentaje a índice de celda (0-8)
  const x = Math.round((position.x - cellSize / 2) / cellSize);
  const y = Math.round((position.y - cellSize / 2) / cellSize);

  // Clampear entre 0-8
  const clampedX = Math.max(0, Math.min(8, x));
  const clampedY = Math.max(0, Math.min(8, y));

  return `${clampedX}-${clampedY}`;
}

/**
 * Ajusta una posición por un delta (usado para los controles de flechas)
 * @param position - Posición actual
 * @param deltaX - Cambio en X (en porcentaje)
 * @param deltaY - Cambio en Y (en porcentaje)
 * @returns Nueva posición clampeada
 */
export function adjustPosition(
  position: BannerPosition,
  deltaX: number,
  deltaY: number
): BannerPosition {
  return clampPosition({
    ...position,
    x: position.x + deltaX,
    y: position.y + deltaY
  });
}

/**
 * Centra una posición en un eje específico
 * @param position - Posición actual
 * @param axis - Eje a centrar ('x', 'y', o 'both')
 * @returns Posición centrada
 */
export function centerPosition(
  position: BannerPosition,
  axis: 'x' | 'y' | 'both' = 'both'
): BannerPosition {
  const newPosition = { ...position };

  if (axis === 'x' || axis === 'both') {
    newPosition.x = 50;
  }

  if (axis === 'y' || axis === 'both') {
    newPosition.y = 50;
  }

  return newPosition;
}

/**
 * Obtiene la posición por defecto (centro)
 * @param imageWidth - Ancho de la imagen (opcional)
 * @param imageHeight - Alto de la imagen (opcional)
 * @returns BannerPosition centrado
 */
export function getDefaultPosition(
  imageWidth?: number,
  imageHeight?: number
): BannerPosition {
  return {
    x: 50,
    y: 50,
    imageWidth,
    imageHeight
  };
}

/**
 * Determina la alineación del texto basada en la posición X
 * @param position - Posición del banner
 * @returns Alineación del texto ('left', 'center', 'right')
 */
export function getTextAlignment(
  position: BannerPosition
): 'left' | 'center' | 'right' {
  if (position.x <= 33) {
    return 'left';
  } else if (position.x >= 66) {
    return 'right';
  }
  return 'center';
}
