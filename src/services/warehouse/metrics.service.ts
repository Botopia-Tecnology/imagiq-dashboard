import { IMetricsService, IOperatorService, IOrderRepository } from './interfaces';
import { WarehouseMetrics, ShiftSummary, OperatorProfile } from '@/types/warehouse';
import {
  calculateRealtimeMetrics,
  getShiftSummary,
  mockShiftSummaries
} from '@/lib/mock-data/warehouse-metrics';
import { mockOperators } from '@/lib/mock-data/warehouse-operators';
import { mockWarehouseOrders } from '@/lib/mock-data/warehouse-orders';

// Single Responsibility: Only handles metrics calculation and performance tracking
export class MetricsService implements IMetricsService {
  constructor(
    private readonly operatorService: IOperatorService,
    private readonly orderRepository: IOrderRepository
  ) {}

  async calculateRealtimeMetrics(): Promise<WarehouseMetrics> {
    try {
      return calculateRealtimeMetrics();
    } catch (error) {
      console.error('Error calculating realtime metrics:', error);
      throw new Error('Failed to calculate metrics');
    }
  }

  async getOperatorPerformance(operatorId: string): Promise<OperatorProfile['performance']> {
    const operator = await this.operatorService.findById(operatorId);
    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    return operator.performance;
  }

  async getShiftSummary(shift: string, date: Date): Promise<ShiftSummary> {
    const summary = getShiftSummary(shift as 'morning' | 'afternoon' | 'night');
    if (!summary) {
      throw new Error(`No summary found for shift ${shift}`);
    }

    return summary;
  }

  async trackPickingEfficiency(): Promise<number> {
    const completedOrders = mockWarehouseOrders.filter(
      order => order.status === 'picked' || order.status === 'shipped'
    );

    if (completedOrders.length === 0) return 0;

    const totalEfficiency = completedOrders.reduce((sum, order) => {
      if (order.actualPickTime && order.estimatedPickTime) {
        const efficiency = (order.estimatedPickTime / order.actualPickTime) * 100;
        return sum + Math.min(efficiency, 150); // Cap at 150% efficiency
      }
      return sum;
    }, 0);

    return Math.round((totalEfficiency / completedOrders.length) * 10) / 10;
  }

  async calculateAccuracyRate(): Promise<number> {
    const activeOperators = mockOperators.filter(op => op.isActive);
    if (activeOperators.length === 0) return 0;

    const totalAccuracy = activeOperators.reduce((sum, op) => sum + op.performance.accuracy, 0);
    return Math.round((totalAccuracy / activeOperators.length) * 10) / 10;
  }

  async getProductivityTrend(): Promise<number[]> {
    // Simulate 7-day productivity trend
    return Array.from({ length: 7 }, () =>
      Math.round((70 + Math.random() * 20) * 10) / 10
    );
  }

  async getShiftComparison(): Promise<ShiftSummary[]> {
    return mockShiftSummaries;
  }

  async calculateKPIs(): Promise<Record<string, number>> {
    const metrics = await this.calculateRealtimeMetrics();
    const efficiency = await this.trackPickingEfficiency();
    const accuracy = await this.calculateAccuracyRate();

    return {
      ordersPerHour: Math.round((metrics.ordersCompleted / 8) * 10) / 10,
      unitsPerHour: metrics.unitsPerHour,
      accuracyRate: accuracy,
      efficiency: efficiency,
      onTimeDelivery: metrics.onTimeDelivery,
      utilization: Math.round((metrics.activeOperators / 8) * 100 * 10) / 10
    };
  }
}