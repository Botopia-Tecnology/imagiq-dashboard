"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PhysicalStore, PickupOrder, OrderStatus } from "@/types/physical-stores";
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Phone,
  Mail,
  MapPin,
  Euro,
  Calendar,
  User,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface OrdersManagementModalProps {
  open: boolean;
  onClose: () => void;
  store: PhysicalStore;
  orders: PickupOrder[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onRefreshOrders: () => Promise<void>;
}

export function OrdersManagementModal({
  open,
  onClose,
  store,
  orders,
  onUpdateOrderStatus,
  onRefreshOrders,
}: OrdersManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ordersByStatus = {
    preparing: filteredOrders.filter(order => order.status === 'preparing'),
    ready_for_pickup: filteredOrders.filter(order => order.status === 'ready_for_pickup'),
    picked_up: filteredOrders.filter(order => order.status === 'picked_up'),
    expired: filteredOrders.filter(order => order.status === 'expired'),
    cancelled: filteredOrders.filter(order => order.status === 'cancelled'),
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'ready_for_pickup':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'picked_up':
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
      case 'expired':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'cancelled':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      preparing: 'Preparando',
      ready_for_pickup: 'Lista para recoger',
      picked_up: 'Recogida',
      expired: 'Expirada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready_for_pickup':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      in_store: "Recogida en tienda",
      curbside: "Recogida en bordillo",
      locker: "Recogida en locker",
      drive_thru: "Recogida en auto"
    };
    return labels[method as keyof typeof labels] || method;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const OrderCard = ({ order }: { order: PickupOrder }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{getStatusLabel(order.status)}</span>
            </Badge>
            <span className="font-mono text-sm">{order.orderNumber}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: es })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{order.customerEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{order.customerPhone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{getMethodLabel(order.pickupMethod)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-medium">€{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Expira: {formatDistanceToNow(order.expiresAt, { addSuffix: true, locale: es })}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Products */}
        <div>
          <h4 className="font-medium mb-2">Productos ({order.products.length})</h4>
          <div className="space-y-2">
            {order.products.map((product, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{product.productName}</span>
                  <span className="text-muted-foreground ml-2">({product.sku})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>x{product.quantity}</span>
                  <span className="font-mono">€{product.price.toFixed(2)}</span>
                  {!product.isAvailable && (
                    <Badge variant="destructive" className="text-xs">
                      No disponible
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'preparing' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onUpdateOrderStatus(order.id, 'ready_for_pickup')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
            >
              Cancelar
            </Button>
          </div>
        )}

        {order.status === 'ready_for_pickup' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
            >
              Volver a Preparando
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
            >
              Cancelar
            </Button>
          </div>
        )}

        {order.notes && (
          <>
            <Separator />
            <div>
              <span className="text-sm font-medium">Notas: </span>
              <span className="text-sm text-muted-foreground">{order.notes}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Órdenes - {store.location.name}
          </DialogTitle>
          <DialogDescription>
            Administra todas las órdenes de recogida para esta tienda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de orden, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{ordersByStatus.preparing.length}</div>
                <div className="text-xs text-muted-foreground">Preparando</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{ordersByStatus.ready_for_pickup.length}</div>
                <div className="text-xs text-muted-foreground">Listas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{ordersByStatus.picked_up.length}</div>
                <div className="text-xs text-muted-foreground">Recogidas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{ordersByStatus.expired.length}</div>
                <div className="text-xs text-muted-foreground">Expiradas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{ordersByStatus.cancelled.length}</div>
                <div className="text-xs text-muted-foreground">Canceladas</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activas
                <Badge variant="secondary">
                  {ordersByStatus.preparing.length + ordersByStatus.ready_for_pickup.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completadas
                <Badge variant="secondary">{ordersByStatus.picked_up.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Expiradas
                <Badge variant="secondary">{ordersByStatus.expired.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Canceladas
                <Badge variant="secondary">{ordersByStatus.cancelled.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {[...ordersByStatus.preparing, ...ordersByStatus.ready_for_pickup].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay órdenes activas
                  </div>
                ) : (
                  [...ordersByStatus.preparing, ...ordersByStatus.ready_for_pickup].map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {ordersByStatus.picked_up.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay órdenes completadas
                  </div>
                ) : (
                  ordersByStatus.picked_up.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {ordersByStatus.expired.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay órdenes expiradas
                  </div>
                ) : (
                  ordersByStatus.expired.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {ordersByStatus.cancelled.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay órdenes canceladas
                  </div>
                ) : (
                  ordersByStatus.cancelled.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}