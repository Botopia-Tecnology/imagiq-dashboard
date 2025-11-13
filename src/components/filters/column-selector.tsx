"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useProductColumns } from "@/hooks/use-product-columns";

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
  const { columns, isLoading } = useProductColumns();
  
  // Filter out columns that don't support dynamic values AND don't support ranges
  const availableColumns = useMemo(() => {
    return columns.filter(
      (column) => column.supportsDynamic || column.supportsRange
    );
  }, [columns]);
  
  const selectedColumn = availableColumns.find((col) => col.key === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="column-selector">Columna de Producto</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                La columna de producto que se usará para tomar en cuenta el filtrado. 
                Define qué propiedad del producto se evaluará al aplicar este filtro.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
        <SelectTrigger id="column-selector">
          <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona una columna"} />
        </SelectTrigger>
        <SelectContent>
          {availableColumns.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No hay columnas disponibles
            </div>
          ) : (
            availableColumns.map((column) => (
              <SelectItem key={column.key} value={column.key}>
                <div className="flex flex-col">
                  <span>{column.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {column.key} ({column.type})
                  </span>
                </div>
              </SelectItem>
            ))
          )}
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

