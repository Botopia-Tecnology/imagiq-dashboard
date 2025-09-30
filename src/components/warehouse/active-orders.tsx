"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WarehouseOrder, OrderStatus, Priority } from "@/types/warehouse";
import {
  Package,
  Clock,
  User,
  Search,
  AlertTriangle,
  CheckCircle,
  Play,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ActiveOrdersProps {
  orders: WarehouseOrder[];
  onAssignOperator: (orderId: string, operatorId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  operators: Array<{ id: string; name: string; role: string }>;
}

export function ActiveOrders({ orders, onAssignOperator, onUpdateStatus, operators }: ActiveOrdersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      received: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300',
      assigned: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      picking: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      picked: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      quality_check: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      packing: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      packed: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      shipping_label: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
      shipped: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };
    return colors[status] || colors.received;
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      received: 'Recibida',
      assigned: 'Asignada',
      picking: 'Picking',
      picked: 'Recogida',
      quality_check: 'Control Calidad',
      packing: 'Empacando',
      packed: 'Empacada',
      shipping_label: 'Etiqueta Envío',
      shipped: 'Enviada',
      cancelled: 'Cancelada'
    };
    return labels[status];
  };

  const getNextAction = (order: WarehouseOrder) => {
    if (!order.assignedOperator && order.status === 'received') {
      return { action: 'assign', label: 'Asignar' };
    }

    switch (order.status) {
      case 'assigned':
        return { action: 'start_picking', label: 'Iniciar Picking', nextStatus: 'picking' as OrderStatus };
      case 'picking':
        return { action: 'complete_picking', label: 'Completar Picking', nextStatus: 'picked' as OrderStatus };
      case 'picked':
        return { action: 'quality_check', label: 'Control Calidad', nextStatus: 'quality_check' as OrderStatus };
      case 'quality_check':
        return { action: 'start_packing', label: 'Iniciar Empaque', nextStatus: 'packing' as OrderStatus };
      case 'packing':
        return { action: 'complete_packing', label: 'Completar Empaque', nextStatus: 'packed' as OrderStatus };
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Órdenes Activas ({filteredOrders.length})
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="received">Recibida</SelectItem>
              <SelectItem value="assigned">Asignada</SelectItem>
              <SelectItem value="picking">Picking</SelectItem>
              <SelectItem value="packing">Empacando</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const nextAction = getNextAction(order);
              const isOverdue = new Date() > order.dueDate;

              return (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(order.priority)}>
                        {order.priority.toUpperCase()}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Vencida
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div>{order.customerName}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {order.items.length} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: es })}
                        </span>
                        {order.assignedOperator && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {operators.find(op => op.id === order.assignedOperator)?.name || 'Sin asignar'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {nextAction && (
                      nextAction.action === 'assign' ? (
                        <Select onValueChange={(operatorId) => onAssignOperator(order.id, operatorId)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Asignar a..." />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.filter(op => op.role === 'operator').map(operator => (
                              <SelectItem key={operator.id} value={operator.id}>
                                {operator.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(order.id, nextAction.nextStatus!)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {nextAction.label}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron órdenes activas
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}