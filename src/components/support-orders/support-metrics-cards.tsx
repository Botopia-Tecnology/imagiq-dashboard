"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { SupportOrderMetrics } from "@/types/support-orders";

interface SupportMetricsCardsProps {
  metrics: SupportOrderMetrics | null;
  isLoading?: boolean;
}

function MetricsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function SupportMetricsCards({
  metrics,
  isLoading,
}: SupportMetricsCardsProps) {
  if (isLoading || !metrics) {
    return <MetricsCardsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.total_tickets.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Tickets de servicio técnico
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ingresos Aprobados
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.total_ingresos)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total recaudado (aprobados)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.promedio_ticket)}
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio por ticket aprobado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.total_aprobados.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.total_tickets > 0
              ? `${((metrics.total_aprobados / metrics.total_tickets) * 100).toFixed(1)}% del total`
              : "Sin tickets"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.total_pendientes.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.total_tickets > 0
              ? `${((metrics.total_pendientes / metrics.total_tickets) * 100).toFixed(1)}% del total`
              : "Sin tickets"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.total_rechazados.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.total_tickets > 0
              ? `${((metrics.total_rechazados / metrics.total_tickets) * 100).toFixed(1)}% del total`
              : "Sin tickets"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
