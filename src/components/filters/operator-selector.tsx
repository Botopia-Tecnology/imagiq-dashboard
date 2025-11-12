"use client";

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
import { FILTER_OPERATORS, FilterOperator, ProductColumn } from "@/types/filters";
import { Info } from "lucide-react";

interface OperatorSelectorProps {
  value: FilterOperator;
  onValueChange: (value: FilterOperator) => void;
  selectedColumn?: ProductColumn;
  disabled?: boolean;
}

export function OperatorSelector({
  value,
  onValueChange,
  selectedColumn,
  disabled = false,
}: OperatorSelectorProps) {
  // Filter operators based on selected column type
  const availableOperators = selectedColumn
    ? FILTER_OPERATORS.filter((op) =>
        op.supportedTypes.includes(selectedColumn.type)
      )
    : FILTER_OPERATORS;

  const selectedOperator = FILTER_OPERATORS.find((op) => op.value === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="operator-selector">Operador</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                El operador define cómo se compara el valor del filtro con los
                datos del producto
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="operator-selector">
          <SelectValue placeholder="Selecciona un operador" />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((operator) => (
            <SelectItem key={operator.value} value={operator.value}>
              <div className="flex flex-col">
                <span>{operator.label}</span>
                <span className="text-xs text-muted-foreground">
                  {operator.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedOperator && (
        <p className="text-xs text-muted-foreground">
          {selectedOperator.description}
        </p>
      )}
    </div>
  );
}

