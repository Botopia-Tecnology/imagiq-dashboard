import { IOrderRepository } from './interfaces';
import { WarehouseOrder, OrderStatus, Priority } from '@/types/warehouse';
import {
  mockWarehouseOrders,
  getOrdersByStatus,
  getOrdersByPriority,
  getOrdersByOperator
} from '@/lib/mock-data/warehouse-orders';

// Single Responsibility: Manages warehouse order operations
export class OrderService implements IOrderRepository {
  private orders: Map<string, WarehouseOrder> = new Map();

  constructor() {
    // Initialize with mock data
    mockWarehouseOrders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }

  async findById(id: string): Promise<WarehouseOrder | null> {
    return this.orders.get(id) || null;
  }

  async findByStatus(status: OrderStatus): Promise<WarehouseOrder[]> {
    return getOrdersByStatus(status);
  }

  async findByOperator(operatorId: string): Promise<WarehouseOrder[]> {
    return getOrdersByOperator(operatorId);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    order.status = status;
    order.updatedAt = new Date();

    // Update timing based on status
    if (status === 'picked' && !order.actualPickTime) {
      order.actualPickTime = this.calculateActualPickTime(order);
    }

    this.orders.set(id, order);
  }

  async assignOperator(orderId: string, operatorId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.assignedOperator = operatorId;
    order.status = 'assigned';
    order.updatedAt = new Date();

    this.orders.set(orderId, order);
  }

  async findByPriority(priority: Priority): Promise<WarehouseOrder[]> {
    return getOrdersByPriority(priority);
  }

  async getAllOrders(): Promise<WarehouseOrder[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersInProgress(): Promise<WarehouseOrder[]> {
    const inProgressStatuses: OrderStatus[] = ['assigned', 'picking', 'picked', 'quality_check', 'packing'];
    return Array.from(this.orders.values()).filter(order =>
      inProgressStatuses.includes(order.status)
    );
  }

  async getUrgentOrders(): Promise<WarehouseOrder[]> {
    const now = new Date();
    return Array.from(this.orders.values()).filter(order => {
      const timeToDeadline = order.dueDate.getTime() - now.getTime();
      return timeToDeadline < 2 * 60 * 60 * 1000; // Less than 2 hours
    });
  }

  async getOrdersByTimeRange(startDate: Date, endDate: Date): Promise<WarehouseOrder[]> {
    return Array.from(this.orders.values()).filter(order =>
      order.createdAt >= startDate && order.createdAt <= endDate
    );
  }

  private calculateActualPickTime(order: WarehouseOrder): number {
    // Simulate actual pick time based on estimated time with some variance
    const variance = (Math.random() - 0.5) * 0.4; // ±20% variance
    return Math.max(1, order.estimatedPickTime * (1 + variance));
  }

  async updateOrderPriority(orderId: string, priority: Priority): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.priority = priority;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);
  }

  async addOrderNote(orderId: string, note: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.notes = order.notes ? `${order.notes}\n${note}` : note;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);
  }
}