'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrandIcon } from '@/components/icons/BrandIcon';
import { CommunicationChannelType } from '@/types/event-driven-campaigns';

interface ActionNodeData {
  config: {
    campaignType?: CommunicationChannelType;
    templateId?: string;
    templateName?: string;
  };
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<{
    campaignType?: CommunicationChannelType;
    templateId?: string;
    templateName?: string;
  }>(data.config || {});

  // Plantillas de ejemplo - en el futuro será un llamado a API
  const mockTemplates = [
    { id: 'template-1', name: 'Bienvenida' },
    { id: 'template-2', name: 'Carrito Abandonado' },
    { id: 'template-3', name: 'Oferta Especial' },
    { id: 'template-4', name: 'Seguimiento Compra' },
    { id: 'template-5', name: 'Recuperación Cliente' },
  ];

  const getChannelColor = (channel?: CommunicationChannelType) => {
    if (!channel) {
      return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }

    switch (channel) {
      case 'email':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'sms':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'whatsapp':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'inweb':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const renderConfigForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="campaignType">Tipo de Campaña</Label>
          <Select
            value={config.campaignType || ''}
            onValueChange={(value: CommunicationChannelType) => setConfig({
              ...config,
              campaignType: value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de campaña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="inweb">InWeb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="templateId">Plantilla</Label>
          <Select
            value={config.templateId || ''}
            onValueChange={(value) => {
              const selectedTemplate = mockTemplates.find(t => t.id === value);
              setConfig({
                ...config,
                templateId: value,
                templateName: selectedTemplate?.name
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plantilla" />
            </SelectTrigger>
            <SelectContent>
              {mockTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-200 cursor-pointer flex
          ${selected
            ? 'border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${getChannelColor(config.campaignType)}
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: '160px', minHeight: '100px' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        {config.campaignType ? (
          <div className="p-3 w-full flex flex-col items-center justify-center gap-1.5">
            <span className="text-sm font-medium text-center capitalize">
              {config.campaignType}
            </span>
            {config.templateName && (
              <span className="text-xs text-center text-muted-foreground px-2 leading-tight">
                {config.templateName}
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 w-full flex flex-col items-center justify-center gap-1.5">
            <span className="text-sm font-medium text-center text-gray-500">
              Campaña
            </span>
          </div>
        )}
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {config.campaignType && <BrandIcon brand={config.campaignType} size={20} />}
              Configurar {data.label}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderConfigForm()}
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
    </>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;