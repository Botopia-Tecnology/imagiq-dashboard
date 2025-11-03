'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { IfNode as IfNodeType, ConditionalRule, ConditionalLogicType } from '@/types/event-driven-campaigns';

interface IfNodeData {
  conditions: ConditionalRule[];
  operator: 'AND' | 'OR';
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const IfNode = memo(({ data, selected }: NodeProps<IfNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [conditions, setConditions] = useState<ConditionalRule[]>(data.conditions || []);
  const [operator, setOperator] = useState<'AND' | 'OR'>(data.operator || 'AND');

  const addCondition = () => {
    setConditions([...conditions, {
      field: '',
      operator: 'equals',
      value: '',
      dataType: 'string'
    }]);
  };

  const updateCondition = (index: number, field: keyof ConditionalRule, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };


  return (
    <>
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${selected
            ? 'border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: '120px', height: '80px' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        {/* True Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="w-3 h-3 !bg-green-500 border-2 border-white dark:border-gray-800"
          style={{ top: '25%' }}
        />

        {/* False Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="w-3 h-3 !bg-red-500 border-2 border-white dark:border-gray-800"
          style={{ top: '75%' }}
        />

        <div className="p-3 h-full flex flex-col items-center justify-center">
          <GitBranch className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-1" />
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300 text-center">
            IF
          </span>
          {conditions.length > 0 && (
            <Badge variant="outline" className="text-xs mt-1">
              {conditions.length} regla{conditions.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Branch Labels */}
        <div className="absolute -right-12 top-[20%] text-xs text-green-600 dark:text-green-400 font-medium">
          Sí
        </div>
        <div className="absolute -right-12 top-[70%] text-xs text-red-600 dark:text-red-400 font-medium">
          No
        </div>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Configurar Condiciones IF
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                <Button size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {conditions.map((condition, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                  <div className="col-span-3">
                    <Input
                      placeholder="Campo"
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    />
                  </div>

                  <div className="col-span-3">
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(index, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">es igual a</SelectItem>
                        <SelectItem value="not_equals">no es igual a</SelectItem>
                        <SelectItem value="greater_than">es mayor que</SelectItem>
                        <SelectItem value="less_than">es menor que</SelectItem>
                        <SelectItem value="contains">contiene</SelectItem>
                        <SelectItem value="not_contains">no contiene</SelectItem>
                        <SelectItem value="starts_with">empieza con</SelectItem>
                        <SelectItem value="ends_with">termina con</SelectItem>
                        <SelectItem value="is_empty">está vacío</SelectItem>
                        <SelectItem value="is_not_empty">no está vacío</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Input
                      placeholder="Valor"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={condition.dataType}
                      onValueChange={(value) => updateCondition(index, 'dataType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="boolean">Booleano</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {conditions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No hay condiciones configuradas
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsConfigOpen(false)}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

IfNode.displayName = 'IfNode';

export { IfNode };