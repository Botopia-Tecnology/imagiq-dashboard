"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  FilterScope,
  ProductColumn,
  ManualValueConfig,
  DynamicValueConfig,
} from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { productEndpoints } from "@/lib/api";

interface ValueConfiguratorProps {
  value: FilterValueConfig;
  onValueChange: (config: FilterValueConfig) => void;
  operator: FilterOperator;
  column: ProductColumn | undefined;
  scope?: FilterScope;
  categories?: WebsiteCategory[];
  disabled?: boolean;
}

// Helper function to convert column key to camelCase for API
const toCamelCase = (str: string): string => {
  // Handle specific cases
  if (str === "nombrecolor") {
    return "nombreColor";
  }
  // nombreMarket and codigoMarket are already in camelCase, but ensure consistency
  if (str === "nombreMarket" || str === "codigoMarket") {
    return str;
  }
  // For other cases, convert snake_case or lowercase to camelCase
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper function to map scope IDs to API parameter names
const mapScopeToApiParams = (
  scope: FilterScope | undefined,
  categories: WebsiteCategory[]
): { categoria?: string; menu?: string } => {
  if (!scope) {
    return {};
  }

  const params: { categoria?: string; menu?: string } = {};

  // Map category IDs to names
  if (scope.categories.length > 0) {
    const categoryNames = scope.categories
      .map((categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.nombreVisible || category?.name;
      })
      .filter((name): name is string => !!name);
    
    if (categoryNames.length > 0) {
      params.categoria = categoryNames.join(",");
    }
  }

  // Map menu IDs to names
  if (scope.menus.length > 0) {
    const menuNames = scope.menus
      .map((menuId) => {
        for (const category of categories) {
          const menu = category.menus.find((m) => m.id === menuId);
          if (menu) {
            return menu.nombreVisible || menu.name;
          }
        }
        return null;
      })
      .filter((name): name is string => !!name);
    
    if (menuNames.length > 0) {
      params.menu = menuNames.join(",");
    }
  }

  return params;
};

export function ValueConfigurator({
  value,
  onValueChange,
  operator,
  column,
  scope,
  categories = [],
  disabled = false,
}: ValueConfiguratorProps) {
  const [dynamicValues, setDynamicValues] = useState<string[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [newRangeLabel, setNewRangeLabel] = useState("");
  const [newRangeMin, setNewRangeMin] = useState("");
  const [newRangeMax, setNewRangeMax] = useState("");
  const [newListValue, setNewListValue] = useState("");
  
  // Use ref to track the last request to avoid duplicate calls
  const lastRequestRef = useRef<string>("");

  const isRangeOperator = operator === "range";
  const supportsDynamic = column?.supportsDynamic ?? false;

  // Memoize scope keys to avoid recreating strings on every render
  const scopeCategoriesKey = useMemo(() => scope?.categories.join(",") || "", [scope?.categories]);
  const scopeMenusKey = useMemo(() => scope?.menus.join(",") || "", [scope?.menus]);
  const scopeSubmenusKey = useMemo(() => scope?.submenus.join(",") || "", [scope?.submenus]);
  const selectedValuesKey = useMemo(() => {
    if (value.type === "dynamic") {
      const dynamicConfig = value as DynamicValueConfig;
      return dynamicConfig.selectedValues.join(",");
    }
    return "";
  }, [value]);

  // Fetch dynamic values when switching to dynamic mode or when scope/column changes
  useEffect(() => {
    if (value.type === "dynamic" && column && !loadingDynamic) {
      // Convert column key to camelCase for API (e.g., nombrecolor -> nombreColor)
      const apiColumnKey = toCamelCase(column.key);
      
      // Create a unique key for this request to avoid duplicates
      const scopeKey = scope 
        ? `${scopeCategoriesKey}|${scopeMenusKey}|${scopeSubmenusKey}`
        : "";
      const requestKey = `${apiColumnKey}|${scopeKey}`;
      
      // Skip if this is the same request as the last one
      if (lastRequestRef.current === requestKey) {
        return;
      }
      
      setLoadingDynamic(true);
      setDynamicValues([]); // Reset values when scope/column changes
      lastRequestRef.current = requestKey;
      
      // Map scope to API parameters
      const apiParams = mapScopeToApiParams(scope, categories);
      
      // Call the API endpoint
      productEndpoints
        .getDistinctValues(apiColumnKey, apiParams)
        .then((response) => {
          if (response.success) {
            // Handle different response formats
            let valuesArray: string[] = [];
            
            if (Array.isArray(response.data)) {
              // Direct array response
              valuesArray = response.data;
            } else if (response.data && typeof response.data === 'object') {
              const data = response.data as any;
              if ('values' in data && Array.isArray(data.values)) {
                // Wrapped in { values: [...] }
                valuesArray = data.values;
              } else if ('data' in data && Array.isArray(data.data)) {
                // Double-wrapped response
                valuesArray = data.data;
              }
            }
            
            if (valuesArray.length > 0) {
              setDynamicValues(valuesArray);
              // Reset selected values if they're no longer in the new list
              const dynamicConfig = value as DynamicValueConfig;
              if (dynamicConfig.selectedValues.length > 0) {
                const validSelectedValues = dynamicConfig.selectedValues.filter((val) =>
                  valuesArray.includes(val)
                );
                if (validSelectedValues.length !== dynamicConfig.selectedValues.length) {
                  onValueChange({ ...value, selectedValues: validSelectedValues } as DynamicValueConfig);
                }
              }
            } else {
              console.warn("No values found in response", {
                columnKey: column.key,
                apiColumnKey: apiColumnKey,
                apiParams,
                responseData: response.data
              });
              setDynamicValues([]);
            }
          } else {
            const errorMessage = response.message || 
              (response.data && typeof response.data === 'object' && 'message' in response.data 
                ? String(response.data.message) 
                : 'Error desconocido al obtener valores');
            console.error("Failed to fetch distinct values:", errorMessage, {
              columnKey: column.key,
              apiColumnKey: apiColumnKey,
              apiParams,
              response
            });
            setDynamicValues([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching distinct values:", error, {
            columnKey: column.key,
            apiColumnKey: apiColumnKey,
            apiParams
          });
          setDynamicValues([]);
          lastRequestRef.current = ""; // Reset on error to allow retry
        })
        .finally(() => {
          setLoadingDynamic(false);
        });
    } else if (value.type !== "dynamic") {
      // Clear dynamic values when switching to manual mode
      setDynamicValues([]);
      lastRequestRef.current = "";
    }
  }, [
    value.type, 
    selectedValuesKey,
    column?.key, 
    scopeCategoriesKey,
    scopeMenusKey,
    scopeSubmenusKey,
    categories.length
  ]);

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

  const toggleSelectAllDynamicValues = () => {
    if (value.type !== "dynamic") return;

    // Check if all values are already selected
    const allSelected = dynamicValues.length > 0 && 
      dynamicValues.every(val => value.selectedValues.includes(val));

    if (allSelected) {
      // Deselect all
      onValueChange({ ...value, selectedValues: [] });
    } else {
      // Select all
      onValueChange({ ...value, selectedValues: [...dynamicValues] });
    }
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
                <div className="flex items-center justify-between">
                  <Label>Selecciona los valores a incluir en el filtro</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAllDynamicValues}
                    disabled={disabled || dynamicValues.length === 0}
                  >
                    {dynamicValues.length > 0 && 
                     dynamicValues.every(val => value.selectedValues.includes(val))
                      ? "Deseleccionar todo"
                      : "Seleccionar todo"}
                  </Button>
                </div>
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

