import { IOperatorService } from './interfaces';
import { OperatorProfile } from '@/types/warehouse';
import {
  mockOperators,
  getOperatorsByShift,
  getOperatorsByRole,
  getTopPerformers
} from '@/lib/mock-data/warehouse-operators';

// Single Responsibility: Manages operator data and performance
export class OperatorService implements IOperatorService {
  private operators: Map<string, OperatorProfile> = new Map();

  constructor() {
    // Initialize with mock data
    mockOperators.forEach(operator => {
      this.operators.set(operator.id, operator);
    });
  }

  async findById(id: string): Promise<OperatorProfile | null> {
    return this.operators.get(id) || null;
  }

  async findByRole(role: string): Promise<OperatorProfile[]> {
    return getOperatorsByRole(role);
  }

  async findByShift(shift: string): Promise<OperatorProfile[]> {
    return getOperatorsByShift(shift as 'morning' | 'afternoon' | 'night');
  }

  async updateMetrics(
    operatorId: string,
    metrics: Partial<OperatorProfile['performance']>
  ): Promise<void> {
    const operator = this.operators.get(operatorId);
    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    operator.performance = { ...operator.performance, ...metrics };
    this.operators.set(operatorId, operator);
  }

  async getTopPerformers(limit: number = 5): Promise<OperatorProfile[]> {
    return getTopPerformers(limit);
  }

  async getActiveOperators(): Promise<OperatorProfile[]> {
    return Array.from(this.operators.values()).filter(op => op.isActive);
  }

  async calculateTeamPerformance(): Promise<{
    averageUPH: number;
    averageAccuracy: number;
    totalOperators: number;
  }> {
    const activeOps = await this.getActiveOperators();

    if (activeOps.length === 0) {
      return { averageUPH: 0, averageAccuracy: 0, totalOperators: 0 };
    }

    const totalUPH = activeOps.reduce((sum, op) => sum + op.performance.unitsPerHour, 0);
    const totalAccuracy = activeOps.reduce((sum, op) => sum + op.performance.accuracy, 0);

    return {
      averageUPH: Math.round((totalUPH / activeOps.length) * 10) / 10,
      averageAccuracy: Math.round((totalAccuracy / activeOps.length) * 10) / 10,
      totalOperators: activeOps.length
    };
  }

  async getOperatorWorkload(operatorId: string): Promise<{
    assignedOrders: number;
    completedToday: number;
    currentCapacity: number;
  }> {
    const operator = await this.findById(operatorId);
    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    // Simulate workload calculation
    const baseLoad = operator.role === 'coordinator' ? 15 : 8;
    const capacityFactor = operator.performance.unitsPerHour / 75;

    return {
      assignedOrders: Math.floor(Math.random() * 5) + 2,
      completedToday: operator.performance.ordersCompleted,
      currentCapacity: Math.round(baseLoad * capacityFactor * 10) / 10
    };
  }

  async updateOperatorStatus(operatorId: string, isActive: boolean): Promise<void> {
    const operator = this.operators.get(operatorId);
    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    operator.isActive = isActive;
    this.operators.set(operatorId, operator);
  }
}