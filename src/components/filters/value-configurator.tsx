"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import {
  FilterValueConfig,
  FilterOperator,
  FilterScope,
  ProductColumn,
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
): { categoria?: string; menu?: string; submenu?: string } => {
  if (!scope) {
    return {};
  }

  const params: { categoria?: string; menu?: string; submenu?: string } = {};

  // Map category IDs to codes (use name which contains the code like IM, AV, DA, IT)
  if (scope.categories.length > 0) {
    const categoryCodes = scope.categories
      .map((categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        // Use name which contains the category code (IM, AV, DA, IT) from backend
        return category?.name;
      })
      .filter((code): code is string => !!code);
    
    if (categoryCodes.length > 0) {
      params.categoria = categoryCodes.join(",");
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

  // Map submenu IDs to names
  if (scope.submenus.length > 0) {
    const submenuNames = scope.submenus
      .map((submenuId) => {
        for (const category of categories) {
          for (const menu of category.menus) {
            const submenu = menu.submenus.find((s) => s.id === submenuId);
            if (submenu) {
              return submenu.nombreVisible || submenu.name;
            }
          }
        }
        return null;
      })
      .filter((name): name is string => !!name);
    
    if (submenuNames.length > 0) {
      params.submenu = submenuNames.join(",");
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
  
  // Use ref to track the last request to avoid duplicate calls
  const lastRequestRef = useRef<string>("");

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

  // Function to fetch dynamic values from API
  const fetchDynamicValues = () => {
    if (!column || loadingDynamic) return;

    // Convert column key to camelCase for API (e.g., nombrecolor -> nombreColor)
    const apiColumnKey = toCamelCase(column.key);
    
    // Create a unique key for this request to avoid duplicates
    const scopeKey = scope 
      ? `${scopeCategoriesKey}|${scopeMenusKey}|${scopeSubmenusKey}`
      : "";
    const requestKey = `${apiColumnKey}|${scopeKey}`;
    
    // Skip if this is the same request as the last one
    if (lastRequestRef.current === requestKey && dynamicValues.length > 0) {
      return;
    }
    
    setLoadingDynamic(true);
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
  };

  // Ensure value is always dynamic type
  useEffect(() => {
    if (value.type !== "dynamic") {
      const newConfig: DynamicValueConfig = {
        type: "dynamic",
        selectedValues: [],
      };
      onValueChange(newConfig);
    }
  }, [value.type, onValueChange]);


  const toggleDynamicValue = (val: string) => {
    if (value.type !== "dynamic") return;
    const dynamicConfig = value as DynamicValueConfig;

    const newSelected = dynamicConfig.selectedValues.includes(val)
      ? dynamicConfig.selectedValues.filter((v) => v !== val)
      : [...dynamicConfig.selectedValues, val];

    onValueChange({ ...dynamicConfig, selectedValues: newSelected });
  };

  const toggleSelectAllDynamicValues = () => {
    if (value.type !== "dynamic") return;
    const dynamicConfig = value as DynamicValueConfig;

    // Check if all values are already selected
    const allSelected = dynamicValues.length > 0 && 
      dynamicValues.every(val => dynamicConfig.selectedValues.includes(val));

    if (allSelected) {
      // Deselect all
      onValueChange({ ...dynamicConfig, selectedValues: [] });
    } else {
      // Select all
      onValueChange({ ...dynamicConfig, selectedValues: [...dynamicValues] });
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
      </div>

      <Card>
        <CardContent className="pt-4">
          {loadingDynamic ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                Cargando valores únicos...
              </p>
            </div>
          ) : dynamicValues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {supportsDynamic 
                  ? "Haz clic en el botón para cargar los valores disponibles"
                  : "Esta columna no soporta carga dinámica de valores"}
              </p>
              {supportsDynamic && (
                <Button
                  type="button"
                  onClick={fetchDynamicValues}
                  disabled={disabled || !column}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cargar Valores
                </Button>
              )}
            </div>
          ) : (
            (() => {
              const dynamicConfig = value.type === "dynamic" ? value as DynamicValueConfig : { selectedValues: [] as string[] };
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Selecciona los valores a incluir en el filtro</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchDynamicValues}
                        disabled={disabled}
                        title="Recargar valores"
                      >
                        Actualizar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleSelectAllDynamicValues}
                        disabled={disabled || dynamicValues.length === 0}
                      >
                        {dynamicValues.length > 0 && 
                         dynamicValues.every(val => dynamicConfig.selectedValues.includes(val))
                          ? "Deseleccionar todo"
                          : "Seleccionar todo"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {dynamicValues.map((val) => (
                      <div
                        key={val}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`dynamic-${val}`}
                          checked={dynamicConfig.selectedValues.includes(val)}
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
                  {dynamicConfig.selectedValues.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {dynamicConfig.selectedValues.length} valor(es) seleccionado(s)
                    </p>
                  )}
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
}

