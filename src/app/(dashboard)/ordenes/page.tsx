"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/tables/data-table"
import { ordersColumns } from "@/components/tables/columns/orders-columns"
import { OrderStatsCards } from "@/components/orders/order-stats-cards"
import { OrderStatusChart } from "@/components/orders/order-status-chart"
import { OrderDetailDialog } from "@/components/orders/order-detail-dialog"
import { mockOrders } from "@/lib/mock-data/orders"
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from "@/types"
import {
  Plus,
  Download,
  Filter,
  Calendar,
  Search,
  FileText,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrdenesPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [activeTab, setActiveTab] = useState<string>("all")

  // Filtrar órdenes basado en la búsqueda y filtros
  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      // Filtro de búsqueda
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

      // Filtro de estado
      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      // Filtro de pago
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter

      // Filtro de pestaña activa
      let matchesTab = true
      switch (activeTab) {
        case "pending":
          matchesTab = order.status === "pending"
          break
        case "processing":
          matchesTab = order.status === "processing" || order.status === "confirmed"
          break
        case "shipped":
          matchesTab = order.status === "shipped"
          break
        case "delivered":
          matchesTab = order.status === "delivered"
          break
        case "cancelled":
          matchesTab = order.status === "cancelled" || order.status === "refunded"
          break
        default:
          matchesTab = true
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesTab
    })
  }, [searchQuery, statusFilter, paymentFilter, activeTab, mockOrders])

  // Calcular contadores para las pestañas
  const tabCounts = useMemo(() => {
    return {
      all: mockOrders.length,
      pending: mockOrders.filter(o => o.status === "pending").length,
      processing: mockOrders.filter(o => o.status === "processing" || o.status === "confirmed").length,
      shipped: mockOrders.filter(o => o.status === "shipped").length,
      delivered: mockOrders.filter(o => o.status === "delivered").length,
      cancelled: mockOrders.filter(o => o.status === "cancelled" || o.status === "refunded").length,
    }
  }, [mockOrders])

  // Configuración de filtros para la tabla
  const tableFilters = [
    {
      id: "status",
      title: "Estado",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Confirmada", value: "confirmed" },
        { label: "Procesando", value: "processing" },
        { label: "Enviada", value: "shipped" },
        { label: "Entregada", value: "delivered" },
        { label: "Cancelada", value: "cancelled" },
        { label: "Reembolsada", value: "refunded" },
      ],
    },
    {
      id: "paymentStatus",
      title: "Estado de Pago",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Pagado", value: "paid" },
        { label: "Fallido", value: "failed" },
        { label: "Reembolsado", value: "refunded" },
      ],
    },
    {
      id: "fulfillmentStatus",
      title: "Preparación",
      options: [
        { label: "Sin preparar", value: "unfulfilled" },
        { label: "Parcial", value: "partial" },
        { label: "Completo", value: "fulfilled" },
      ],
    },
    {
      id: "source",
      title: "Origen",
      options: [
        { label: "Web", value: "web" },
        { label: "Móvil", value: "mobile" },
        { label: "Tienda física", value: "physical_store" },
        { label: "Teléfono", value: "phone" },
      ],
    },
  ]

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const handleExportOrders = () => {
    // Implementar exportación a CSV/Excel
    console.log("Exportando órdenes...")
  }

  const handleRefresh = () => {
    // Implementar recarga de datos
    console.log("Refrescando órdenes...")
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y monitorea todas tus órdenes en tiempo real
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handleRefresh} size="sm" className="sm:h-10">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
          <Button variant="outline" onClick={handleExportOrders} size="sm" className="sm:h-10">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button size="sm" className="sm:h-10">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Orden</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards & Chart */}
      <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
        <div>
          <OrderStatsCards orders={mockOrders} />
        </div>
        <div>
          <OrderStatusChart orders={mockOrders} />
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviada</SelectItem>
                <SelectItem value="delivered">Entregada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="refunded">Reembolsada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pagos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Rango de fechas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs with Orders Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="all" className="whitespace-nowrap">
              Todas
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">
              Pendientes
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="whitespace-nowrap">
              Procesando
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.processing}
              </span>
            </TabsTrigger>
            <TabsTrigger value="shipped" className="whitespace-nowrap">
              Enviadas
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.shipped}
              </span>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="whitespace-nowrap">
              Entregadas
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.delivered}
              </span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="whitespace-nowrap">
              Canceladas
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.cancelled}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "Todas las órdenes"}
                {activeTab === "pending" && "Órdenes pendientes"}
                {activeTab === "processing" && "Órdenes en proceso"}
                {activeTab === "shipped" && "Órdenes enviadas"}
                {activeTab === "delivered" && "Órdenes entregadas"}
                {activeTab === "cancelled" && "Órdenes canceladas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ordersColumns}
                data={filteredOrders}
                searchKey="orderNumber"
                filters={tableFilters}
                initialColumnVisibility={{
                  items: false,
                  fulfillmentStatus: false,
                  source: false,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
