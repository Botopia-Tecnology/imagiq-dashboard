'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { FlowNode, FlowEdge, EventDrivenCampaign } from '@/types/event-driven-campaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Save,
  Eye,
  Trash2,
  Plus,
  Zap,
  Filter,
  Clock,
  MessageSquare,
  GitBranch,
  Timer,
  RotateCcw,
  ShoppingCart,
  Heart,
  FileText,
  User,
  Target,
  DollarSign,
  Globe,
  Smartphone,
  Monitor,
  ActivitySquare,
  Link,
  RotateCcw as Refresh,
  Settings
} from 'lucide-react';

// Import custom node components
import TriggerNode from './nodes/TriggerNode';
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';
import DelayNode from './nodes/DelayNode';
import { IfNode } from './nodes/IfNode';
import { WaitNode } from './nodes/WaitNode';
import { BrandIcon } from '@/components/icons/BrandIcon';

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
    Globe,
    Smartphone,
    Monitor,
    Timer,
    GitBranch,
    ActivitySquare,
    Link,
    Refresh,
    Settings
  };

  const IconComponent = iconMap[icon.name];
  if (!IconComponent) {
    return <span className={className}>?</span>;
  }

  return <IconComponent size={size} className={className} />;
};

// Node types mapping
const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
  if: IfNode,
  wait: WaitNode,
};

