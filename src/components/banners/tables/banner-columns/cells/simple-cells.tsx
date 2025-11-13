/**
 * Celdas simples para la tabla de banners
 * Agrupadas aquí por su simplicidad y bajo acoplamiento
 */

import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface SimpleCellProps {
  readonly value?: string | null;
}

/**
 * Celda para la descripción del banner (truncada si es muy larga)
 */
export function BannerDescriptionCell({ value }: Readonly<SimpleCellProps>) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">Sin descripción</span>;
  }

  return (
    <div className="max-w-[200px]">
      <p className="text-sm text-muted-foreground truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

/**
 * Celda para el CTA del banner
 */
export function BannerCtaCell({ value }: Readonly<SimpleCellProps>) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">Sin CTA</span>;
  }

  return (
    <div className="max-w-[150px]">
      <Badge variant="secondary" className="font-normal truncate block">
        {value}
      </Badge>
    </div>
  );
}

/**
 * Celda para el color de fuente
 */
export function BannerColorCell({ value }: Readonly<SimpleCellProps>) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">Sin color</span>;
  }

  return (
    <div className="flex items-center gap-2 max-w-[120px]">
      <div className="w-6 h-6 rounded border flex-shrink-0" style={{ backgroundColor: value }} title={value} />
      <span className="text-xs font-mono truncate">{value}</span>
    </div>
  );
}

/**
 * Celda para las coordenadas de posición
 */
export function BannerCoordinatesCell({ value }: Readonly<SimpleCellProps>) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">No definida</span>;
  }

  return (
    <Badge variant="outline" className="font-mono text-xs">
      {value}
    </Badge>
  );
}

/**
 * Celda para el link URL del banner
 */
export function BannerLinkCell({ value }: Readonly<SimpleCellProps>) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">Sin enlace</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
    >
      Ver
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/**
 * Celda para la ubicación del banner
 */
export function BannerPlacementCell({ value, labels }: SimpleCellProps & { readonly labels?: Record<string, string> }) {
  if (!value) return null;

  // Para banners de categoría (banner-xxx-yyy), mostrar solo lo que está después del último guión
  let displayValue = labels?.[value] || value;

  if (value.startsWith("banner-")) {
    const parts = value.split("-");
    // Tomar la última parte o la penúltima si solo tiene 2 partes
    displayValue = parts.length > 2 ? parts.at(-1) || parts[1] : parts[1];
    // Capitalizar la primera letra
    displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
  }

  // Valor completo para el tooltip
  const fullValue = labels?.[value] || value;

  return (
    <div className="max-w-[200px]">
      <Badge variant="outline" className="truncate block" title={fullValue}>
        {displayValue}
      </Badge>
    </div>
  );
}
