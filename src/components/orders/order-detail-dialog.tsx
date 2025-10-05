"use client"

import { Order } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getFulfillmentStatusConfig,
} from "@/components/tables/columns/orders-columns"
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  Clock,
  Calendar,
  Tag,
  MessageSquare,
  Phone,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import Image from "next/image"

interface OrderDetailDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  if (!order) return null

  const statusConfig = getOrderStatusConfig(order.status)
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus)
  const fulfillmentConfig = getFulfillmentStatusConfig(order.fulfillmentStatus)

  const StatusIcon = statusConfig.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                {order.orderNumber}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.orderNumber, "Número de orden")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Creada el {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
              <Badge variant={fulfillmentConfig.variant}>{fulfillmentConfig.label}</Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Customer Information */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <User className="h-5 w-5" />
                Información del Cliente
              </h3>
              <div className="grid gap-3 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{order.customerName}</span>
                  {order.customerId && (
                    <Badge variant="outline" className="text-xs">
                      ID: {order.customerId}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.customerEmail}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.customerEmail, "Email")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{order.customerPhone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(order.customerPhone!, "Teléfono")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* Order Items */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    {item.productImage && (
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{item.productName}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cant: </span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Precio: </span>
                        <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                      </div>
                      {item.discount > 0 && (
                        <div className="text-xs text-green-600">
                          -{formatCurrency(item.discount)}
                        </div>
                      )}
                      <div className="font-semibold">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Summary */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <FileText className="h-5 w-5" />
                Resumen de Orden
              </h3>
              <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span className="font-medium">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="font-medium">{formatCurrency(order.tax)}</span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">{formatCurrency(order.shipping)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <CreditCard className="h-5 w-5" />
                Información de Pago
              </h3>
              <div className="grid gap-3 p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Método de pago</span>
                  <span className="font-medium">{order.paymentMethodDisplay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado del pago</span>
                  <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ID de transacción</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{order.transactionId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.transactionId!, "ID de transacción")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <section>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                  <MapPin className="h-5 w-5" />
                  Información de Envío
                </h3>
                <div className="grid gap-3 p-4 rounded-lg border bg-muted/50">
                  <div>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                  </div>
                  <Separator />
                  <div className="text-sm space-y-1">
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                  {(order.trackingNumber || order.carrier) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {order.carrier && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{order.carrier}</span>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Número de rastreo</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{order.trackingNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(order.trackingNumber!, "Número de rastreo")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Entrega estimada</span>
                            <span className="font-medium">
                              {format(new Date(order.estimatedDelivery), "dd 'de' MMMM", { locale: es })}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Timeline */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Clock className="h-5 w-5" />
                Cronología
              </h3>
              <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Orden creada</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                {order.confirmedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Confirmada</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.confirmedAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Enviada</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.shippedAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600">Entregada</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.deliveredAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600">Cancelada</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.cancelledAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Additional Information */}
            {(order.notes || order.tags || order.source) && (
              <section>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                  <MessageSquare className="h-5 w-5" />
                  Información Adicional
                </h3>
                <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                  {order.source && (
                    <div>
                      <span className="text-sm text-muted-foreground">Origen: </span>
                      <Badge variant="outline" className="ml-2">
                        {order.source === 'web' && 'Web'}
                        {order.source === 'mobile' && 'Móvil'}
                        {order.source === 'physical_store' && 'Tienda física'}
                        {order.source === 'phone' && 'Teléfono'}
                      </Badge>
                    </div>
                  )}
                  {order.tags && order.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">Etiquetas:</span>
                      <div className="flex flex-wrap gap-2">
                        {order.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">Notas del cliente:</span>
                      <p className="text-sm mt-1 p-2 bg-background rounded border">
                        {order.notes}
                      </p>
                    </div>
                  )}
                  {order.internalNotes && (
                    <div>
                      <span className="text-sm text-muted-foreground">Notas internas:</span>
                      <p className="text-sm mt-1 p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                        {order.internalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button variant="destructive">
              Cancelar Orden
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