// Sidebar node templates
const nodeTemplates = [
  {
    type: 'trigger',
    category: 'Triggers',
    items: [
      { id: 'abandoned_cart', label: 'Carrito Abandonado', icon: { type: 'lucide' as const, name: 'ShoppingCart' }, color: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
      { id: 'product_view', label: 'Ver Producto', icon: { type: 'lucide' as const, name: 'Eye' }, color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
      { id: 'add_to_favorites', label: 'Agregar Favoritos', icon: { type: 'lucide' as const, name: 'Heart' }, color: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
      { id: 'page_view', label: 'Ver Página', icon: { type: 'lucide' as const, name: 'FileText' }, color: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
      { id: 'user_registration', label: 'Registro', icon: { type: 'lucide' as const, name: 'User' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    ]
  },
  {
    type: 'condition',
    category: 'Condiciones',
    items: [
      { id: 'user_segment', label: 'Segmento Usuario', icon: { type: 'lucide' as const, name: 'Target' }, color: 'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
      { id: 'cart_value', label: 'Valor Carrito', icon: { type: 'lucide' as const, name: 'DollarSign' }, color: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
      { id: 'geographic_location', label: 'Ubicación', icon: { type: 'lucide' as const, name: 'Globe' }, color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
      { id: 'device_type', label: 'Tipo Dispositivo', icon: { type: 'lucide' as const, name: 'Smartphone' }, color: 'bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800' },
    ]
  },
  {
    type: 'action',
    category: 'Acciones',
    items: [
      { id: 'email', label: 'Email', icon: { type: 'brand' as const, name: 'gmail' }, color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
      { id: 'sms', label: 'SMS', icon: { type: 'lucide' as const, name: 'MessageSquare' }, color: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
      { id: 'whatsapp', label: 'WhatsApp', icon: { type: 'brand' as const, name: 'whatsapp' }, color: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
      { id: 'inweb', label: 'In-Web', icon: { type: 'lucide' as const, name: 'Monitor' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    ]
  },
  {
    type: 'delay',
    category: 'Esperas',
    items: [
      { id: 'time_delay', label: 'Esperar', icon: { type: 'lucide' as const, name: 'Timer' }, color: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    ]
  },
  {
    type: 'if',
    category: 'Lógica',
    items: [
      { id: 'conditional', label: 'IF Condicional', icon: { type: 'lucide' as const, name: 'GitBranch' }, color: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    ]
  },
  {
    type: 'wait',
    category: 'Esperas Avanzadas',
    items: [
      { id: 'wait_time', label: 'Esperar Tiempo', icon: { type: 'lucide' as const, name: 'Timer' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
      { id: 'wait_event', label: 'Esperar Evento', icon: { type: 'lucide' as const, name: 'ActivitySquare' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
      { id: 'wait_condition', label: 'Esperar Condición', icon: { type: 'lucide' as const, name: 'Refresh' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
      { id: 'wait_webhook', label: 'Esperar Webhook', icon: { type: 'lucide' as const, name: 'Link' }, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    ]
  }
];

interface EventCampaignCanvasProps {
  campaign?: EventDrivenCampaign;
  onSave?: (campaign: EventDrivenCampaign) => void;
  onPreview?: (campaign: EventDrivenCampaign) => void;
  onStatusChange?: (campaignId: string, status: 'active' | 'paused') => void;
}

export function EventCampaignCanvas({
  campaign,
  onSave,
  onPreview,
  onStatusChange
}: EventCampaignCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(campaign?.nodes || [] as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(campaign?.edges || [] as any);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle drag over for drop functionality
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop of new nodes onto canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const subtype = event.dataTransfer.getData('application/reactflow-subtype');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let nodeData: any = {
        label: getNodeLabel(type, subtype),
        icon: getNodeIcon(type, subtype),
      };

      // Set specific data based on node type
      switch (type) {
        case 'trigger':
          nodeData.triggerType = subtype;
          break;
        case 'condition':
          nodeData.conditions = [];
          nodeData.operator = 'AND';
          break;
        case 'action':
          nodeData.channel = subtype;
          nodeData.config = {};
          break;
        case 'delay':
          nodeData.delayAmount = 1;
          nodeData.delayUnit = 'hours';
          break;
        case 'if':
          nodeData.conditions = [];
          nodeData.operator = 'AND';
          nodeData.trueOutputs = [];
          nodeData.falseOutputs = [];
          break;
        case 'wait':
          nodeData.waitType = subtype;
          nodeData.config = {};
          break;
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle node drag start
  const onDragStart = (event: React.DragEvent, nodeType: string, subtype: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-subtype', subtype);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get node label based on type and subtype
  const getNodeLabel = (type: string, subtype: string) => {
    const template = nodeTemplates.find(t => t.type === type);
    const item = template?.items.find(i => i.id === subtype);
    return item?.label || subtype;
  };

  // Get node icon based on type and subtype
  const getNodeIcon = (type: string, subtype: string) => {
    const template = nodeTemplates.find(t => t.type === type);
    const item = template?.items.find(i => i.id === subtype);
    return item?.icon || { type: 'lucide', name: 'Settings' };
  };

  // Save campaign
  const handleSave = () => {
    if (!onSave) return;

    const updatedCampaign: EventDrivenCampaign = {
      id: campaign?.id || `campaign-${Date.now()}`,
      name: campaign?.name || 'Nueva Campaña',
      status: campaign?.status || 'draft',
      nodes: nodes as FlowNode[],
      edges: edges as FlowEdge[],
      createdAt: campaign?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: campaign?.createdBy || 'current-user',
    };

    onSave(updatedCampaign);
  };

  // Toggle campaign status
  const handleStatusToggle = () => {
    if (!campaign || !onStatusChange) return;

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onStatusChange(campaign.id, newStatus);
  };

  // Auto layout function
  const handleAutoLayout = useCallback(() => {
    if (!reactFlowInstance) return;

    const layoutedNodes = nodes.map((node, index) => {
      // Simple grid layout
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...node,
        position: {
          x: col * 180, // Spacing between nodes horizontally
          y: row * 120, // Spacing between nodes vertically
        },
      };
    });

    setNodes(layoutedNodes);

    // Fit view after layout
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 100);
  }, [nodes, setNodes, reactFlowInstance]);

  return (
    <div className="h-screen flex">
      {/* Sidebar with node templates */}
      <Card className="w-80 h-full rounded-none border-r">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Elementos de Campaña
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-6 overflow-y-auto">
          {nodeTemplates.map((template) => (
            <div key={template.type}>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                {template.category}
              </h3>
              <div className="space-y-2">
                {template.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, template.type, item.id)}
                    className={`p-3 rounded-lg border cursor-move hover:shadow-md transition-all ${item.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <NodeIcon icon={item.icon} size={18} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Card className="rounded-none border-b">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">
                  {campaign?.name || 'Nueva Campaña Basada en Eventos'}
                </h1>
                {campaign?.status && (
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? 'Activa' :
                     campaign.status === 'paused' ? 'Pausada' :
                     campaign.status === 'draft' ? 'Borrador' : 'Completada'}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onPreview && campaign && onPreview(campaign)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" size="sm" onClick={handleAutoLayout}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Auto Layout
                </Button>
                {campaign && (
                  <Button
                    variant={campaign.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={handleStatusToggle}
                  >
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50 dark:bg-slate-950"
          >
            <Controls />
            <MiniMap />
            <Background variant={"dots" as any} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

// Wrap component with ReactFlowProvider
export default function EventCampaignCanvasProvider(props: EventCampaignCanvasProps) {
  return (
    <ReactFlowProvider>
      <EventCampaignCanvas {...props} />
    </ReactFlowProvider>
  );
}