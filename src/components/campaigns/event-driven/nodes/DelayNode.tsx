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
import { Settings, Trash2, Clock } from 'lucide-react';

interface DelayNodeData {
  delayAmount: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const DelayNode = memo(({ data, selected }: NodeProps<DelayNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [delayAmount, setDelayAmount] = useState(data.delayAmount || 1);
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours' | 'days'>(data.delayUnit || 'hours');

  const getDelayColor = () => {
    return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
  };

  const formatDelayLabel = (amount: number, unit: string) => {
    const unitLabels = {
      minutes: amount === 1 ? 'minuto' : 'minutos',
      hours: amount === 1 ? 'hora' : 'horas',
      days: amount === 1 ? 'día' : 'días'
    };
    return `${amount} ${unitLabels[unit as keyof typeof unitLabels]}`;
  };

  const getDelayDescription = () => {
    if (delayAmount < 1) return 'Configurar espera';
    return `Esperar ${formatDelayLabel(delayAmount, delayUnit)}`;
  };

  const validateDelayAmount = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) return 1;

    // Set reasonable limits based on unit
    switch (delayUnit) {
      case 'minutes':
        return Math.min(num, 1440); // Max 24 hours in minutes
      case 'hours':
        return Math.min(num, 168); // Max 1 week in hours
      case 'days':
        return Math.min(num, 30); // Max 30 days
      default:
        return num;
    }
  };

  const getMaxValue = () => {
    switch (delayUnit) {
      case 'minutes':
        return 1440; // 24 hours
      case 'hours':
        return 168; // 1 week
      case 'days':
        return 30; // 30 days
      default:
        return 999;
    }
  };

  const getStepValue = () => {
    switch (delayUnit) {
      case 'minutes':
        return 5;
      case 'hours':
        return 1;
      case 'days':
        return 1;
      default:
        return 1;
    }
  };

  return (
    <>
      <Card className={`w-56 ${getDelayColor()} ${selected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span className="font-medium text-xs uppercase tracking-wide">ESPERA</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Configurar Tiempo de Espera</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delayAmount">Cantidad</Label>
                        <Input
                          id="delayAmount"
                          type="number"
                          min="1"
                          max={getMaxValue()}
                          step={getStepValue()}
                          value={delayAmount}
                          onChange={(e) => setDelayAmount(validateDelayAmount(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="delayUnit">Unidad</Label>
                        <Select
                          value={delayUnit}
                          onValueChange={(value: 'minutes' | 'hours' | 'days') => {
                            setDelayUnit(value);
                            // Adjust amount if it exceeds new unit limits
                            setDelayAmount(prev => {
                              const maxForUnit = (() => {
                                switch (value) {
                                  case 'minutes': return 1440;
                                  case 'hours': return 168;
                                  case 'days': return 30;
                                  default: return prev;
                                }
                              })();
                              return Math.min(prev, maxForUnit);
                            });
                          }}
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
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Vista previa:</h4>
                      <p className="text-sm text-muted-foreground">
                        Los usuarios esperarán <strong>{formatDelayLabel(delayAmount, delayUnit)}</strong> antes de continuar al siguiente paso.
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Límites:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Minutos: 1-1440 (24 horas máximo)</li>
                        <li>Horas: 1-168 (1 semana máximo)</li>
                        <li>Días: 1-30 (30 días máximo)</li>
                      </ul>
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
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-sm">⏰</span>
              <h3 className="font-medium text-xs">
                {getDelayDescription()}
              </h3>
            </div>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              Tiempo de Espera
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </>
  );
});

DelayNode.displayName = 'DelayNode';

export default DelayNode;