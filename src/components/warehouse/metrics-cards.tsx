"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WarehouseMetrics } from "@/types/warehouse";
import {
  Package,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  Target,
  Zap,
  Activity
} from "lucide-react";

interface MetricsCardsProps {
  metrics: WarehouseMetrics;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading = false }: MetricsCardsProps) {
  const completionRate = metrics.ordersReceived > 0
    ? (metrics.ordersCompleted / metrics.ordersReceived) * 100
    : 0;

  const getPerformanceColor = (rate: number, threshold: number = 95) => {
    return rate >= threshold
      ? 'text-green-600 dark:text-green-400'
      : rate >= 85
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400';
  };

  const cards = [
    {
      title: "Órdenes Pendientes",
      value: metrics.ordersPending,
      icon: Package,
      description: `${metrics.ordersCompleted} completadas`,
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Tiempo Promedio",
      value: `${metrics.averagePickTime}m`,
      icon: Clock,
      description: "picking por orden",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Precisión",
      value: `${metrics.accuracyRate}%`,
      icon: Target,
      description: "tasa de precisión",
      color: getPerformanceColor(metrics.accuracyRate)
    },
    {
      title: "Unidades/Hora",
      value: metrics.unitsPerHour,
      icon: Zap,
      description: "rendimiento actual",
      color: getPerformanceColor(metrics.unitsPerHour, 75)
    },
    {
      title: "Operarios Activos",
      value: metrics.activeOperators,
      icon: Users,
      description: "en turno actual",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Entrega a Tiempo",
      value: `${metrics.onTimeDelivery}%`,
      icon: CheckCircle,
      description: "cumplimiento",
      color: getPerformanceColor(metrics.onTimeDelivery)
    },
    {
      title: "Tasa Completada",
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "órdenes del día",
      color: getPerformanceColor(completionRate, 90)
    },
    {
      title: "Hora Pico",
      value: metrics.peakHour,
      icon: Activity,
      description: "mayor actividad",
      color: "text-indigo-600 dark:text-indigo-400"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
            {card.title === "Órdenes Pendientes" && metrics.ordersPending > 20 && (
              <Badge variant="destructive" className="text-xs mt-1">
                Alta carga
              </Badge>
            )}
            {card.title === "Precisión" && metrics.accuracyRate >= 99 && (
              <Badge variant="default" className="text-xs mt-1">
                Excelente
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}