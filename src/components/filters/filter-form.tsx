"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { DynamicFilter, FilterScope, FilterOperator, FilterDisplayType, FilterOrderConfig } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { ScopeSelector } from "./scope-selector";
import { ColumnSelector } from "./column-selector";
import { OperatorSelector } from "./operator-selector";
import { ValueConfigurator } from "./value-configurator";
import { DisplayTypeSelector } from "./display-type-selector";
import { toast } from "sonner";
import { useProductColumns } from "@/hooks/use-product-columns";
import { useDisplayTypes } from "@/hooks/use-display-types";

interface FilterFormProps {
  filter?: DynamicFilter;
  categories: WebsiteCategory[];
  onSave: (filter: DynamicFilter) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getDefaultValueConfig = (
  operator: FilterOperator
): DynamicFilter["valueConfig"] => {
  if (operator === "range") {
    return {
      type: "manual",
      ranges: [],
    };
  }
  return {
    type: "manual",
    values: [],
  };
};

export function FilterForm({
  filter,
  categories,
  onSave,
  onCancel,
  isLoading = false,
}: FilterFormProps) {
  const [sectionName, setSectionName] = useState(filter?.sectionName || "");
  const [column, setColumn] = useState(filter?.column || "");
  const [operator, setOperator] = useState<FilterOperator>(
    filter?.operator || "equal"
  );
  const [operatorMode, setOperatorMode] = useState<"column" | "per-value">(
    filter?.operatorMode || "column"
  );
  const [valueConfig, setValueConfig] = useState<DynamicFilter["valueConfig"]>(
    filter?.valueConfig || getDefaultValueConfig("equal")
  );
  const [displayType, setDisplayType] = useState<FilterDisplayType>(
    filter?.displayType || "checkbox"
  );
  const [scope, setScope] = useState<FilterScope>(
    filter?.scope || { categories: [], menus: [], submenus: [] }
  );
  const [isActive, setIsActive] = useState(filter?.isActive ?? true);

  const { columns } = useProductColumns();
  const selectedColumn = columns.find((col) => col.key === column);
  
  // Get display types from API
  const { displayTypes } = useDisplayTypes({
    columnKey: column,
    operator: operatorMode === "column" ? operator : undefined,
  });

  // Update form state when filter prop changes (for editing)
  useEffect(() => {
    if (filter) {
      setSectionName(filter.sectionName || "");
      setColumn(filter.column || "");
      setOperator(filter.operator || "equal");
      setOperatorMode(filter.operatorMode || "column");
      setValueConfig(filter.valueConfig || getDefaultValueConfig(filter.operator || "equal"));
      setDisplayType(filter.displayType || "checkbox");
      setScope(filter.scope || { categories: [], menus: [], submenus: [] });
      setIsActive(filter.isActive ?? true);
    }
  }, [filter]);

  // Reset display type when operator or column changes using API defaultType
  useEffect(() => {
    if (displayTypes && displayTypes.availableTypes.length > 0) {
      const isCurrentValueAvailable = displayTypes.availableTypes.some(
        (type) => type.value === displayType
      );
      if (!isCurrentValueAvailable && displayTypes.defaultType) {
        setDisplayType(displayTypes.defaultType);
      }
    }
  }, [displayTypes, operator, column, operatorMode]);

  // Reset value config when operator or column changes
  useEffect(() => {
    if (operator === "range") {
      if (valueConfig.type === "manual" && !valueConfig.ranges) {
        setValueConfig({ type: "manual", ranges: [] });
      }
    } else {
      if (valueConfig.type === "manual" && !valueConfig.values) {
        setValueConfig({ type: "manual", values: [] });
      }
    }
  }, [operator, valueConfig]);

  const handleSave = () => {
    // Validation
    if (!sectionName.trim()) {
      toast.error("El nombre de la sección es requerido");
      return;
    }

    if (!column) {
      toast.error("Debes seleccionar una columna");
      return;
    }

    if (
      scope.categories.length === 0 &&
      scope.menus.length === 0 &&
      scope.submenus.length === 0
    ) {
      toast.error("Debes seleccionar al menos un alcance (categoría, menú o submenú)");
      return;
    }

    // Validate value config based on type
    if (valueConfig.type === "manual") {
      if (operator === "range") {
        if (!valueConfig.ranges || valueConfig.ranges.length === 0) {
          toast.error("Debes agregar al menos un rango de valores");
          return;
        }
      } else {
        if (!valueConfig.values || valueConfig.values.length === 0) {
          toast.error("Debes agregar al menos un valor");
          return;
        }
      }
    } else if (valueConfig.type === "dynamic") {
      if (valueConfig.selectedValues.length === 0) {
        toast.error("Debes seleccionar al menos un valor dinámico");
        return;
      }
    } else if (valueConfig.type === "mixed") {
      const hasDynamicValues = valueConfig.dynamicValues && valueConfig.dynamicValues.length > 0;
      const hasManualValues = valueConfig.manualValues && valueConfig.manualValues.length > 0;
      const hasRanges = valueConfig.ranges && valueConfig.ranges.length > 0;
      
      if (!hasDynamicValues && !hasManualValues && !hasRanges) {
        toast.error("Debes agregar al menos un valor (dinámico, manual o rango)");
        return;
      }
    }

    // Order will be set by the parent component based on scope
    const defaultOrder: FilterOrderConfig = {
      categories: {},
      menus: {},
      submenus: {},
    };

    const filterData: DynamicFilter = {
      id: filter?.id || `filter-${Date.now()}`,
      sectionName: sectionName.trim(),
      column,
      operator,
      operatorMode,
      valueConfig,
      displayType,
      scope,
      order: filter?.order || defaultOrder,
      isActive,
      createdAt: filter?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(filterData);
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="section-name">Nombre de la Sección *</Label>
          <Input
            id="section-name"
            placeholder="Ej: RANGO DE PRECIOS"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Este nombre aparecerá en el panel de filtros del frontend
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColumnSelector
              value={column}
              onValueChange={setColumn}
              disabled={isLoading}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Modo de Operador</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        <strong>Por columna:</strong> Todos los valores usan el mismo operador seleccionado.<br/>
                        <strong>Por valor:</strong> Cada valor puede tener su propio operador configurado individualmente.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={operatorMode}
                onValueChange={(value: "column" | "per-value") => setOperatorMode(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="column">Por columna</SelectItem>
                  <SelectItem value="per-value">Por valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {operatorMode === "column" && (
            <div>
              <OperatorSelector
                value={operator}
                onValueChange={setOperator}
                selectedColumn={selectedColumn}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Scope Selection */}
      <ScopeSelector
        value={scope}
        onValueChange={setScope}
        categories={categories}
        disabled={isLoading}
      />

      <Separator />

      {/* Value Configuration */}
      <ValueConfigurator
        value={valueConfig}
        onValueChange={setValueConfig}
        operator={operator}
        operatorMode={operatorMode}
        onOperatorModeChange={setOperatorMode}
        column={selectedColumn}
        scope={scope}
        categories={categories}
        disabled={isLoading}
      />

      <Separator />

      {/* Display Type */}
      <DisplayTypeSelector
        value={displayType}
        onValueChange={setDisplayType}
        operator={operator}
        columnKey={column}
        disabled={isLoading}
      />

      <Separator />

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is-active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4"
        />
        <Label htmlFor="is-active" className="cursor-pointer">
          Filtro activo
        </Label>
        <p className="text-xs text-muted-foreground ml-4">
          El orden se configura arrastrando los filtros en la página principal
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Guardando..." : filter ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </div>
  );
}

