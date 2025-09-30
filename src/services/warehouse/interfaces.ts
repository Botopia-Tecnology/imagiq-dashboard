import {
  WarehouseOrder,
  OrderStatus,
  PickingTask,
  PackingTask,
  OperatorProfile,
  WarehouseMetrics,
  QualityCheck,
  InventoryAlert,
  WorkAssignment,
  Priority,
  PickingMethod,
  ShiftSummary
} from '@/types/warehouse';

// Interface Segregation Principle - Split by responsibility

export interface IOrderRepository {
  findById(id: string): Promise<WarehouseOrder | null>;
  findByStatus(status: OrderStatus): Promise<WarehouseOrder[]>;
  findByOperator(operatorId: string): Promise<WarehouseOrder[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  assignOperator(orderId: string, operatorId: string): Promise<void>;
  findByPriority(priority: Priority): Promise<WarehouseOrder[]>;
}

export interface ITaskService {
  createPickingTask(orderId: string, operatorId: string, method: PickingMethod): Promise<PickingTask>;
  createPackingTask(orderId: string, operatorId: string): Promise<PackingTask>;
  completeTask(taskId: string): Promise<void>;
  getActiveTasks(operatorId: string): Promise<(PickingTask | PackingTask)[]>;
}

export interface IOperatorService {
  findById(id: string): Promise<OperatorProfile | null>;
  findByRole(role: string): Promise<OperatorProfile[]>;
  findByShift(shift: string): Promise<OperatorProfile[]>;
  updateMetrics(operatorId: string, metrics: Partial<OperatorProfile['performance']>): Promise<void>;
  getTopPerformers(limit: number): Promise<OperatorProfile[]>;
}

export interface IMetricsService {
  calculateRealtimeMetrics(): Promise<WarehouseMetrics>;
  getOperatorPerformance(operatorId: string): Promise<OperatorProfile['performance']>;
  getShiftSummary(shift: string, date: Date): Promise<ShiftSummary>;
  trackPickingEfficiency(): Promise<number>;
  calculateAccuracyRate(): Promise<number>;
}

export interface IQualityService {
  performQualityCheck(orderId: string, checkedBy: string): Promise<QualityCheck>;
  getFailedOrders(): Promise<WarehouseOrder[]>;
  recordCorrection(checkId: string, correctedBy: string): Promise<void>;
  getQualityStats(): Promise<{ passRate: number; totalChecks: number }>;
}

export interface IInventoryService {
  checkStockLevels(): Promise<InventoryAlert[]>;
  updateStock(productId: string, quantity: number): Promise<void>;
  reserveItems(orderId: string): Promise<boolean>;
  releaseReservation(orderId: string): Promise<void>;
}

export interface IWorkloadBalancer {
  assignOptimalOperator(orderId: string): Promise<string>;
  distributeWorkload(): Promise<WorkAssignment[]>;
  calculateWorkCapacity(operatorId: string): Promise<number>;
  rebalanceTasks(): Promise<void>;
}

export interface INotificationService {
  notifyTaskAssignment(operatorId: string, taskId: string): Promise<void>;
  notifyPriorityOrder(orderId: string): Promise<void>;
  notifyQualityIssue(orderId: string, issue: string): Promise<void>;
  notifyShiftHandover(summary: ShiftSummary): Promise<void>;
}

export interface IRouteOptimizer {
  calculateOptimalRoute(operatorId: string, items: any[]): Promise<any[]>;
  optimizePickingSequence(tasks: PickingTask[]): Promise<PickingTask[]>;
  estimatePickingTime(items: any[]): Promise<number>;
}

export interface IRealtimeUpdates {
  subscribeToOrderUpdates(callback: (order: WarehouseOrder) => void): void;
  subscribeToMetrics(callback: (metrics: WarehouseMetrics) => void): void;
  publishStatusUpdate(orderId: string, status: OrderStatus): Promise<void>;
  unsubscribe(subscriptionId: string): void;
}

export interface IAuditLogger {
  logOrderStatusChange(orderId: string, oldStatus: OrderStatus, newStatus: OrderStatus, operatorId: string): Promise<void>;
  logTaskCompletion(taskId: string, operatorId: string, duration: number): Promise<void>;
  logQualityCheck(checkId: string, passed: boolean, checkedBy: string): Promise<void>;
  logError(operation: string, error: Error, context: any): Promise<void>;
}