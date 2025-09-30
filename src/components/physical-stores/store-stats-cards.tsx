"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoreStats } from "@/types/physical-stores";
import {
  Store,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface StoreStatsCardsProps {
  stats: StoreStats;
  storeName: string;
}

export function StoreStatsCards({ stats, storeName }: StoreStatsCardsProps) {
  const completionRate = stats.totalOrders > 0
    ? ((stats.totalOrders - stats.expiredOrders) / stats.totalOrders * 100)
    : 0;

  const todayPerformance = stats.completedToday > 10 ? 'excellent' :
                          stats.completedToday > 5 ? 'good' : 'needs-attention';

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-orange-600 dark:text-orange-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{storeName}</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Orders Ready for Pickup */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listas para Recoger</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.readyOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} preparándose
            </p>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(todayPerformance)}`}>
              {stats.completedToday}
            </div>
            <Badge
              variant={todayPerformance === 'excellent' ? 'default' :
                      todayPerformance === 'good' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {todayPerformance === 'excellent' ? 'Excelente' :
               todayPerformance === 'good' ? 'Buena' : 'Necesita atención'}
            </Badge>
          </CardContent>
        </Card>

        {/* Average Pickup Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averagePickupTime.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">
              tiempo de recogida
            </p>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.customerSatisfaction.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              de 5.0 estrellas
            </p>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resumen de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Órdenes Totales</div>
                <div className="text-lg font-semibold">{stats.totalOrders}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Tasa de Conversión</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {stats.conversionRate.toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Tasa de Finalización</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {completionRate.toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1 flex flex-col">
                <div className="text-sm text-muted-foreground">Órdenes Expiradas</div>
                <div className="flex items-center gap-1">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {stats.expiredOrders}
                  </div>
                  {stats.expiredOrders > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}