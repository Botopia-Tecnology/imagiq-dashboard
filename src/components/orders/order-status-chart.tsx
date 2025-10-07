"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Order } from "@/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface OrderStatusChartProps {
  orders: Order[]
}

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
  // Calcular distribución de estados
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
  }

  // Datos para el gráfico de barras - agrupando estados similares
  const barData = [
    {
      name: 'Pendientes',
      value: statusCounts.pending,
      color: 'hsl(var(--chart-1))',
      icon: Clock,
    },
    {
      name: 'En Proceso',
      value: statusCounts.confirmed + statusCounts.processing,
      color: 'hsl(var(--chart-2))',
      icon: Package,
    },
    {
      name: 'Enviadas',
      value: statusCounts.shipped,
      color: 'hsl(var(--chart-3))',
      icon: Truck,
    },
    {
      name: 'Entregadas',
      value: statusCounts.delivered,
      color: 'hsl(var(--chart-4))',
      icon: CheckCircle,
    },
    {
      name: 'Canceladas',
      value: statusCounts.cancelled + statusCounts.refunded,
      color: 'hsl(var(--chart-5))',
      icon: XCircle,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{payload[0].payload.name}</span>
              <span className="text-sm font-bold">{payload[0].value}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {((payload[0].value / orders.length) * 100).toFixed(1)}% del total
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Estados</CardTitle>
        <CardDescription>Vista general de todas las órdenes por estado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Leyenda con iconos */}
          <div className="grid grid-cols-2 gap-2">
            {barData.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0">{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
