"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from "lucide-react";
import { parseCoordinates as parseGridCoordinates, coordinatesToString } from "./banner-coordinates";

interface BannerPositionControlsProps {
  coordinates?: string; // format: "x-y" where x,y in 0..8
  onCoordinatesChange?: (coordinates: string) => void;
}

export function BannerPositionControls(props: Readonly<BannerPositionControlsProps>) {
  const { coordinates, onCoordinatesChange } = props;
  if (!onCoordinatesChange) return null;

  const { x, y } = parseGridCoordinates(coordinates);

  const moveLeft = () => {
    const newX = Math.max(0, x - 1);
    onCoordinatesChange(coordinatesToString(newX, y));
  };

  const moveRight = () => {
    const newX = Math.min(8, x + 1);
    onCoordinatesChange(coordinatesToString(newX, y));
  };

  const moveUp = () => {
    const newY = Math.max(0, y - 1);
    onCoordinatesChange(coordinatesToString(x, newY));
  };

  const moveDown = () => {
    const newY = Math.min(8, y + 1);
    onCoordinatesChange(coordinatesToString(x, newY));
  };

  const centerHorizontal = () => onCoordinatesChange(coordinatesToString(4, y));
  const centerVertical = () => onCoordinatesChange(coordinatesToString(x, 4));

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <div className="text-xs font-medium text-muted-foreground">Posición del Contenido</div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={moveUp} disabled={y === 0} className="h-8 w-8 p-0" title="Mover arriba">
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={moveLeft} disabled={x === 0} className="h-8 w-8 p-0" title="Mover izquierda">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={centerVertical} className="h-8 w-8 p-0" title="Centrar verticalmente">
          <AlignVerticalJustifyCenter className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={moveRight} disabled={x === 8} className="h-8 w-8 p-0" title="Mover derecha">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button variant="outline" size="sm" onClick={moveDown} disabled={y === 8} className="h-8 w-8 p-0" title="Mover abajo">
          <ArrowDown className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={centerHorizontal} className="h-8 w-auto px-2" title="Centrar horizontalmente">
          <AlignHorizontalJustifyCenter className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-center pt-2 border-t w-full">
        <span className="font-mono text-primary font-medium">{coordinatesToString(x, y)}</span>
      </div>
    </div>
  );
}
