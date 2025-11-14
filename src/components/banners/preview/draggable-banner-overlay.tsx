"use client";

import { useDraggable } from '@dnd-kit/core';
import type { BannerPosition, BannerTextStyles } from "@/types/banner";
import { getTextAlignment } from '../utils/position-utils';

interface DraggableBannerOverlayProps {
  id: string;
  title?: string;
  description?: string;
  cta?: string;
  colorFont: string;
  linkUrl?: string;
  position: BannerPosition;
  textStyles?: BannerTextStyles;
  device?: "desktop" | "mobile";
  disabled?: boolean;
}

// Estilos por defecto para desktop
const DEFAULT_TEXT_STYLES_DESKTOP: BannerTextStyles = {
  title: {
    fontSize: "clamp(0.9rem, 1.6vw, 1.25rem)",
    fontWeight: "700",
    lineHeight: "1.2"
  },
  description: {
    fontSize: "clamp(0.55rem, 0.85vw, 0.7rem)",
    fontWeight: "400",
    lineHeight: "1.5"
  },
  cta: {
    fontSize: "0.85rem",
    fontWeight: "500",
    padding: "8px 14px",
    borderWidth: "1.2px"
  }
};

// Estilos por defecto para mobile
const DEFAULT_TEXT_STYLES_MOBILE: BannerTextStyles = {
  title: {
    fontSize: "clamp(0.75rem, 2.2vw, 0.95rem)",
    fontWeight: "700",
    lineHeight: "1.2"
  },
  description: {
    fontSize: "clamp(0.35rem, 1vw, 0.55rem)",
    fontWeight: "400",
    lineHeight: "1.5"
  },
  cta: {
    fontSize: "0.7rem",
    fontWeight: "500",
    padding: "6px 10px",
    borderWidth: "1.2px"
  }
};

export function DraggableBannerOverlay({
  id,
  title,
  description,
  cta,
  colorFont,
  linkUrl,
  position,
  textStyles,
  device = "desktop",
  disabled = false
}: Readonly<DraggableBannerOverlayProps>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled
  });

  // Si no hay contenido, no renderizar nada
  if (!title && !description && !cta) return null;

  // Usar estilos personalizados o defaults según el dispositivo
  const styles = textStyles || (device === "mobile" ? DEFAULT_TEXT_STYLES_MOBILE : DEFAULT_TEXT_STYLES_DESKTOP);

  // Determinar alineación del texto según posición X
  const textAlign = getTextAlignment(position);

  // Determinar cursor según estado
  const getCursor = () => {
    if (isDragging) return "grabbing";
    if (disabled) return "default";
    return "grab";
  };

  // Estilos del contenedor draggable
  const containerStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: transform
      ? `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px)`
      : "translate(-50%, -50%)",
    cursor: getCursor(),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      className="absolute pointer-events-auto"
      style={containerStyle}
      {...listeners}
      {...attributes}
    >
      <div
        className="space-y-1 px-4"
        style={{
          maxWidth: device === "mobile" ? "220px" : "360px",
          textAlign,
        }}
      >
        {/* Título */}
        {title && (
          <h2
            className="leading-none select-none"
            style={{
              color: colorFont,
              fontSize: styles.title.fontSize,
              fontWeight: styles.title.fontWeight,
              lineHeight: styles.title.lineHeight,
            }}
          >
            {title}
          </h2>
        )}

        {/* Descripción */}
        {description && (
          <p
            className="opacity-90 select-none"
            style={{
              color: colorFont,
              fontSize: styles.description.fontSize,
              fontWeight: styles.description.fontWeight,
              lineHeight: styles.description.lineHeight,
              whiteSpace: "pre-line",
            }}
          >
            {description}
          </p>
        )}

        {/* CTA Button */}
        {cta && (
          <div className="pt-2">
            <button
              className="rounded-full transition-all hover:scale-105 select-none"
              type="button"
              style={{
                padding: styles.cta.padding,
                fontSize: styles.cta.fontSize,
                fontWeight: styles.cta.fontWeight,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                border: `${styles.cta.borderWidth} solid ${colorFont}`,
                color: colorFont,
                pointerEvents: "none", // Evitar que el botón capture clicks durante drag
              }}
            >
              {cta}
            </button>
          </div>
        )}

        {/* Link URL */}
        {linkUrl && (
          <div className="pt-2">
            <span
              className="select-none text-sm"
              style={{
                fontSize: device === "mobile" ? "0.7rem" : "0.8rem",
                color: "#7fb4ff"
              }}
            >
              Ver enlace
            </span>
          </div>
        )}
      </div>

      {/* Indicador visual de drag (opcional) */}
      {!disabled && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            pointerEvents: "none",
            display: isDragging ? "none" : "block"
          }}
        >
          <span className="text-xs text-white/60 bg-black/30 px-2 py-1 rounded whitespace-nowrap">
            Arrastra para mover
          </span>
        </div>
      )}
    </div>
  );
}
