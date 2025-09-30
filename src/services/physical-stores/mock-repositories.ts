import {
  VerificationCode,
  PickupOrder,
  VerificationStatus,
  OrderStatus,
  PickupNotification,
  StoreInventory
} from '@/types/physical-stores';
import {
  IVerificationCodeRepository,
  IPickupOrderRepository,
  INotificationSender,
  IInventoryService,
  ILogger,
  IAuditService
} from './interfaces';

// Mock repository implementations for development
export class MockVerificationCodeRepository implements IVerificationCodeRepository {
  private codes: Map<string, VerificationCode> = new Map();
  private nextId = 1;

  async create(data: Omit<VerificationCode, 'id' | 'createdAt'>): Promise<VerificationCode> {
    const code: VerificationCode = {
      ...data,
      id: `vc-${this.nextId++}`,
      createdAt: new Date()
    };

    this.codes.set(code.id, code);
    return code;
  }

  async findByCode(code: string): Promise<VerificationCode | null> {
    for (const verificationCode of this.codes.values()) {
      if (verificationCode.code === code) {
        return verificationCode;
      }
    }
    return null;
  }

  async findByOrderId(orderId: string): Promise<VerificationCode[]> {
    return Array.from(this.codes.values()).filter(code => code.orderId === orderId);
  }

  async updateStatus(id: string, status: VerificationStatus): Promise<void> {
    const code = this.codes.get(id);
    if (code) {
      code.status = status;
      if (status === 'completed') {
        code.usedAt = new Date();
      }
    }
  }

  async incrementAttempts(id: string): Promise<void> {
    const code = this.codes.get(id);
    if (code) {
      code.attempts++;
    }
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, code] of this.codes.entries()) {
      if (code.expiresAt < now) {
        this.codes.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export class MockPickupOrderRepository implements IPickupOrderRepository {
  private orders: Map<string, PickupOrder> = new Map();

  constructor() {
    // Add some mock data
    this.seedMockData();
  }

  async findById(id: string): Promise<PickupOrder | null> {
    return this.orders.get(id) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<PickupOrder | null> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order;
      }
    }
    return null;
  }

  async findByStoreId(storeId: string, status?: OrderStatus): Promise<PickupOrder[]> {
    const orders = Array.from(this.orders.values()).filter(order => order.storeId === storeId);
    return status ? orders.filter(order => order.status === status) : orders;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
  }

  async markAsPickedUp(id: string, pickedUpAt: Date, verifiedBy: string): Promise<void> {
    const order = this.orders.get(id);
    if (order) {
      order.status = 'picked_up';
      order.pickedUpAt = pickedUpAt;
      order.updatedAt = new Date();
    }
  }

  async findExpired(): Promise<PickupOrder[]> {
    const now = new Date();
    return Array.from(this.orders.values()).filter(order =>
      order.expiresAt < now && order.status !== 'picked_up'
    );
  }

  private seedMockData(): void {
    const mockOrders: PickupOrder[] = [
      {
        id: 'order-1',
        orderNumber: 'ORD-2024-001',
        storeId: 'store-1',
        customerEmail: 'juan.perez@email.com',
        customerName: 'Juan Pérez',
        customerPhone: '+34 600 123 456',
        products: [
          {
            productId: 'prod-1',
            productName: 'Smartphone Samsung Galaxy',
            sku: 'SAM-GAL-001',
            quantity: 1,
            price: 599.99,
            isAvailable: true
          }
        ],
        totalAmount: 599.99,
        pickupMethod: 'in_store',
        status: 'ready_for_pickup',
        readyAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'order-2',
        orderNumber: 'ORD-2024-002',
        storeId: 'store-1',
        customerEmail: 'maria.lopez@email.com',
        customerName: 'María López',
        customerPhone: '+34 600 987 654',
        products: [
          {
            productId: 'prod-2',
            productName: 'Laptop Apple MacBook',
            sku: 'APL-MBA-001',
            quantity: 1,
            price: 1299.99,
            isAvailable: true
          }
        ],
        totalAmount: 1299.99,
        pickupMethod: 'curbside',
        status: 'preparing',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockOrders.forEach(order => this.orders.set(order.id, order));
  }
}

export class MockNotificationSender implements INotificationSender {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`Email sent to ${to}: ${subject}`);
    return Promise.resolve(true);
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`SMS sent to ${to}: ${message}`);
    return Promise.resolve(true);
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    console.log(`Push notification sent to ${userId}: ${title}`);
    return Promise.resolve(true);
  }
}

export class MockInventoryService implements IInventoryService {
  private inventory: Map<string, StoreInventory> = new Map();

  async checkAvailability(storeId: string, productId: string, quantity: number): Promise<boolean> {
    const key = `${storeId}-${productId}`;
    const item = this.inventory.get(key);
    return item ? item.available >= quantity : false;
  }

  async reserveItems(storeId: string, items: { productId: string; quantity: number }[]): Promise<boolean> {
    // In a real implementation, this would be a transaction
    for (const item of items) {
      const key = `${storeId}-${item.productId}`;
      const inventory = this.inventory.get(key);
      if (inventory && inventory.available >= item.quantity) {
        inventory.reserved += item.quantity;
        inventory.available -= item.quantity;
      } else {
        return false;
      }
    }
    return true;
  }

  async releaseReservation(storeId: string, items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const key = `${storeId}-${item.productId}`;
      const inventory = this.inventory.get(key);
      if (inventory) {
        inventory.reserved -= item.quantity;
        inventory.available += item.quantity;
      }
    }
  }

  async syncInventory(storeId: string): Promise<void> {
    console.log(`Inventory synced for store ${storeId}`);
  }
}

export class MockLogger implements ILogger {
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
  }

  error(message: string, error: Error, data?: any): void {
    this.log('error', `${message}: ${error.message}`, { ...data, stack: error.stack });
  }
}

export class MockAuditService implements IAuditService {
  private auditLogs: any[] = [];

  async logPickupAttempt(orderId: string, storeId: string, success: boolean, details: any): Promise<void> {
    const log = {
      type: 'pickup_attempt',
      orderId,
      storeId,
      success,
      details,
      timestamp: new Date()
    };
    this.auditLogs.push(log);
    console.log('Audit log - Pickup attempt:', log);
  }

  async logCodeGeneration(orderId: string, codeType: string): Promise<void> {
    const log = {
      type: 'code_generation',
      orderId,
      codeType,
      timestamp: new Date()
    };
    this.auditLogs.push(log);
    console.log('Audit log - Code generation:', log);
  }

  async logInventoryChange(storeId: string, productId: string, change: number, reason: string): Promise<void> {
    const log = {
      type: 'inventory_change',
      storeId,
      productId,
      change,
      reason,
      timestamp: new Date()
    };
    this.auditLogs.push(log);
    console.log('Audit log - Inventory change:', log);
  }
}