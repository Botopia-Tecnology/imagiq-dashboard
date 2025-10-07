"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react"
import { Order } from "@/types"

interface OrderStatsCardsProps {
  orders: Order[]
}

export function OrderStatsCards({ orders }: OrderStatsCardsProps) {
  // Calcular métricas
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
  const totalRevenue = activeOrders.reduce((sum, order) => sum + order.total, 0)
  const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const processingCount = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  // Calcular tasa de conversión (asumiendo que delivered/total es éxito)
  const conversionRate = orders.length > 0
    ? ((deliveredCount / orders.length) * 100).toFixed(1)
    : '0'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Total de Órdenes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">
            {activeOrders.length} activas
          </p>
        </CardContent>
      </Card>

      {/* Ingresos Totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground truncate">
            Promedio: {formatCurrency(avgOrderValue)}
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Entrega */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {deliveredCount} entregadas
          </p>
        </CardContent>
      </Card>

      {/* Pendientes de Acción */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requieren Acción</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount + processingCount}</div>
          <p className="text-xs text-muted-foreground">
            {pendingCount} pendientes · {processingCount} procesando
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
