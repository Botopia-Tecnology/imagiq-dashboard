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
import { Settings, Trash2, ShoppingCart, Eye, Heart, FileText, User, Target, DollarSign } from 'lucide-react';
import { TriggerNode as TriggerNodeType, TriggerConfig } from '@/types/event-driven-campaigns';
import { BrandIcon } from '@/components/icons/BrandIcon';

interface TriggerNodeData {
  triggerType: string;
  config?: TriggerConfig;
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

// Icon component helper to render both BrandIcon and Lucide icons
const NodeIcon = ({ icon, size = 16, className = "" }: {
  icon: { type: 'brand' | 'lucide', name: string } | string,
  size?: number,
  className?: string
}) => {
  if (typeof icon === 'string') {
    // Legacy support for emoji icons
    return <span className={`text-lg ${className}`}>{icon}</span>;
  }

  if (icon.type === 'brand') {
    return <BrandIcon brand={icon.name} size={size} className={className} />;
  }

  // Lucide icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    ShoppingCart,
    Eye,
    Heart,
    FileText,
    User,
    Target,
    DollarSign,
    Settings
  };

  const IconComponent = iconMap[icon.name];
  if (!IconComponent) {
    return <span className={className}>?</span>;
  }

  return <IconComponent size={size} className={className} />;
};

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<TriggerConfig>(data.config || {});

  const getTriggerColor = (triggerType: string) => {
    switch (triggerType) {
      case 'abandoned_cart':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
      case 'product_view':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'add_to_favorites':
        return 'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300';
      case 'page_view':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'user_registration':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
      case 'purchase_event':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300';
      case 'form_submission':
        return 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const renderConfigForm = () => {
    switch (data.triggerType) {
      case 'abandoned_cart':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeThreshold">Tiempo límite (minutos)</Label>
              <Input
                id="timeThreshold"
                type="number"
                placeholder="30"
                value={config.abandoned_cart?.timeThreshold || ''}
                onChange={(e) => setConfig({
                  ...config,
                  abandoned_cart: {
                    ...config.abandoned_cart,
                    timeThreshold: parseInt(e.target.value) || 30
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="minCartValue">Valor mínimo del carrito (opcional)</Label>
              <Input
                id="minCartValue"
                type="number"
                placeholder="50"
                value={config.abandoned_cart?.minCartValue || ''}
                onChange={(e) => setConfig({
                  ...config,
                  abandoned_cart: {
                    timeThreshold: config.abandoned_cart?.timeThreshold || 30,
                    minCartValue: parseFloat(e.target.value) || undefined
                  }
                })}
              />
            </div>
          </div>
        );

      case 'product_view':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="viewDuration">Duración mínima de vista (segundos)</Label>
              <Input
                id="viewDuration"
                type="number"
                placeholder="10"
                value={config.product_view?.viewDuration || ''}
                onChange={(e) => setConfig({
                  ...config,
                  product_view: {
                    ...config.product_view,
                    viewDuration: parseInt(e.target.value) || 10
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="categories">Categorías específicas (separadas por coma)</Label>
              <Input
                id="categories"
                placeholder="smartphones, laptops"
                value={config.product_view?.categories?.join(', ') || ''}
                onChange={(e) => setConfig({
                  ...config,
                  product_view: {
                    ...config.product_view,
                    categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  }
                })}
              />
            </div>
          </div>
        );

      case 'page_view':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageUrls">URLs de páginas (separadas por coma)</Label>
              <Input
                id="pageUrls"
                placeholder="/productos, /ofertas"
                value={config.page_view?.pageUrls?.join(', ') || ''}
                onChange={(e) => setConfig({
                  ...config,
                  page_view: {
                    ...config.page_view,
                    pageUrls: e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="timeOnPage">Tiempo mínimo en página (segundos)</Label>
              <Input
                id="timeOnPage"
                type="number"
                placeholder="30"
                value={config.page_view?.timeOnPage || ''}
                onChange={(e) => setConfig({
                  ...config,
                  page_view: {
                    pageUrls: config.page_view?.pageUrls || [],
                    timeOnPage: parseInt(e.target.value) || undefined
                  }
                })}
              />
            </div>
          </div>
        );

      case 'purchase_event':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="minOrderValue">Valor mínimo de orden</Label>
              <Input
                id="minOrderValue"
                type="number"
                placeholder="100"
                value={config.purchase_event?.minOrderValue || ''}
                onChange={(e) => setConfig({
                  ...config,
                  purchase_event: {
                    ...config.purchase_event,
                    minOrderValue: parseFloat(e.target.value) || undefined
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxOrderValue">Valor máximo de orden</Label>
              <Input
                id="maxOrderValue"
                type="number"
                placeholder="1000"
                value={config.purchase_event?.maxOrderValue || ''}
                onChange={(e) => setConfig({
                  ...config,
                  purchase_event: {
                    ...config.purchase_event,
                    maxOrderValue: parseFloat(e.target.value) || undefined
                  }
                })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground">
            No hay configuraciones disponibles para este trigger.
          </div>
        );
    }
  };

  return (
    <>
      <Card className={`w-56 ${getTriggerColor(data.triggerType)} ${selected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <NodeIcon icon={data.icon} size={14} />
              <span className="font-medium text-xs uppercase tracking-wide">TRIGGER</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar {data.label}</DialogTitle>
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
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-center">
            <h3 className="font-medium text-xs mb-1">{data.label}</h3>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              Evento Inicial
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Output handle - triggers can only have outputs */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </>
  );
});

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;