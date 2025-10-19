'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Trash2, Plus, X } from 'lucide-react';
import { FilterCondition, FilterConditionType } from '@/types/event-driven-campaigns';

interface ConditionNodeData {
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const ConditionNode = memo(({ data, selected }: NodeProps<ConditionNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>(data.conditions || []);
  const [operator, setOperator] = useState<'AND' | 'OR'>(data.operator || 'AND');

  const conditionTypes: { value: FilterConditionType; label: string }[] = [
    { value: 'cart_value', label: 'Valor del Carrito' },
    { value: 'user_segment', label: 'Segmento de Usuario' },
    { value: 'geographic_location', label: 'Ubicación Geográfica' },
    { value: 'time_since_event', label: 'Tiempo desde Evento' },
    { value: 'previous_behavior', label: 'Comportamiento Previo' },
    { value: 'device_type', label: 'Tipo de Dispositivo' },
    { value: 'traffic_source', label: 'Fuente de Tráfico' },
  ];

  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'No igual a' },
    { value: 'greater_than', label: 'Mayor que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'contains', label: 'Contiene' },
    { value: 'in', label: 'En lista' },
    { value: 'not_in', label: 'No en lista' },
  ];

  const addCondition = () => {
    const newCondition: FilterCondition = {
      type: 'user_segment',
      operator: 'equals',
      value: '',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const updated = conditions.map((condition, i) =>
      i === index ? { ...condition, ...updates } : condition
    );
    setConditions(updated);
  };

  const getConditionColor = () => {
    return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300';
  };

  const renderConditionValue = (condition: FilterCondition, index: number) => {
    switch (condition.type) {
      case 'cart_value':
        return (
          <Input
            type="number"
            placeholder="100.00"
            value={condition.value}
            onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) || 0 })}
          />
        );

      case 'user_segment':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(index, { value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_users">Usuarios Nuevos</SelectItem>
              <SelectItem value="returning_users">Usuarios Recurrentes</SelectItem>
              <SelectItem value="vip_users">Usuarios VIP</SelectItem>
              <SelectItem value="inactive_users">Usuarios Inactivos</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'geographic_location':
        return (
          <Input
            placeholder="País, región o ciudad"
            value={condition.value}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
          />
        );

      case 'time_since_event':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="24"
              value={condition.value?.amount || ''}
              onChange={(e) => updateCondition(index, {
                value: {
                  ...condition.value,
                  amount: parseInt(e.target.value) || 0
                }
              })}
            />
            <Select
              value={condition.value?.unit || 'hours'}
              onValueChange={(unit) => updateCondition(index, {
                value: {
                  ...condition.value,
                  unit
                }
              })}
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

      case 'device_type':
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
            onChange={(e) => updateCondition(index, { value: e.target.value })}
          />
        );
    }
  };

  return (
    <>
      <Card className={`w-72 ${getConditionColor()} ${selected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🎯</span>
              <span className="font-medium text-xs uppercase tracking-wide">CONDICIÓN</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configurar Condiciones</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label>Operador Lógico</Label>
                      <Select value={operator} onValueChange={(value: 'AND' | 'OR') => setOperator(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">Y (todas las condiciones)</SelectItem>
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

                      {conditions.map((condition, index) => (
                        <Card key={index} className="p-3">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Condición {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCondition(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Tipo</Label>
                                <Select
                                  value={condition.type}
                                  onValueChange={(type: FilterConditionType) =>
                                    updateCondition(index, { type })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
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

                              <div>
                                <Label className="text-xs">Operador</Label>
                                <Select
                                  value={condition.operator}
                                  onValueChange={(operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in') => updateCondition(index, { operator })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
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

                              <div>
                                <Label className="text-xs">Valor</Label>
                                {renderConditionValue(condition, index)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {conditions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay condiciones configuradas.
                          <br />
                          <Button variant="outline" onClick={addCondition} className="mt-2">
                            Agregar primera condición
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsConfigOpen(false)}>
                      Guardar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-center">
            <h3 className="font-medium text-xs mb-1">Filtro de Usuarios</h3>
            <div className="flex justify-center gap-1">
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {conditions.length} condición{conditions.length !== 1 ? 'es' : ''}
              </Badge>
              {conditions.length > 1 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {operator}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '80%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;