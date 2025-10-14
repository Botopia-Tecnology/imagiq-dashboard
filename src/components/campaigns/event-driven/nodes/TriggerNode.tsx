'use client';

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Eye, Heart, FileText, User, DollarSign, Clock } from 'lucide-react';
import { EventTriggerType } from '@/types/event-driven-campaigns';

interface TriggerNodeData {
  config: {
    triggerType?: EventTriggerType;
    timeThreshold?: number;
    minCartValue?: number;
    viewDuration?: number;
    categories?: string[];
    pageUrls?: string[];
    timeOnPage?: number;
    minOrderValue?: number;
    maxOrderValue?: number;
    summary?: string;
  };
  label: string;
  icon: { type: 'brand' | 'lucide', name: string } | string;
}

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<TriggerNodeData['config']>(data.config || {});
  const [categoriesInput, setCategoriesInput] = useState('');
  const [pageUrlsInput, setPageUrlsInput] = useState('');

  // Inicializar los inputs cuando se abre el diálogo o cambia el config
  useEffect(() => {
    if (isConfigOpen) {
      setCategoriesInput(config.categories?.join(', ') || '');
      setPageUrlsInput(config.pageUrls?.join(', ') || '');
    }
  }, [isConfigOpen, config.categories, config.pageUrls]);

  const getTriggerColor = (triggerType?: EventTriggerType) => {
    if (!triggerType) {
      return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }

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
      case 'browse_abandonment':
        return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getTriggerIcon = (triggerType?: EventTriggerType) => {
    if (!triggerType) return null;

    switch (triggerType) {
      case 'abandoned_cart':
        return <ShoppingCart size={28} />;
      case 'product_view':
        return <Eye size={28} />;
      case 'add_to_favorites':
        return <Heart size={28} />;
      case 'page_view':
        return <FileText size={28} />;
      case 'user_registration':
        return <User size={28} />;
      case 'purchase_event':
        return <DollarSign size={28} />;
      case 'browse_abandonment':
        return <Eye size={28} />;
      case 'form_submission':
        return <FileText size={28} />;
      default:
        return null;
    }
  };

  const getTriggerLabel = (triggerType?: EventTriggerType) => {
    if (!triggerType) return '';

    const labels: Record<EventTriggerType, string> = {
      'abandoned_cart': 'Carrito Abandonado',
      'product_view': 'Vista de Producto',
      'add_to_favorites': 'Añadir a Favoritos',
      'browse_abandonment': 'Abandono de Navegación',
      'page_view': 'Vista de Página',
      'user_registration': 'Registro de Usuario',
      'purchase_event': 'Evento de Compra',
      'form_submission': 'Envío de Formulario',
    };

    return labels[triggerType] || triggerType;
  };

  const generateSummary = (triggerType: EventTriggerType, currentConfig: TriggerNodeData['config']): string => {
    switch (triggerType) {
      case 'abandoned_cart':
        return currentConfig.timeThreshold
          ? `Espera ${currentConfig.timeThreshold} min${currentConfig.minCartValue ? `, min $${currentConfig.minCartValue}` : ''}`
          : 'Sin configurar';
      case 'product_view':
        if (currentConfig.viewDuration || currentConfig.categories?.length) {
          const parts = [];
          if (currentConfig.viewDuration) parts.push(`${currentConfig.viewDuration}s`);
          if (currentConfig.categories?.length) {
            parts.push(currentConfig.categories.join(', '));
          }
          return parts.join(' • ');
        }
        return 'Sin configurar';
      case 'page_view':
        if (currentConfig.pageUrls?.length || currentConfig.timeOnPage) {
          const parts = [];
          if (currentConfig.pageUrls?.length) {
            parts.push(currentConfig.pageUrls.join(', '));
          }
          if (currentConfig.timeOnPage) {
            parts.push(`${currentConfig.timeOnPage}s`);
          }
          return parts.join(' • ');
        }
        return 'Sin configurar';
      case 'purchase_event':
        if (currentConfig.minOrderValue || currentConfig.maxOrderValue) {
          const parts = [];
          if (currentConfig.minOrderValue) parts.push(`Min $${currentConfig.minOrderValue}`);
          if (currentConfig.maxOrderValue) parts.push(`Max $${currentConfig.maxOrderValue}`);
          return parts.join(', ');
        }
        return 'Sin configurar';
      default:
        return 'Configurado';
    }
  };

  const renderConfigForm = () => {
    if (!config.triggerType) {
      return (
        <div className="text-center text-muted-foreground py-4">
          Primero selecciona un tipo de trigger
        </div>
      );
    }

    switch (config.triggerType) {
      case 'abandoned_cart':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="timeThreshold">Tiempo límite (minutos)</Label>
              <Input
                id="timeThreshold"
                type="number"
                placeholder="30"
                value={config.timeThreshold || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    timeThreshold: parseInt(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="minCartValue">Valor mínimo del carrito (opcional)</Label>
              <Input
                id="minCartValue"
                type="number"
                placeholder="50"
                value={config.minCartValue || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    minCartValue: parseFloat(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
          </div>
        );

      case 'product_view':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="viewDuration">Duración mínima de vista (segundos)</Label>
              <Input
                id="viewDuration"
                type="number"
                placeholder="10"
                value={config.viewDuration || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    viewDuration: parseInt(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="categories">Categorías específicas (separadas por coma)</Label>
              <Textarea
                id="categories"
                placeholder="smartphones, laptops, tablets"
                value={categoriesInput}
                rows={2}
                onChange={(e) => {
                  setCategoriesInput(e.target.value);
                }}
                onBlur={(e) => {
                  const newConfig = {
                    ...config,
                    categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
          </div>
        );

      case 'page_view':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="pageUrls">URLs de páginas (separadas por coma)</Label>
              <Textarea
                id="pageUrls"
                placeholder="/productos, /ofertas, /promociones"
                value={pageUrlsInput}
                rows={2}
                onChange={(e) => {
                  setPageUrlsInput(e.target.value);
                }}
                onBlur={(e) => {
                  const newConfig = {
                    ...config,
                    pageUrls: e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="timeOnPage">Tiempo mínimo en página (segundos)</Label>
              <Input
                id="timeOnPage"
                type="number"
                placeholder="30"
                value={config.timeOnPage || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    timeOnPage: parseInt(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
          </div>
        );

      case 'purchase_event':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="minOrderValue">Valor mínimo de orden</Label>
              <Input
                id="minOrderValue"
                type="number"
                placeholder="100"
                value={config.minOrderValue || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    minOrderValue: parseFloat(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="maxOrderValue">Valor máximo de orden</Label>
              <Input
                id="maxOrderValue"
                type="number"
                placeholder="1000"
                value={config.maxOrderValue || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    maxOrderValue: parseFloat(e.target.value) || undefined
                  };
                  newConfig.summary = generateSummary(config.triggerType!, newConfig);
                  setConfig(newConfig);
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            No hay configuraciones adicionales para este trigger.
          </div>
        );
    }
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
          ${getTriggerColor(config.triggerType)}
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: '160px', minHeight: '100px' }}
      >
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-blue-500 border-2 border-white dark:border-gray-800"
        />

        {config.triggerType ? (
          <div className="p-3 w-full flex flex-col items-center justify-center gap-1.5">
            {getTriggerIcon(config.triggerType)}
            <span className="text-sm font-medium text-center">
              {getTriggerLabel(config.triggerType)}
            </span>
            {config.summary && (
              <span className="text-xs text-center text-muted-foreground px-2 leading-tight">
                {config.summary}
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 w-full flex items-center justify-center">
            <span className="text-sm font-medium text-center text-gray-500">
              Trigger
            </span>
          </div>
        )}
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {config.triggerType && getTriggerIcon(config.triggerType)}
              Configurar {data.label}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="triggerType">Tipo de Trigger</Label>
                <Select
                  value={config.triggerType || ''}
                  onValueChange={(value: EventTriggerType) => {
                    const newConfig = {
                      triggerType: value,
                      summary: generateSummary(value, {})
                    };
                    setConfig(newConfig);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abandoned_cart">Carrito Abandonado</SelectItem>
                    <SelectItem value="product_view">Vista de Producto</SelectItem>
                    <SelectItem value="add_to_favorites">Añadir a Favoritos</SelectItem>
                    <SelectItem value="browse_abandonment">Abandono de Navegación</SelectItem>
                    <SelectItem value="page_view">Vista de Página</SelectItem>
                    <SelectItem value="user_registration">Registro de Usuario</SelectItem>
                    <SelectItem value="purchase_event">Evento de Compra</SelectItem>
                    <SelectItem value="form_submission">Envío de Formulario</SelectItem>
                    
                  </SelectContent>
                </Select>
              </div>

              {renderConfigForm()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;
