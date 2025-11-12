"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import {
  FilterValueConfig,
  FilterOperator,
  ProductColumn,
  ManualValueConfig,
  DynamicValueConfig,
} from "@/types/filters";

interface ValueConfiguratorProps {
  value: FilterValueConfig;
  onValueChange: (config: FilterValueConfig) => void;
  operator: FilterOperator;
  column: ProductColumn | undefined;
  disabled?: boolean;
}

// Mock function to simulate fetching unique values from DB
// In the future, this will call an API endpoint
const fetchUniqueValues = async (
  columnKey: string
): Promise<string[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data based on column
  const mockData: Record<string, string[]> = {
    color: ["Negro", "Blanco", "Azul", "Rosa", "Verde", "Morado", "Dorado", "Plateado"],
    capacidad: ["64GB", "128GB", "256GB", "512GB", "1T"],
    memoriaram: ["4GB", "6GB", "8GB", "12GB", "16GB"],
    categoria: ["IM", "AV", "DA"],
    menu: ["Dispositivos Móviles", "Galaxy Buds", "Aspiradoras"],
    modelo: ["Galaxy A", "Galaxy S", "Galaxy Note"],
    segmento: ["Premium", "Estándar", "Básico"],
  };

  return mockData[columnKey] || [];
};

export function ValueConfigurator({
  value,
  onValueChange,
  operator,
  column,
  disabled = false,
}: ValueConfiguratorProps) {
  const [dynamicValues, setDynamicValues] = useState<string[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [newRangeLabel, setNewRangeLabel] = useState("");
  const [newRangeMin, setNewRangeMin] = useState("");
  const [newRangeMax, setNewRangeMax] = useState("");
  const [newListValue, setNewListValue] = useState("");

  const isRangeOperator = operator === "range";
  const supportsDynamic = column?.supportsDynamic ?? false;

  // Fetch dynamic values when switching to dynamic mode
  useEffect(() => {
    if (value.type === "dynamic" && column && !loadingDynamic && dynamicValues.length === 0) {
      setLoadingDynamic(true);
      fetchUniqueValues(column.key).then((values) => {
        setDynamicValues(values);
        setLoadingDynamic(false);
      });
    }
  }, [value.type, column, loadingDynamic, dynamicValues.length]);

  const handleSourceToggle = (isDynamic: boolean) => {
    if (isDynamic) {
      const newConfig: DynamicValueConfig = {
        type: "dynamic",
        selectedValues: [],
      };
      onValueChange(newConfig);
    } else {
      const newConfig: ManualValueConfig = {
        type: "manual",
        ...(isRangeOperator ? { ranges: [] } : { values: [] }),
      };
      onValueChange(newConfig);
    }
  };

  const addRange = () => {
    if (!newRangeLabel || !newRangeMin || !newRangeMax) return;
    if (value.type !== "manual" || !value.ranges) return;

    const min = parseFloat(newRangeMin);
    const max = parseFloat(newRangeMax);

    if (isNaN(min) || isNaN(max) || min >= max) {
      return;
    }

    const newRanges = [
      ...value.ranges,
      { label: newRangeLabel, min, max },
    ];
    onValueChange({ ...value, ranges: newRanges });
    setNewRangeLabel("");
    setNewRangeMin("");
    setNewRangeMax("");
  };

  const removeRange = (index: number) => {
    if (value.type !== "manual" || !value.ranges) return;
    const newRanges = value.ranges.filter((_, i) => i !== index);
    onValueChange({ ...value, ranges: newRanges });
  };

  const addListValue = () => {
    if (!newListValue.trim()) return;
    if (value.type !== "manual" || !value.values) return;

    const newValues = [...value.values, newListValue.trim()];
    onValueChange({ ...value, values: newValues });
    setNewListValue("");
  };

  const removeListValue = (index: number) => {
    if (value.type !== "manual" || !value.values) return;
    const newValues = value.values.filter((_, i) => i !== index);
    onValueChange({ ...value, values: newValues });
  };

  const toggleDynamicValue = (val: string) => {
    if (value.type !== "dynamic") return;

    const newSelected = value.selectedValues.includes(val)
      ? value.selectedValues.filter((v) => v !== val)
      : [...value.selectedValues, val];

    onValueChange({ ...value, selectedValues: newSelected });
  };

  if (!column) {
    return (
      <div className="space-y-2">
        <Label>Valores</Label>
        <p className="text-sm text-muted-foreground">
          Selecciona una columna primero para configurar los valores
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Configuración de Valores</Label>
        {supportsDynamic && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Manual</span>
            <Switch
              checked={value.type === "dynamic"}
              onCheckedChange={handleSourceToggle}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">Dinámico</span>
          </div>
        )}
      </div>

      {value.type === "manual" ? (
        <Card>
          <CardContent className="pt-4">
            {isRangeOperator ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rangos de Valores</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Etiqueta (ej: $500k-$1M)"
                      value={newRangeLabel}
                      onChange={(e) => setNewRangeLabel(e.target.value)}
                      disabled={disabled}
                    />
                    <Input
                      type="number"
                      placeholder="Mínimo"
                      value={newRangeMin}
                      onChange={(e) => setNewRangeMin(e.target.value)}
                      disabled={disabled}
                    />
                    <Input
                      type="number"
                      placeholder="Máximo"
                      value={newRangeMax}
                      onChange={(e) => setNewRangeMax(e.target.value)}
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      onClick={addRange}
                      disabled={disabled || !newRangeLabel || !newRangeMin || !newRangeMax}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {value.ranges && value.ranges.length > 0 && (
                  <div className="space-y-2">
                    {value.ranges.map((range, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">
                          {range.label}: {range.min} - {range.max}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRange(index)}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Valores de Lista</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar valor"
                      value={newListValue}
                      onChange={(e) => setNewListValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addListValue();
                        }
                      }}
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      onClick={addListValue}
                      disabled={disabled || !newListValue.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {value.values && value.values.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {value.values.map((val, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => removeListValue(index)}
                          disabled={disabled}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            {loadingDynamic ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Cargando valores únicos...
              </p>
            ) : dynamicValues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay valores únicos disponibles para esta columna
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Selecciona los valores a incluir en el filtro</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {dynamicValues.map((val) => (
                    <div
                      key={val}
                      className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`dynamic-${val}`}
                        checked={value.selectedValues.includes(val)}
                        onCheckedChange={() => toggleDynamicValue(val)}
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`dynamic-${val}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {val}
                      </Label>
                    </div>
                  ))}
                </div>
                {value.selectedValues.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {value.selectedValues.length} valor(es) seleccionado(s)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

