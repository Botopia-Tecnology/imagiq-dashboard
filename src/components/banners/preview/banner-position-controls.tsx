"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from "lucide-react";
import type { BannerPosition } from "@/types/banner";
import { adjustPosition, centerPosition } from "../utils/position-utils";

interface BannerPositionControlsProps {
  position: BannerPosition;
  onPositionChange?: (position: BannerPosition) => void;
  device?: "desktop" | "mobile";
}

export function BannerPositionControls(props: Readonly<BannerPositionControlsProps>) {
  const { position, onPositionChange, device = "desktop" } = props;

  if (!onPositionChange || !position || typeof position.x !== 'number' || typeof position.y !== 'number') return null;

  const step = 5; // Mover 5% por cada click

  const moveLeft = () => {
    const newPosition = adjustPosition(position, -step, 0);
    onPositionChange(newPosition);
  };

  const moveRight = () => {
    const newPosition = adjustPosition(position, step, 0);
    onPositionChange(newPosition);
  };

  const moveUp = () => {
    const newPosition = adjustPosition(position, 0, -step);
    onPositionChange(newPosition);
  };

  const moveDown = () => {
    const newPosition = adjustPosition(position, 0, step);
    onPositionChange(newPosition);
  };

  const centerHorizontal = () => {
    const newPosition = centerPosition(position, 'x');
    onPositionChange(newPosition);
  };

  const centerBoth = () => {
    const newPosition = centerPosition(position, 'both');
    onPositionChange(newPosition);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <div className="text-xs font-medium text-muted-foreground">
        Posición {device === "mobile" ? "Móvil" : "Desktop"}
      </div>

      {/* Botón arriba */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={moveUp}
          disabled={position.y <= 0}
          className="h-8 w-8 p-0"
          title="Mover arriba (↑)"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Fila central: izquierda, centro vertical, derecha */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={moveLeft}
          disabled={position.x <= 0}
          className="h-8 w-8 p-0"
          title="Mover izquierda (←)"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={centerBoth}
          className="h-8 w-8 p-0"
          title="Centrar todo"
        >
          <AlignVerticalJustifyCenter className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={moveRight}
          disabled={position.x >= 100}
          className="h-8 w-8 p-0"
          title="Mover derecha (→)"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Fila inferior: abajo y centrar horizontal */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={moveDown}
          disabled={position.y >= 100}
          className="h-8 w-8 p-0"
          title="Mover abajo (↓)"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={centerHorizontal}
          className="h-8 w-auto px-2 text-xs"
          title="Centrar horizontalmente"
        >
          <AlignHorizontalJustifyCenter className="h-4 w-4 mr-1" />
          H
        </Button>
      </div>

      {/* Display de coordenadas */}
      <div className="text-xs text-center pt-2 border-t w-full space-y-1">
        <div className="font-mono text-primary font-medium">
          X: {position.x.toFixed(1)}% | Y: {position.y.toFixed(1)}%
        </div>
        <div className="text-muted-foreground text-[10px]">
          Arrastra el texto o usa las flechas
        </div>
      </div>
    </div>
  );
}
