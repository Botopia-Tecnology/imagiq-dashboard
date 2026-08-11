/**
 * Convierte coordenadas de cuadrícula (0-8, 0-8) a formato string "x-y"
 */
export function coordinatesToString(x: number, y: number): string {
  return `${x}-${y}`;
}

/**
 * fluidFontSize / fluidPadding — DUPLICADOS desde
 * `imagiq-frontend/src/utils/bannerCoordinates.ts` para que el preview del
 * dashboard renderice IDÉNTICO a producción. Si cambias estos helpers,
 * sincroniza también el frontend.
 *
 * Convierte un valor de fontSize/padding (px, rem, em) a una expresión `clamp()`
 * que escala con el ancho del CONTENEDOR (`cqi`) — el banner se marca con
 * `@container/banner` y todo dentro escala con su ancho.
 */
export function fluidFontSize(
  value: string | number | undefined | null,
  designPx = 420,
  // Synced with imagiq-frontend (PR #974). Lower floor so small CMS
  // values (e.g. 14px CTA fontSize) actually shrink visibly between
  // 420 → 360 viewport widths.
  minRatio = 0.4,
  minPx = 8,
  unit: 'cqi' | 'vw' = 'cqi',
): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const raw = typeof value === 'number' ? `${value}px` : String(value).trim();

  const match = /^([\d.]+)\s*(px|rem|em)?$/.exec(raw);
  if (!match) return raw;

  const num = parseFloat(match[1]);
  const sizeUnit = match[2] || 'px';
  if (!Number.isFinite(num) || num <= 0) return raw;

  const px = sizeUnit === 'px' ? num : num * 16;
  const ratio = (px / designPx) * 100;
  const min = Math.max(px * minRatio, minPx);

  if (min >= px) return `${px.toFixed(2)}px`;

  return `clamp(${min.toFixed(2)}px, ${ratio.toFixed(2)}${unit}, ${px.toFixed(2)}px)`;
}

export function fluidPadding(
  value: string | undefined | null,
  designPx = 420,
  minRatio = 0.4,
  unit: 'cqi' | 'vw' = 'cqi',
): string | undefined {
  if (!value) return undefined;
  return value
    .trim()
    .split(/\s+/)
    .map((part) => fluidFontSize(part, designPx, minRatio, 4, unit) ?? part)
    .join(' ');
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
