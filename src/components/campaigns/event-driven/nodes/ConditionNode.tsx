"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Filter } from "lucide-react";
import {
  FilterCondition,
  FilterConditionType,
} from "@/types/event-driven-campaigns";
import { Card } from "@/components/ui/card";

interface ConditionNodeData {
  config: {
    conditions?: FilterCondition[];
    operator?: "AND" | "OR";
    summary?: string;
  };
  label: string;
  icon: { type: "brand" | "lucide"; name: string } | string;
}

const ConditionNode = memo(
  ({ data, selected }: NodeProps<ConditionNodeData>) => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [config, setConfig] = useState<ConditionNodeData["config"]>(
      data.config || {
        conditions: [],
        operator: "AND",
      }
    );

    const conditionTypes: { value: FilterConditionType; label: string }[] = [
      { value: "cart_value", label: "Valor del Carrito" },
      { value: "user_segment", label: "Segmento de Usuario" },
      { value: "geographic_location", label: "Ubicación Geográfica" },
      { value: "time_since_event", label: "Tiempo desde Evento" },
      { value: "previous_behavior", label: "Comportamiento Previo" },
      { value: "device_type", label: "Tipo de Dispositivo" },
      { value: "traffic_source", label: "Fuente de Tráfico" },
    ];

    const operators = [
      { value: "equals", label: "Igual a" },
      { value: "not_equals", label: "No igual a" },
      { value: "greater_than", label: "Mayor que" },
      { value: "less_than", label: "Menor que" },
      { value: "contains", label: "Contiene" },
      { value: "in", label: "En lista" },
      { value: "not_in", label: "No en lista" },
    ];

    const getConditionTypeLabel = (type: FilterConditionType): string => {
      return conditionTypes.find((t) => t.value === type)?.label || type;
    };

    const getOperatorSymbol = (operator: string): string => {
      const symbols: Record<string, string> = {
        equals: "=",
        not_equals: "≠",
        greater_than: ">",
        less_than: "<",
        contains: "⊃",
        in: "∈",
        not_in: "∉",
      };
      return symbols[operator] || operator;
    };

    const getValueLabel = (_type: FilterConditionType, value: any): string => {
      // Traducciones especiales para valores conocidos
      const translations: Record<string, string> = {
        // User segments
        new_users: "Nuevos",
        returning_users: "Recurrentes",
        vip_users: "VIP",
        inactive_users: "Inactivos",
        // Device types
        desktop: "Desktop",
        mobile: "Móvil",
        tablet: "Tablet",
        // Time units
        minutes: "min",
        hours: "h",
        days: "días",
      };

      if (typeof value === "object" && value !== null) {
        if ("amount" in value && "unit" in value) {
          const unit = translations[value.unit] || value.unit;
          return `${value.amount} ${unit}`;
        }
        return JSON.stringify(value);
      }

      const stringValue = String(value || "");
      return translations[stringValue] || stringValue;
    };

    const generateSummary = (
      conditions: FilterCondition[],
      operator: "AND" | "OR"
    ): string => {
      if (!conditions || conditions.length === 0) {
        return "Sin condiciones";
      }

      const summaries = conditions.map((cond) => {
        const typeLabel = getConditionTypeLabel(cond.type);
        const operatorSymbol = getOperatorSymbol(cond.operator);
        const value = getValueLabel(cond.type, cond.value);

        return `${typeLabel} ${operatorSymbol} ${value}`;
      });

      if (summaries.length === 1) {
        return summaries[0];
      }

      const operatorLabel = operator === "AND" ? "Y" : "O";
      return summaries.join(` ${operatorLabel} `);
    };

    const addCondition = () => {
      const newCondition: FilterCondition = {
        type: "user_segment",
        operator: "equals",
        value: "",
      };
      const newConditions = [...(config.conditions || []), newCondition];
      const newConfig = {
        ...config,
        conditions: newConditions,
        summary: generateSummary(newConditions, config.operator || "AND"),
      };
      setConfig(newConfig);
    };

    const removeCondition = (index: number) => {
      const newConditions = (config.conditions || []).filter(
        (_, i) => i !== index
      );
      const newConfig = {
        ...config,
        conditions: newConditions,
        summary: generateSummary(newConditions, config.operator || "AND"),
      };
      setConfig(newConfig);
    };

    const updateCondition = (
      index: number,
      updates: Partial<FilterCondition>
    ) => {
      const newConditions = (config.conditions || []).map((condition, i) =>
        i === index ? { ...condition, ...updates } : condition
      );
      const newConfig = {
        ...config,
        conditions: newConditions,
        summary: generateSummary(newConditions, config.operator || "AND"),
      };
      setConfig(newConfig);
    };

    const updateOperator = (newOperator: "AND" | "OR") => {
      const newConfig = {
        ...config,
        operator: newOperator,
        summary: generateSummary(config.conditions || [], newOperator),
      };
      setConfig(newConfig);
    };

    const getConditionColor = () => {
      return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300";
    };

    const renderConditionValue = (
      condition: FilterCondition,
      index: number
    ) => {
      switch (condition.type) {
        case "cart_value":
          return (
            <Input
              type="number"
              placeholder="100.00"
              value={condition.value}
              onChange={(e) =>
                updateCondition(index, {
                  value: parseFloat(e.target.value) || 0,
                })
              }
            />
          );

        case "user_segment":
          return (
            <Select
              value={condition.value}
              onValueChange={(value) => updateCondition(index, { value })}
            >

              <SelectTrigger className="max-w-full">
                <SelectValue className="truncate" placeholder="Seleccionar segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_users">Usuarios Nuevos</SelectItem>
                <SelectItem value="returning_users">
                  Usuarios Recurrentes
                </SelectItem>
                <SelectItem value="vip_users">Usuarios VIP</SelectItem>
                <SelectItem value="inactive_users">
                  Usuarios Inactivos
                </SelectItem>
              </SelectContent>
            </Select>
          );

        case "geographic_location":
          return (
            <Input
              placeholder="País, región o ciudad"
              value={condition.value}
              onChange={(e) =>
                updateCondition(index, { value: e.target.value })
              }
            />
          );

        case "time_since_event":
          return (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="24"
                value={condition.value?.amount || ""}
                onChange={(e) =>
                  updateCondition(index, {
                    value: {
                      ...condition.value,
                      amount: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
              <Select
                value={condition.value?.unit || "hours"}
                onValueChange={(unit) =>
                  updateCondition(index, {
                    value: {
                      ...condition.value,
                      unit,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "device_type":
          return (
            <Select
              value={condition.value}
              onValueChange={(value) => updateCondition(index, { value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de dispositivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Móvil</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          );

        default:
          return (
            <Input
              placeholder="Valor"
              value={condition.value}
              onChange={(e) =>
                updateCondition(index, { value: e.target.value })
              }
            />
          );
      }
    };

    return (
      <>
        <div
          className={`
          relative rounded-lg border-2 transition-all duration-200 cursor-pointer flex
          ${
            selected
              ? "border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${getConditionColor()}
        `}
          onDoubleClick={() => setIsConfigOpen(true)}
          style={{ width: "160px", minHeight: "100px" }}
        >
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 !bg-yellow-500 border-2 border-white dark:border-gray-800"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 !bg-green-500 border-2 border-white dark:border-gray-800"
            style={{ top: "60%" }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-3 h-3 !bg-red-500 border-2 border-white dark:border-gray-800"
            style={{ top: "80%" }}
          />

          {config.conditions && config.conditions.length > 0 ? (
            <div className="p-3 w-full flex flex-col items-center justify-center gap-1.5 overflow-hidden">
              <Filter size={24} />
              <span className="text-xs font-medium text-center">
                {config.conditions.length} Condición
                {config.conditions.length !== 1 ? "es" : ""}
              </span>
              {config.conditions.length > 1 && config.operator && (
                <span className="text-xs font-semibold text-center text-purple-600 dark:text-purple-400">
                  {config.operator === "AND" ? "Y" : "O"}
                </span>
              )}
              <div className="flex flex-col items-center gap-0.5 w-full overflow-y-auto">
                {config.conditions.map((cond, idx) => {
                  const typeLabel = getConditionTypeLabel(cond.type);
                  const operatorSymbol = getOperatorSymbol(cond.operator);
                  const value = getValueLabel(cond.type, cond.value);

                  return (
                    <span
                      key={idx}
                      className="text-[10px] text-center text-muted-foreground px-1 leading-tight  max-w-full"
                    >
                      {typeLabel} {operatorSymbol} {value}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 w-full flex items-center justify-center">
              <span className="text-sm font-medium text-center text-gray-500">
                Condición
              </span>
            </div>
          )}

          <div className="absolute -right-12 top-[55%] text-xs text-green-600 dark:text-green-400 font-medium">
            Sí
          </div>
          <div className="absolute -right-12 top-[75%] text-xs text-red-600 dark:text-red-400 font-medium">
            No
          </div>
        </div>

        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className=" overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter size={20} />
                Configurar Condiciones
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-3">
                <Label>Operador Lógico</Label>
                <Select
                  value={config.operator || "AND"}
                  onValueChange={(value: "AND" | "OR") => updateOperator(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">
                      Y (todas las condiciones)
                    </SelectItem>
                    <SelectItem value="OR">O (cualquier condición)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Condiciones</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
                {(config.conditions || []).map((condition, index) => (
                  <Card key={index} className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Condición {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Tipo Selector */}
                        <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            value={condition.type}
                            onValueChange={(type: FilterConditionType) =>
                              updateCondition(index, { type })
                            }
                          >
                            <SelectTrigger className="max-w-full">
                              <SelectValue className="truncate" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Operador Selector */}
                        <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
                          <Label className="text-xs">Operador</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(operator: any) =>
                              updateCondition(index, { operator })
                            }
                          >
                            <SelectTrigger className="max-w-full">
                              <SelectValue className="truncate" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Valor */}
                        <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
                          <Label className="text-xs">Valor</Label>
                          <div className="truncate">
                            {renderConditionValue(condition, index)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!config.conditions || config.conditions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay condiciones configuradas.
                    <br />
                    <Button
                      variant="outline"
                      onClick={addCondition}
                      className="mt-2"
                    >
                      Agregar primera condición
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ConditionNode.displayName = "ConditionNode";

export default ConditionNode;
