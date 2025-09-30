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
import { Textarea } from '@/components/ui/textarea';
import { Settings, Trash2 } from 'lucide-react';
import { BrandIcon } from '@/components/icons/BrandIcon';
import { CommunicationChannelType, ActionConfig } from '@/types/event-driven-campaigns';

interface ActionNodeData {
  channel: CommunicationChannelType;
  config: ActionConfig;
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<ActionConfig>(data.config || {});

  const getChannelColor = (channel: CommunicationChannelType) => {
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

  const getChannelIcon = (channel: CommunicationChannelType) => {
    switch (channel) {
      case 'email':
        return '📧';
      case 'sms':
        return '💬';
      case 'whatsapp':
        return '📱';
      case 'inweb':
        return '🌐';
      default:
        return '📤';
    }
  };

  const renderConfigForm = () => {
    switch (data.channel) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailSubject">Asunto del Email</Label>
              <Input
                id="emailSubject"
                placeholder="¡No te olvides de tu carrito!"
                value={config.email?.subject || ''}
                onChange={(e) => setConfig({
                  ...config,
                  email: {
                    ...config.email,
                    subject: e.target.value,
                    templateId: config.email?.templateId || ''
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="emailTemplate">Template ID</Label>
              <Select
                value={config.email?.templateId || ''}
                onValueChange={(value) => setConfig({
                  ...config,
                  email: {
                    ...config.email,
                    templateId: value,
                    subject: config.email?.subject || ''
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abandoned-cart-1">Carrito Abandonado - Recordatorio</SelectItem>
                  <SelectItem value="abandoned-cart-2">Carrito Abandonado - Descuento</SelectItem>
                  <SelectItem value="product-view-1">Vista de Producto - Recomendación</SelectItem>
                  <SelectItem value="welcome-1">Bienvenida - Nuevo Usuario</SelectItem>
                  <SelectItem value="purchase-followup-1">Seguimiento Post-Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smsMessage">Mensaje SMS</Label>
              <Textarea
                id="smsMessage"
                placeholder="¡Hola! Tienes productos esperándote en tu carrito. Finaliza tu compra ahora."
                maxLength={160}
                value={config.sms?.message || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sms: {
                    ...config.sms,
                    message: e.target.value,
                    templateId: config.sms?.templateId || ''
                  }
                })}
              />
              <div className="text-xs text-muted-foreground">
                {(config.sms?.message || '').length}/160 caracteres
              </div>
            </div>
            <div>
              <Label htmlFor="smsTemplate">Template ID</Label>
              <Select
                value={config.sms?.templateId || ''}
                onValueChange={(value) => setConfig({
                  ...config,
                  sms: {
                    ...config.sms,
                    templateId: value,
                    message: config.sms?.message || ''
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms-cart-1">SMS - Carrito Abandonado</SelectItem>
                  <SelectItem value="sms-offer-1">SMS - Oferta Especial</SelectItem>
                  <SelectItem value="sms-reminder-1">SMS - Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsappMessage">Mensaje WhatsApp</Label>
              <Textarea
                id="whatsappMessage"
                placeholder="¡Hola! 👋 Vimos que estuviste mirando algunos productos increíbles. ¿Te ayudamos a finalizar tu compra?"
                value={config.whatsapp?.message || ''}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: {
                    ...config.whatsapp,
                    message: e.target.value,
                    templateId: config.whatsapp?.templateId || ''
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="whatsappMedia">URL de Media (opcional)</Label>
              <Input
                id="whatsappMedia"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={config.whatsapp?.mediaUrl || ''}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: {
                    ...config.whatsapp,
                    mediaUrl: e.target.value,
                    templateId: config.whatsapp?.templateId || '',
                    message: config.whatsapp?.message || ''
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="whatsappTemplate">Template ID</Label>
              <Select
                value={config.whatsapp?.templateId || ''}
                onValueChange={(value) => setConfig({
                  ...config,
                  whatsapp: {
                    ...config.whatsapp,
                    templateId: value,
                    message: config.whatsapp?.message || ''
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wa-cart-1">WhatsApp - Carrito Abandonado</SelectItem>
                  <SelectItem value="wa-support-1">WhatsApp - Soporte</SelectItem>
                  <SelectItem value="wa-promo-1">WhatsApp - Promoción</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'inweb':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="inwebType">Tipo de Notificación</Label>
              <Select
                value={config.inweb?.type || 'popup'}
                onValueChange={(value: 'popup' | 'banner' | 'notification') => setConfig({
                  ...config,
                  inweb: {
                    ...config.inweb,
                    type: value,
                    content: config.inweb?.content || ''
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popup">Popup Modal</SelectItem>
                  <SelectItem value="banner">Banner Superior</SelectItem>
                  <SelectItem value="notification">Notificación Toast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inwebContent">Contenido</Label>
              <Textarea
                id="inwebContent"
                placeholder="¡Obtén 10% de descuento en tu primera compra!"
                value={config.inweb?.content || ''}
                onChange={(e) => setConfig({
                  ...config,
                  inweb: {
                    ...config.inweb,
                    content: e.target.value,
                    type: config.inweb?.type || 'popup'
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="inwebPosition">Posición</Label>
              <Select
                value={config.inweb?.position || 'center'}
                onValueChange={(value: 'top' | 'bottom' | 'center') => setConfig({
                  ...config,
                  inweb: {
                    ...config.inweb,
                    position: value,
                    content: config.inweb?.content || '',
                    type: config.inweb?.type || 'popup'
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Superior</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="bottom">Inferior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inwebDuration">Duración (segundos)</Label>
              <Input
                id="inwebDuration"
                type="number"
                placeholder="5"
                value={config.inweb?.duration || ''}
                onChange={(e) => setConfig({
                  ...config,
                  inweb: {
                    ...config.inweb,
                    duration: parseInt(e.target.value) || 5,
                    content: config.inweb?.content || '',
                    type: config.inweb?.type || 'popup'
                  }
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
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
          ${getChannelColor(data.channel)}
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: '120px', height: '80px' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        <div className="p-3 h-full flex flex-col items-center justify-center">
          <BrandIcon brand={data.channel} size={24} className="mb-1" />
          <span className="text-xs font-medium text-center capitalize">
            {data.channel}
          </span>
        </div>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrandIcon brand={data.channel} size={20} />
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