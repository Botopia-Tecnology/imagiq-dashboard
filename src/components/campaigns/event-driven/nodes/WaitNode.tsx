'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Timer, Plus, Trash2, Webhook, Activity } from 'lucide-react';
import { WaitNode as WaitNodeType, WaitConfig, WaitTriggerType, ConditionalRule } from '@/types/event-driven-campaigns';

interface WaitNodeData {
  waitType: WaitTriggerType;
  config: WaitConfig;
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
  timeout?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

const WaitNode = memo(({ data, selected }: NodeProps<WaitNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [waitType, setWaitType] = useState<WaitTriggerType>(data.waitType || 'time_delay');
  const [config, setConfig] = useState<WaitConfig>(data.config || {});

  const getWaitTypeIcon = (type: WaitTriggerType) => {
    switch (type) {
      case 'time_delay':
        return <Timer className="h-6 w-6" />;
      case 'wait_for_event':
        return <Activity className="h-6 w-6" />;
      case 'wait_for_condition':
        return <Clock className="h-6 w-6" />;
      case 'wait_for_webhook':
        return <Webhook className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  const getWaitTypeLabel = (type: WaitTriggerType) => {
    const labels = {
      time_delay: 'Tiempo',
      wait_for_event: 'Evento',
      wait_for_condition: 'Condición',
      wait_for_webhook: 'Webhook'
    };
    return labels[type];
  };

  const getWaitDescription = () => {
    switch (waitType) {
      case 'time_delay':
        return config.time_delay
          ? `${config.time_delay.amount} ${config.time_delay.unit}`
          : 'Sin configurar';
      case 'wait_for_event':
        return config.wait_for_event?.eventName || 'Sin evento';
      case 'wait_for_condition':
        return config.wait_for_condition?.conditions?.length
          ? `${config.wait_for_condition.conditions.length} condición(es)`
          : 'Sin condiciones';
      case 'wait_for_webhook':
        return config.wait_for_webhook?.webhookUrl ? 'URL configurada' : 'Sin URL';
      default:
        return 'Configurar';
    }
  };

  const renderConfigForm = () => {
    switch (waitType) {
      case 'time_delay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={config.time_delay?.amount || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    time_delay: {
                      ...config.time_delay,
                      amount: parseInt(e.target.value) || 0,
                      unit: config.time_delay?.unit || 'minutes'
                    }
                  })}
                  placeholder="Ej: 30"
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Select
                  value={config.time_delay?.unit || 'minutes'}
                  onValueChange={(value: 'minutes' | 'hours' | 'days') => setConfig({
                    ...config,
                    time_delay: {
                      ...config.time_delay,
                      amount: config.time_delay?.amount || 0,
                      unit: value
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
            </div>
          </div>
        );

      case 'wait_for_event':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nombre del Evento</Label>
              <Input
                value={config.wait_for_event?.eventName || ''}
                onChange={(e) => setConfig({
                  ...config,
                  wait_for_event: {
                    ...config.wait_for_event,
                    eventName: e.target.value
                  }
                })}
                placeholder="Ej: user_clicked_email"
              />
            </div>

            <div className="space-y-2">
              <Label>Timeout (opcional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={config.wait_for_event?.timeout?.amount || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    wait_for_event: {
                      ...config.wait_for_event,
                      eventName: config.wait_for_event?.eventName || '',
                      timeout: {
                        amount: parseInt(e.target.value) || 0,
                        unit: config.wait_for_event?.timeout?.unit || 'hours'
                      }
                    }
                  })}
                  placeholder="24"
                />
                <Select
                  value={config.wait_for_event?.timeout?.unit || 'hours'}
                  onValueChange={(value: 'minutes' | 'hours' | 'days') => setConfig({
                    ...config,
                    wait_for_event: {
                      ...config.wait_for_event,
                      eventName: config.wait_for_event?.eventName || '',
                      timeout: {
                        amount: config.wait_for_event?.timeout?.amount || 24,
                        unit: value
                      }
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
            </div>
          </div>
        );

      case 'wait_for_webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL del Webhook</Label>
              <Input
                value={config.wait_for_webhook?.webhookUrl || ''}
                onChange={(e) => setConfig({
                  ...config,
                  wait_for_webhook: {
                    ...config.wait_for_webhook,
                    webhookUrl: e.target.value
                  }
                })}
                placeholder="https://api.ejemplo.com/webhook"
              />
            </div>

            <div>
              <Label>Datos Esperados (JSON)</Label>
              <Textarea
                value={JSON.stringify(config.wait_for_webhook?.expectedData || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setConfig({
                      ...config,
                      wait_for_webhook: {
                        ...config.wait_for_webhook,
                        webhookUrl: config.wait_for_webhook?.webhookUrl || '',
                        expectedData: parsed
                      }
                    });
                  } catch {}
                }}
                placeholder='{"status": "completed"}'
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return <div>Selecciona un tipo de espera</div>;
    }
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
          bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: '120px', height: '80px' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        <div className="p-3 h-full flex flex-col items-center justify-center">
          <div className="text-purple-600 dark:text-purple-400 mb-1">
            {getWaitTypeIcon(waitType)}
          </div>
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300 text-center">
            {getWaitTypeLabel(waitType)}
          </span>
          <div className="text-xs text-purple-600 dark:text-purple-400 text-center mt-1 truncate w-full">
            {getWaitDescription()}
          </div>
        </div>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurar Espera
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tipo de Espera</Label>
              <Select
                value={waitType}
                onValueChange={(value: WaitTriggerType) => setWaitType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_delay">Esperar Tiempo</SelectItem>
                  <SelectItem value="wait_for_event">Esperar Evento</SelectItem>
                  <SelectItem value="wait_for_condition">Esperar Condición</SelectItem>
                  <SelectItem value="wait_for_webhook">Esperar Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderConfigForm()}

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

WaitNode.displayName = 'WaitNode';

export { WaitNode };