"use client";

import { parseCoordinates } from "./banner-coordinates";

interface BannerContentOverlayProps {
  title?: string;
  description?: string;
  cta?: string;
  colorFont: string;
  coordinates?: string;
  linkUrl?: string;
  device?: "desktop" | "mobile";
}

export function BannerContentOverlay({
  title,
  description,
  cta,
  colorFont,
  coordinates,
  linkUrl,
  device = "desktop",
}: Readonly<BannerContentOverlayProps>) {
  if (!title && !description && !cta) return null;

  const { x, y } = parseCoordinates(coordinates);
  
  // Convertir coordenadas de cuadrícula (0-8) a porcentajes
  // Cada celda tiene 11.111% de ancho/alto (100/9), y queremos el centro de cada celda
  // Celda 0: centro en 5.555% (0*11.111 + 5.555)
  // Celda 1: centro en 16.666% (1*11.111 + 5.555)
  // Celda 2: centro en 27.777% (2*11.111 + 5.555)
  // ...
  // Celda 4: centro en 50% (4*11.111 + 5.555)
  // ...
  // Celda 8: centro en 94.444% (8*11.111 + 5.555)
  const cellSize = 100 / 9;
  const leftPercent = x * cellSize + cellSize / 2;
  const topPercent = y * cellSize + cellSize / 2;

  // Determinar alineación del texto basado en la posición horizontal
  let textAlign: "left" | "center" | "right" = "center";
  
  if (x <= 2) {
    textAlign = "left";
  } else if (x >= 6) {
    textAlign = "right";
  }

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="space-y-1 px-4"
        style={{
          maxWidth: device === "mobile" ? "220px" : "360px",
          textAlign,
        }}
      >
        {title && (
          <h2
            className="font-bold leading-none"
            style={{
              color: colorFont,
              fontSize: device === "mobile" ? "clamp(0.75rem,2.2vw,0.95rem)" : "clamp(0.9rem,1.6vw,1.25rem)",
            }}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className="font-normal opacity-90 leading-tight"
            style={{
              color: colorFont,
              fontSize: device === "mobile" ? "clamp(0.35rem,1vw,0.55rem)" : "clamp(0.55rem,0.85vw,0.7rem)",
              whiteSpace: "pre-line",
            }}
          >
            {description}
          </p>
        )}

        {cta && (
          <div className="pt-2">
            <button
              className="rounded-full font-medium transition-all hover:scale-105"
              style={{
                padding: device === "mobile" ? "6px 10px" : "8px 14px",
                fontSize: device === "mobile" ? "0.7rem" : "0.85rem",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                border: `1.2px solid ${colorFont}`,
                color: colorFont,
                pointerEvents: "auto",
              }}
            >
              {cta}
            </button>
          </div>
        )}
        {linkUrl && (
          <div className="pt-2">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ fontSize: device === "mobile" ? "0.7rem" : "0.8rem", color: "#7fb4ff" }}
            >
              Ver enlace
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
