"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DynamicFilter, FilterScope, FilterOperator, FilterDisplayType, FilterOrderConfig } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { ScopeSelector } from "./scope-selector";
import { ColumnSelector } from "./column-selector";
import { OperatorSelector } from "./operator-selector";
import { ValueConfigurator } from "./value-configurator";
import { DisplayTypeSelector } from "./display-type-selector";
import { toast } from "sonner";
import { useProductColumns } from "@/hooks/use-product-columns";

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

  // Reset display type when operator changes if incompatible
  useEffect(() => {
    const isRangeOperator = operator === "range";
    const isCompatible =
      (isRangeOperator && displayType === "slider") ||
      (!isRangeOperator && displayType !== "slider");

    if (!isCompatible) {
      setDisplayType(isRangeOperator ? "slider" : "checkbox");
    }
  }, [operator, displayType]);

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
    } else {
      if (valueConfig.selectedValues.length === 0) {
        toast.error("Debes seleccionar al menos un valor dinámico");
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

        <div className="grid grid-cols-2 gap-4">
          <ColumnSelector
            value={column}
            onValueChange={setColumn}
            disabled={isLoading}
          />
          <OperatorSelector
            value={operator}
            onValueChange={setOperator}
            selectedColumn={selectedColumn}
            disabled={isLoading}
          />
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
        column={selectedColumn}
        disabled={isLoading}
      />

      <Separator />

      {/* Display Type */}
      <DisplayTypeSelector
        value={displayType}
        onValueChange={setDisplayType}
        operator={operator}
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

