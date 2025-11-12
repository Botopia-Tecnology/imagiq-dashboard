"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_COLUMNS, ProductColumn } from "@/types/filters";

interface ColumnSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ColumnSelector({
  value,
  onValueChange,
  disabled = false,
}: ColumnSelectorProps) {
  const selectedColumn = PRODUCT_COLUMNS.find((col) => col.key === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="column-selector">Columna de Producto</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="column-selector">
          <SelectValue placeholder="Selecciona una columna" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_COLUMNS.map((column) => (
            <SelectItem key={column.key} value={column.key}>
              <div className="flex flex-col">
                <span>{column.label}</span>
                <span className="text-xs text-muted-foreground">
                  {column.key} ({column.type})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedColumn && (
        <p className="text-xs text-muted-foreground">
          Tipo: {selectedColumn.type} |{" "}
          {selectedColumn.supportsRange ? "Soporta rangos" : "No soporta rangos"} |{" "}
          {selectedColumn.supportsDynamic
            ? "Valores dinámicos disponibles"
            : "Solo valores manuales"}
        </p>
      )}
    </div>
  );
}

