'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  Trash2,
  Mail,
  MessageSquare,
  Smartphone,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface BillingAlert {
  id: string;
  name: string;
  type: 'budget' | 'cost-anomaly' | 'usage-spike' | 'forecast' | 'threshold';
  service: string;
  condition: string;
  threshold: number;
  isActive: boolean;
  notifications: ('email' | 'sms' | 'slack' | 'webhook')[];
  frequency: 'immediate' | 'daily' | 'weekly';
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
}

const mockAlerts: BillingAlert[] = [
  {
    id: '1',
    name: 'AWS Budget Exceeded',
    type: 'budget',
    service: 'AWS',
    condition: 'monthly_spend_exceeds',
    threshold: 1500,
    isActive: true,
    notifications: ['email', 'slack'],
    frequency: 'immediate',
    lastTriggered: new Date('2024-12-01'),
    triggerCount: 3,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'OpenAI Usage Spike',
    type: 'usage-spike',
    service: 'OpenAI',
    condition: 'usage_increase_percentage',
    threshold: 50,
    isActive: true,
    notifications: ['email'],
    frequency: 'immediate',
    lastTriggered: new Date('2024-11-28'),
    triggerCount: 1,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Monthly Forecast Alert',
    type: 'forecast',
    service: 'All',
    condition: 'monthly_forecast_exceeds',
    threshold: 3200,
    isActive: true,
    notifications: ['email', 'sms'],
    frequency: 'weekly',
    triggerCount: 0,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Cost Anomaly Detection',
    type: 'cost-anomaly',
    service: 'All',
    condition: 'cost_anomaly_detected',
    threshold: 0, // No threshold for anomaly detection
    isActive: false,
    notifications: ['email', 'slack'],
    frequency: 'immediate',
    triggerCount: 5,
    createdAt: new Date('2024-01-01')
  }
];

export function BillingAlerts() {
  const [alerts, setAlerts] = useState<BillingAlert[]>(mockAlerts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'budget' as const,
    service: '',
    condition: '',
    threshold: 0,
    notifications: [] as ('email' | 'sms' | 'slack' | 'webhook')[],
    frequency: 'immediate' as const
  });

  const getAlertTypeIcon = (type: string) => {
    const icons = {
      'budget': <DollarSign className="h-4 w-4" />,
      'cost-anomaly': <AlertTriangle className="h-4 w-4" />,
      'usage-spike': <TrendingUp className="h-4 w-4" />,
      'forecast': <Target className="h-4 w-4" />,
      'threshold': <Zap className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Bell className="h-4 w-4" />;
  };

  const getAlertTypeLabel = (type: string) => {
    const labels = {
      'budget': 'Presupuesto',
      'cost-anomaly': 'Anomalía de Costo',
      'usage-spike': 'Pico de Uso',
      'forecast': 'Predicción',
      'threshold': 'Umbral'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAlertTypeColor = (type: string) => {
    const colors = {
      'budget': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      'cost-anomaly': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'usage-spike': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      'forecast': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'threshold': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      'email': <Mail className="h-3 w-3" />,
      'sms': <Smartphone className="h-3 w-3" />,
      'slack': <MessageSquare className="h-3 w-3" />,
      'webhook': <Zap className="h-3 w-3" />
    };
    return icons[type as keyof typeof icons];
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const createAlert = () => {
    const alert: BillingAlert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      triggerCount: 0,
      createdAt: new Date()
    };
    setAlerts([...alerts, alert]);
    setIsCreateDialogOpen(false);
    setNewAlert({
      name: '',
      type: 'budget',
      service: '',
      condition: '',
      threshold: 0,
      notifications: [],
      frequency: 'immediate'
    });
  };

  const activeAlerts = alerts.filter(alert => alert.isActive);
  const triggeredAlerts = alerts.filter(alert => alert.triggerCount > 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">
              de {alerts.length} configuradas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Disparadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{triggeredAlerts.length}</div>
            <div className="text-xs text-muted-foreground">
              En los últimos 30 días
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ahorro Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$2,340</div>
            <div className="text-xs text-muted-foreground">
              Por detección temprana
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&lt; 5min</div>
            <div className="text-xs text-muted-foreground">
              Promedio de notificación
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Notificaciones disparadas en los últimos días
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {triggeredAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{alert.name}</strong> - {alert.service}
                      <div className="text-xs text-muted-foreground mt-1">
                        Disparada {alert.lastTriggered?.toLocaleDateString()} ({alert.triggerCount} veces)
                      </div>
                    </div>
                    <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                      {getAlertTypeLabel(alert.type)}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configuración de Alertas</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Alerta</DialogTitle>
                  <DialogDescription>
                    Configura una alerta para monitorear costos y uso de servicios
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-name">Nombre de la Alerta</Label>
                      <Input
                        id="alert-name"
                        placeholder="Ej: AWS Budget Alert"
                        value={newAlert.name}
                        onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-type">Tipo de Alerta</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value: any) => setNewAlert({...newAlert, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Presupuesto</SelectItem>
                          <SelectItem value="cost-anomaly">Anomalía de Costo</SelectItem>
                          <SelectItem value="usage-spike">Pico de Uso</SelectItem>
                          <SelectItem value="forecast">Predicción</SelectItem>
                          <SelectItem value="threshold">Umbral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-service">Servicio</Label>
                      <Select
                        value={newAlert.service}
                        onValueChange={(value) => setNewAlert({...newAlert, service: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">Todos los servicios</SelectItem>
                          <SelectItem value="AWS">AWS</SelectItem>
                          <SelectItem value="OpenAI">OpenAI API</SelectItem>
                          <SelectItem value="Epayco">Epayco</SelectItem>
                          <SelectItem value="MongoDB">MongoDB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-threshold">Umbral ($)</Label>
                      <Input
                        id="alert-threshold"
                        type="number"
                        placeholder="1000"
                        value={newAlert.threshold}
                        onChange={(e) => setNewAlert({...newAlert, threshold: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Canales de Notificación</Label>
                    <div className="flex gap-4">
                      {['email', 'sms', 'slack', 'webhook'].map((channel) => (
                        <label key={channel} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newAlert.notifications.includes(channel as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAlert({
                                  ...newAlert,
                                  notifications: [...newAlert.notifications, channel as any]
                                });
                              } else {
                                setNewAlert({
                                  ...newAlert,
                                  notifications: newAlert.notifications.filter(n => n !== channel)
                                });
                              }
                            }}
                          />
                          <span className="capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createAlert}>
                      Crear Alerta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{alert.name}</h3>
                        <Badge variant="secondary" className={getAlertTypeColor(alert.type)}>
                          {getAlertTypeLabel(alert.type)}
                        </Badge>
                        <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                          {alert.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {alert.service} • Umbral: ${alert.threshold.toLocaleString()} •
                        Frecuencia: {alert.frequency === 'immediate' ? 'Inmediata' :
                                    alert.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Creada: {alert.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BellRing className="h-3 w-3" />
                          <span>{alert.triggerCount} disparos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {alert.notifications.map((notification, index) => (
                            <span key={index} className="inline-flex">
                              {getNotificationIcon(notification)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}