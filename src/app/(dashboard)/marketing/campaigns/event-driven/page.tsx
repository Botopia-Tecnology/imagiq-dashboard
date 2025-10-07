'use client';

import React, { useState } from 'react';
import EventCampaignCanvas from '@/components/campaigns/event-driven/EventCampaignCanvas';
import { EventDrivenCampaign } from '@/types/event-driven-campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Plus,
  Zap,
  Play,
  Pause,
  Eye,
  BarChart3,
  Settings,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// Mock data for existing campaigns
const mockEventCampaigns: EventDrivenCampaign[] = [
  {
    id: 'event-campaign-1',
    name: 'Recuperación de Carrito Abandonado',
    description: 'Secuencia automática para usuarios que abandonan el carrito',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'admin',
    metrics: {
      triggered: 1250,
      sent: 1180,
      delivered: 1156,
      opened: 463,
      clicked: 139,
      converted: 42,
      revenue: 8450.00,
      lastUpdated: new Date()
    }
  },
  {
    id: 'event-campaign-2',
    name: 'Bienvenida Nuevos Usuarios',
    description: 'Serie de mensajes de bienvenida para usuarios recién registrados',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'admin',
    metrics: {
      triggered: 890,
      sent: 890,
      delivered: 875,
      opened: 612,
      clicked: 245,
      converted: 78,
      revenue: 12350.00,
      lastUpdated: new Date()
    }
  },
  {
    id: 'event-campaign-3',
    name: 'Reactivación Vista de Producto',
    description: 'Recordatorio para usuarios que vieron productos sin comprar',
    status: 'paused',
    nodes: [],
    edges: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    metrics: {
      triggered: 2100,
      sent: 1980,
      delivered: 1920,
      opened: 576,
      clicked: 172,
      converted: 35,
      revenue: 5240.00,
      lastUpdated: new Date()
    }
  }
];

export default function EventDrivenCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EventDrivenCampaign[]>(mockEventCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<EventDrivenCampaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;

    const newCampaign: EventDrivenCampaign = {
      id: `event-campaign-${Date.now()}`,
      name: newCampaignName,
      description: newCampaignDescription,
      status: 'draft',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
    };

    setCampaigns([...campaigns, newCampaign]);
    setSelectedCampaign(newCampaign);
    setIsCreating(true);
    setIsNewCampaignDialogOpen(false);
    setNewCampaignName('');
    setNewCampaignDescription('');
  };

  const handleSaveCampaign = (campaign: EventDrivenCampaign) => {
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
    setSelectedCampaign(campaign);
  };

  const handleStatusChange = (campaignId: string, status: 'active' | 'paused') => {
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId ? { ...c, status, updatedAt: new Date() } : c
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
    }
  };

  const formatMetric = (value: number) => {
    return value.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const calculateConversionRate = (converted: number, triggered: number) => {
    return triggered > 0 ? ((converted / triggered) * 100).toFixed(1) : '0.0';
  };

  if (isCreating && selectedCampaign) {
    return (
      <EventCampaignCanvas
        campaign={selectedCampaign}
        onSave={handleSaveCampaign}
        onPreview={(campaign) => {
          console.log('Preview campaign:', campaign);
        }}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campañas
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              Campañas Basadas en Eventos
            </h1>
            <p className="text-muted-foreground">
              Automatiza comunicaciones basadas en el comportamiento del usuario
            </p>
          </div>
        </div>

        <Dialog open={isNewCampaignDialogOpen} onOpenChange={setIsNewCampaignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña Basada en Eventos</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <Label htmlFor="campaignName">Nombre de la Campaña</Label>
                <Input
                  id="campaignName"
                  placeholder="Ej: Recuperación de Carrito Abandonado"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="campaignDescription">Descripción (opcional)</Label>
                <Textarea
                  id="campaignDescription"
                  placeholder="Describe el objetivo de esta campaña..."
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewCampaignDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={!newCampaignName.trim()}>
                Crear Campaña
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length} campañas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Impactados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMetric(campaigns.reduce((total, c) => total + (c.metrics?.triggered || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalTriggered = campaigns.reduce((total, c) => total + (c.metrics?.triggered || 0), 0);
                const totalConverted = campaigns.reduce((total, c) => total + (c.metrics?.converted || 0), 0);
                return calculateConversionRate(totalConverted, totalTriggered);
              })()}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio global
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(campaigns.reduce((total, c) => total + (c.metrics?.revenue || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campañas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay campañas creadas</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera campaña basada en eventos para automatizar las comunicaciones
              </p>
              <Button onClick={() => setIsNewCampaignDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Campaña
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status === 'active' ? 'Activa' :
                             campaign.status === 'paused' ? 'Pausada' : 'Borrador'}
                          </Badge>
                        </div>
                        {campaign.description && (
                          <p className="text-muted-foreground mb-3">{campaign.description}</p>
                        )}

                        {campaign.metrics && (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Disparados</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.triggered)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Enviados</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.sent)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Entregados</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.delivered)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Abiertos</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.opened)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Clicks</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.clicked)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Conversiones</span>
                              <div className="font-medium">{formatMetric(campaign.metrics.converted)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue</span>
                              <div className="font-medium">{formatCurrency(campaign.metrics.revenue)}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsCreating(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('View analytics for:', campaign.id)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button
                          variant={campaign.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => {
                            const newStatus = campaign.status === 'active' ? 'paused' : 'active';
                            handleStatusChange(campaign.id, newStatus);
                          }}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}