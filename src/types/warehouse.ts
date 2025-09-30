export type OrderStatus =
  | 'received' | 'assigned' | 'picking' | 'picked'
  | 'quality_check' | 'packing' | 'packed'
  | 'shipping_label' | 'shipped' | 'cancelled';

export type OperatorRole = 'operator' | 'coordinator' | 'supervisor' | 'quality_controller';

export type PickingMethod = 'single_order' | 'batch' | 'wave' | 'zone';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface WarehouseLocation {
  zone: string;
  aisle: string;
  shelf: string;
  position: string;
  coordinates?: { x: number; y: number };
}

export interface OperatorProfile {
  id: string;
  name: string;
  role: OperatorRole;
  shift: 'morning' | 'afternoon' | 'night';
  zone?: string;
  skills: string[];
  performance: OperatorMetrics;
  isActive: boolean;
  avatar?: string;
}

export interface OperatorMetrics {
  unitsPerHour: number;
  accuracy: number;
  ordersCompleted: number;
  averagePickTime: number;
  errorRate: number;
}

export interface WarehouseOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  priority: Priority;
  items: OrderItem[];
  assignedOperator?: string;
  pickingMethod: PickingMethod;
  estimatedPickTime: number;
  actualPickTime?: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  shippingMethod: string;
  totalWeight: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  location: WarehouseLocation;
  picked: boolean;
  pickedAt?: Date;
  pickedBy?: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
}

export interface PickingTask {
  id: string;
  orderId: string;
  operatorId: string;
  items: OrderItem[];
  route: WarehouseLocation[];
  status: 'assigned' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  method: PickingMethod;
}

export interface PackingTask {
  id: string;
  orderId: string;
  operatorId: string;
  items: OrderItem[];
  packaging: PackageInfo;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  qualityCheck: boolean;
}

export interface PackageInfo {
  type: string;
  dimensions: { length: number; width: number; height: number };
  weight: number;
  trackingNumber?: string;
  shippingLabel?: string;
}

export interface WarehouseMetrics {
  ordersReceived: number;
  ordersCompleted: number;
  ordersPending: number;
  averagePickTime: number;
  accuracyRate: number;
  unitsPerHour: number;
  onTimeDelivery: number;
  activeOperators: number;
  peakHour: string;
  topPerformer: string;
}

export interface ShiftSummary {
  shift: 'morning' | 'afternoon' | 'night';
  date: Date;
  operators: number;
  ordersProcessed: number;
  totalUnits: number;
  averageUPH: number;
  errorCount: number;
  onTimeRate: number;
}

export interface QualityCheck {
  id: string;
  orderId: string;
  checkedBy: string;
  checkedAt: Date;
  passed: boolean;
  issues?: string[];
  correctionRequired: boolean;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  location: WarehouseLocation;
  severity: 'low' | 'critical';
  createdAt: Date;
}

export interface WorkAssignment {
  operatorId: string;
  taskType: 'picking' | 'packing' | 'quality' | 'receiving';
  priority: Priority;
  estimatedTime: number;
  zone?: string;
}