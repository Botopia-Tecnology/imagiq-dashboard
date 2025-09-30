"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCards } from "@/components/warehouse/metrics-cards";
import { ActiveOrders } from "@/components/warehouse/active-orders";
import { OperatorsPanel } from "@/components/warehouse/operators-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricsService } from "@/services/warehouse/metrics.service";
import { OperatorService } from "@/services/warehouse/operator.service";
import { OrderService } from "@/services/warehouse/order.service";
import { mockOperators } from "@/lib/mock-data/warehouse-operators";
import { getRecentActivity, getCriticalAlerts } from "@/lib/mock-data/warehouse-metrics";
import { WarehouseMetrics, WarehouseOrder, OrderStatus } from "@/types/warehouse";
import {
  Warehouse,
  Activity,
  AlertTriangle,
  RefreshCw,
  Clock,
  Users,
  Package2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function BodegaPage() {
  const [metrics, setMetrics] = useState<WarehouseMetrics | null>(null);
  const [orders, setOrders] = useState<WarehouseOrder[]>([]);
  const [currentShift, setCurrentShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize services
  const operatorService = new OperatorService();
  const orderService = new OrderService();
  const metricsService = new MetricsService(operatorService, orderService);

  const recentActivity = getRecentActivity();
  const criticalAlerts = getCriticalAlerts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [metricsData, ordersData] = await Promise.all([
        metricsService.calculateRealtimeMetrics(),
        orderService.getOrdersInProgress()
      ]);

      setMetrics(metricsData);
      setOrders(ordersData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading warehouse data:', error);
      toast.error('Error al cargar datos de bodega');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignOperator = async (orderId: string, operatorId: string) => {
    try {
      await orderService.assignOperator(orderId, operatorId);
      toast.success('Operario asignado correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al asignar operario');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success('Estado actualizado correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const getCurrentHour = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  };

  useEffect(() => {
    setCurrentShift(getCurrentHour());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-8 w-8 text-blue-600" />
            Centro de Operaciones - Bodega
          </h1>
          <p className="text-muted-foreground">
            Gestión en tiempo real de picking, packing y envíos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Última actualización: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticas ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div>
                    <span className="font-medium">Stock crítico: {alert.sku}</span>
                    <div className="text-sm text-muted-foreground">
                      Solo {alert.currentStock} unidades (mínimo: {alert.minimumStock})
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      {metrics && <MetricsCards metrics={metrics} isLoading={isLoading} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActiveOrders
            orders={orders}
            onAssignOperator={handleAssignOperator}
            onUpdateStatus={handleUpdateStatus}
            operators={mockOperators.map(op => ({ id: op.id, name: op.name, role: op.role }))}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Shift Control */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Turno Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currentShift} onValueChange={(value) => setCurrentShift(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mañana (06:00 - 14:00)</SelectItem>
                  <SelectItem value="afternoon">Tarde (14:00 - 22:00)</SelectItem>
                  <SelectItem value="night">Noche (22:00 - 06:00)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Operators Panel */}
          <OperatorsPanel operators={mockOperators} currentShift={currentShift} />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <span>{activity.action}</span>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.time, { addSuffix: true, locale: es })}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}