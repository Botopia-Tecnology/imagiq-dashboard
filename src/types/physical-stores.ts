export type StoreStatus = 'active' | 'inactive' | 'maintenance' | 'temporarily_closed';

export type PickupMethod = 'in_store' | 'curbside' | 'locker' | 'drive_thru';

export type VerificationStatus = 'pending' | 'verified' | 'expired' | 'cancelled' | 'completed';

export type OrderStatus = 'ready_for_pickup' | 'picked_up' | 'cancelled' | 'preparing' | 'expired';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface StoreContactInfo {
  phone: string;
  email: string;
  managerName: string;
  managerPhone?: string;
}

export interface StoreHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface StoreCapability {
  pickupMethods: PickupMethod[];
  hasLocker: boolean;
  hasCurbside: boolean;
  hasDriveThru: boolean;
  maxPickupDays: number;
  maxDailyOrders: number;
}

export interface PhysicalStore {
  id: string;
  code: string;
  location: StoreLocation;
  contact: StoreContactInfo;
  hours: StoreHours[];
  capabilities: StoreCapability;
  status: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
  inventorySync: boolean;
}

export interface PickupOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  products: PickupOrderItem[];
  totalAmount: number;
  pickupMethod: PickupMethod;
  status: OrderStatus;
  readyAt?: Date;
  pickedUpAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface PickupOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  isAvailable: boolean;
}

export interface VerificationCode {
  id: string;
  code: string;
  orderId: string;
  storeId: string;
  type: 'pickup' | 'identity';
  status: VerificationStatus;
  expiresAt: Date;
  usedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface StoreStats {
  totalOrders: number;
  readyOrders: number;
  completedToday: number;
  pendingOrders: number;
  expiredOrders: number;
  averagePickupTime: number;
  customerSatisfaction: number;
  conversionRate: number;
}

export interface PickupNotification {
  id: string;
  orderId: string;
  type: 'ready_for_pickup' | 'reminder' | 'expiring_soon' | 'completed';
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  message: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed';
}

export interface StoreInventory {
  storeId: string;
  productId: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: Date;
}

export interface PickupVerificationRequest {
  orderId: string;
  verificationCode: string;
  storeId: string;
  verifiedBy: string;
  customerPresent: boolean;
  idVerified: boolean;
  notes?: string;
}

export interface PickupVerificationResult {
  success: boolean;
  order?: PickupOrder;
  message: string;
  timestamp: Date;
  verifiedBy: string;
}

export interface StoreAnalytics {
  date: string;
  storeId: string;
  ordersReceived: number;
  ordersCompleted: number;
  averageWaitTime: number;
  customerRating: number;
  revenue: number;
  cancelationRate: number;
}