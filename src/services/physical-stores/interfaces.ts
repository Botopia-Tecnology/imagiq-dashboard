import {
  VerificationCode,
  PickupOrder,
  PickupVerificationRequest,
  PickupVerificationResult,
  PickupNotification,
  StoreInventory,
  VerificationStatus,
  OrderStatus
} from '@/types/physical-stores';

// Interface Segregation Principle - Split interfaces by responsibility

export interface ICodeGenerator {
  generateSecureCode(length?: number): string;
  generateQRCode(data: string): Promise<string>;
}

export interface ICodeValidator {
  validateCode(code: string, expectedCode: string): boolean;
  isCodeExpired(expiresAt: Date): boolean;
  isCodeFormat(code: string): boolean;
}

export interface IVerificationCodeRepository {
  create(verificationCode: Omit<VerificationCode, 'id' | 'createdAt'>): Promise<VerificationCode>;
  findByCode(code: string): Promise<VerificationCode | null>;
  findByOrderId(orderId: string): Promise<VerificationCode[]>;
  updateStatus(id: string, status: VerificationStatus): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

export interface IPickupOrderRepository {
  findById(id: string): Promise<PickupOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<PickupOrder | null>;
  findByStoreId(storeId: string, status?: OrderStatus): Promise<PickupOrder[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  markAsPickedUp(id: string, pickedUpAt: Date, verifiedBy: string): Promise<void>;
  findExpired(): Promise<PickupOrder[]>;
}

export interface INotificationSender {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendSMS(to: string, message: string): Promise<boolean>;
  sendPushNotification(userId: string, title: string, body: string): Promise<boolean>;
}

export interface IInventoryService {
  checkAvailability(storeId: string, productId: string, quantity: number): Promise<boolean>;
  reserveItems(storeId: string, items: { productId: string; quantity: number }[]): Promise<boolean>;
  releaseReservation(storeId: string, items: { productId: string; quantity: number }[]): Promise<void>;
  syncInventory(storeId: string): Promise<void>;
}

export interface ILogger {
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void;
  error(message: string, error: Error, data?: any): void;
}

export interface IAuditService {
  logPickupAttempt(orderId: string, storeId: string, success: boolean, details: any): Promise<void>;
  logCodeGeneration(orderId: string, codeType: string): Promise<void>;
  logInventoryChange(storeId: string, productId: string, change: number, reason: string): Promise<void>;
}