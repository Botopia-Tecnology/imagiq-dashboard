"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  FileText,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Helper para obtener el color y label del status de orden
export const getOrderStatusConfig = (status: OrderStatus) => {
  const configs = {
    pending: {
      label: 'Pendiente',
      variant: 'outline' as const,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-500',
    },
    confirmed: {
      label: 'Confirmada',
      variant: 'secondary' as const,
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-500',
    },
    processing: {
      label: 'Procesando',
      variant: 'default' as const,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-500',
    },
    shipped: {
      label: 'Enviada',
      variant: 'default' as const,
      icon: Truck,
      color: 'text-purple-600 dark:text-purple-500',
    },
    delivered: {
      label: 'Entregada',
      variant: 'secondary' as const,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-500',
    },
    cancelled: {
      label: 'Cancelada',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-500',
    },
    refunded: {
      label: 'Reembolsada',
      variant: 'outline' as const,
      icon: XCircle,
      color: 'text-orange-600 dark:text-orange-500',
    },
  }
  return configs[status]
}

// Helper para obtener el color y label del status de pago
export const getPaymentStatusConfig = (status: PaymentStatus) => {
  const configs = {
    pending: {
      label: 'Pendiente',
      variant: 'outline' as const,
      color: 'text-yellow-600',
    },
    paid: {
      label: 'Pagado',
      variant: 'secondary' as const,
      color: 'text-green-600',
    },
    failed: {
      label: 'Fallido',
      variant: 'destructive' as const,
      color: 'text-red-600',
    },
    refunded: {
      label: 'Reembolsado',
      variant: 'outline' as const,
      color: 'text-orange-600',
    },
  }
  return configs[status]
}

// Helper para obtener el color y label del status de fulfillment
export const getFulfillmentStatusConfig = (status: FulfillmentStatus) => {
  const configs = {
    unfulfilled: {
      label: 'Sin preparar',
      variant: 'outline' as const,
      color: 'text-gray-600',
    },
    partial: {
      label: 'Parcial',
      variant: 'secondary' as const,
      color: 'text-yellow-600',
    },
    fulfilled: {
      label: 'Completo',
      variant: 'secondary' as const,
      color: 'text-green-600',
    },
  }
  return configs[status]
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Número de Orden
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("orderNumber")}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{row.getValue("customerName")}</span>
          <span className="text-xs text-muted-foreground truncate">
            {row.original.customerEmail}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "items",
    header: "Productos",
    cell: ({ row }) => {
      const items = row.original.items
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium whitespace-nowrap">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
          <span className="text-xs text-muted-foreground truncate">
            {items[0]?.productName}
            {items.length > 1 && ` +${items.length - 1}`}
          </span>
        </div>
      )
    },
    enableHiding: true,
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(total)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus
      const config = getOrderStatusConfig(status)
      const Icon = config.icon

      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Pago",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus
      const config = getPaymentStatusConfig(paymentStatus)

      return (
        <div className="flex flex-col gap-1">
          <Badge variant={config.variant} className="w-fit text-xs">
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {row.original.paymentMethodDisplay}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "Preparación",
    cell: ({ row }) => {
      const fulfillmentStatus = row.original.fulfillmentStatus
      const config = getFulfillmentStatusConfig(fulfillmentStatus)

      return (
        <Badge variant={config.variant} className="w-fit text-xs whitespace-nowrap">
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: true,
  },
  {
    accessorKey: "source",
    header: "Origen",
    cell: ({ row }) => {
      const sourceLabels = {
        web: 'Web',
        mobile: 'Móvil',
        physical_store: 'Tienda física',
        phone: 'Teléfono',
      }
      const source = row.original.source
      return (
        <span className="text-sm whitespace-nowrap">
          {source ? sourceLabels[source] : '-'}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderNumber)}
            >
              Copiar número de orden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Ver factura
            </DropdownMenuItem>
            {order.trackingNumber && (
              <DropdownMenuItem>
                <Truck className="mr-2 h-4 w-4" />
                Rastrear envío
              </DropdownMenuItem>
            )}
            {order.shippingAddress && (
              <DropdownMenuItem>
                <MapPin className="mr-2 h-4 w-4" />
                Ver dirección
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <DropdownMenuItem className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar orden
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
