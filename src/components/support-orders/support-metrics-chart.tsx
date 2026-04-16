"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  SupportStatusDistribution,
  SupportPaymentDistribution,
} from "@/types/support-orders";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SupportMetricsChartProps {
  statusDistribution: SupportStatusDistribution[];
  paymentMethodDistribution: SupportPaymentDistribution[];
  isLoading?: boolean;
}

const statusConfig: Record<
  string,
  { color: string; label: string; icon: LucideIcon }
> = {
  APPROVED: {
    color: "#22c55e",
    label: "Aprobados",
    icon: CheckCircle,
  },
  PENDING: {
    color: "#f59e0b",
    label: "Pendientes",
    icon: Clock,
  },
  REJECTED: {
    color: "#ef4444",
    label: "Rechazados",
    icon: XCircle,
  },
};

const paymentMethodColors: Record<string, string> = {
  Tarjeta: "#6366f1",
  PSE: "#0ea5e9",
  Otro: "#8b5cf6",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function StatusTooltip({ active, payload, total }: any) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    const percentage =
      total > 0 ? ((data.cantidad / total) * 100).toFixed(1) : 0;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{data.label}</span>
            <span className="text-sm font-bold">{data.cantidad}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {percentage}% del total
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function PaymentTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{data.medio_pago}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Cantidad: {data.cantidad}
          </div>
          <div className="text-xs text-muted-foreground">
            Ingresos: {formatCurrency(data.total)}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ChartSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-3 w-56 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SupportMetricsChart({
  statusDistribution,
  paymentMethodDistribution,
  isLoading,
}: SupportMetricsChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const statusData = statusDistribution.map((item) => ({
    ...item,
    label: statusConfig[item.estado_pago]?.label || item.estado_pago,
    color: statusConfig[item.estado_pago]?.color || "#6b7280",
  }));

  const total = statusData.reduce((sum, item) => sum + item.cantidad, 0);

  const paymentData = paymentMethodDistribution.map((item) => ({
    ...item,
    color: paymentMethodColors[item.medio_pago] || "#6b7280",
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de Pagos</CardTitle>
          <CardDescription>Distribución por estado de pago</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Sin datos disponibles
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="cantidad"
                    nameKey="label"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip total={total} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4">
                {statusData.map((item) => {
                  const config = statusConfig[item.estado_pago];
                  const Icon = config?.icon || Clock;
                  return (
                    <div
                      key={item.estado_pago}
                      className="flex items-center gap-1.5"
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.label}: {item.cantidad}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribución por medio de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medios de Pago</CardTitle>
          <CardDescription>
            Cantidad e ingresos por medio de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Sin datos disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="medio_pago"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<PaymentTooltip />} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
