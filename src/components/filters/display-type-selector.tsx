"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FilterDisplayType, FilterOperator } from "@/types/filters";
import { CheckSquare, Circle, SlidersHorizontal, List } from "lucide-react";

interface DisplayTypeSelectorProps {
  value: FilterDisplayType;
  onValueChange: (value: FilterDisplayType) => void;
  operator: FilterOperator;
  disabled?: boolean;
}

const DISPLAY_TYPE_OPTIONS: Array<{
  value: FilterDisplayType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  compatibleOperators: FilterOperator[];
}> = [
  {
    value: "checkbox",
    label: "Checkboxes",
    description: "Selección múltiple con casillas",
    icon: CheckSquare,
    compatibleOperators: ["includes", "equal"],
  },
  {
    value: "radio",
    label: "Radio Buttons",
    description: "Selección única con botones de radio",
    icon: Circle,
    compatibleOperators: ["equal", "includes"],
  },
  {
    value: "slider",
    label: "Slider de Rango",
    description: "Control deslizante para rangos numéricos",
    icon: SlidersHorizontal,
    compatibleOperators: ["range", "greater_than", "less_than"],
  },
  {
    value: "multi_select",
    label: "Multi-Select",
    description: "Dropdown con selección múltiple",
    icon: List,
    compatibleOperators: ["includes"],
  },
  {
    value: "single_select",
    label: "Single Select",
    description: "Dropdown con selección única",
    icon: List,
    compatibleOperators: ["equal", "includes"],
  },
];

export function DisplayTypeSelector({
  value,
  onValueChange,
  operator,
  disabled = false,
}: DisplayTypeSelectorProps) {
  // Filter display types based on operator
  const availableTypes = DISPLAY_TYPE_OPTIONS.filter((type) =>
    type.compatibleOperators.includes(operator)
  );

  const selectedType = DISPLAY_TYPE_OPTIONS.find((type) => type.value === value);
  const Icon = selectedType?.icon || CheckSquare;

  return (
    <div className="space-y-2">
      <Label htmlFor="display-type-selector">Tipo de Visualización</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="display-type-selector">
          <SelectValue placeholder="Selecciona un tipo" />
        </SelectTrigger>
        <SelectContent>
          {availableTypes.map((type) => {
            const TypeIcon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selectedType && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Preview: {selectedType.label}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedType.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

