import { WarehouseMetrics, ShiftSummary, QualityCheck, InventoryAlert } from '@/types/warehouse';

export const mockWarehouseMetrics: WarehouseMetrics = {
  ordersReceived: 47,
  ordersCompleted: 32,
  ordersPending: 15,
  averagePickTime: 4.2,
  accuracyRate: 98.7,
  unitsPerHour: 76,
  onTimeDelivery: 94.2,
  activeOperators: 6,
  peakHour: '14:00-15:00',
  topPerformer: 'María González'
};

export const mockShiftSummaries: ShiftSummary[] = [
  {
    shift: 'morning',
    date: new Date(),
    operators: 4,
    ordersProcessed: 28,
    totalUnits: 156,
    averageUPH: 82,
    errorCount: 3,
    onTimeRate: 96.4
  },
  {
    shift: 'afternoon',
    date: new Date(),
    operators: 3,
    ordersProcessed: 22,
    totalUnits: 134,
    averageUPH: 78,
    errorCount: 2,
    onTimeRate: 95.5
  },
  {
    shift: 'night',
    date: new Date(),
    operators: 2,
    ordersProcessed: 12,
    totalUnits: 68,
    averageUPH: 72,
    errorCount: 1,
    onTimeRate: 91.7
  }
];

export const mockQualityChecks: QualityCheck[] = [
  {
    id: 'qc-001',
    orderId: 'wo-005',
    checkedBy: 'op-004',
    checkedAt: new Date(Date.now() - 180000),
    passed: true,
    correctionRequired: false
  },
  {
    id: 'qc-002',
    orderId: 'wo-003',
    checkedBy: 'op-004',
    checkedAt: new Date(Date.now() - 900000),
    passed: false,
    issues: ['Empaque dañado', 'Producto incorrecto'],
    correctionRequired: true
  },
  {
    id: 'qc-003',
    orderId: 'wo-006',
    checkedBy: 'op-004',
    checkedAt: new Date(Date.now() - 1800000),
    passed: true,
    correctionRequired: false
  }
];

export const mockInventoryAlerts: InventoryAlert[] = [
  {
    id: 'alert-001',
    productId: 'prod-007',
    sku: 'SKU-007',
    currentStock: 5,
    minimumStock: 10,
    location: { zone: 'A', aisle: '01', shelf: '03', position: 'B' },
    severity: 'low',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'alert-002',
    productId: 'prod-014',
    sku: 'SKU-014',
    currentStock: 2,
    minimumStock: 15,
    location: { zone: 'B', aisle: '03', shelf: '02', position: 'C' },
    severity: 'critical',
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'alert-003',
    productId: 'prod-009',
    sku: 'SKU-009',
    currentStock: 8,
    minimumStock: 12,
    location: { zone: 'C', aisle: '05', shelf: '03', position: 'A' },
    severity: 'low',
    createdAt: new Date(Date.now() - 7200000)
  }
];

export const calculateRealtimeMetrics = () => {
  const now = new Date();
  const baseMetrics = { ...mockWarehouseMetrics };

  // Simulate real-time fluctuations
  baseMetrics.ordersReceived += Math.floor(Math.random() * 3);
  baseMetrics.ordersPending = baseMetrics.ordersReceived - baseMetrics.ordersCompleted;
  baseMetrics.accuracyRate = Math.round((98 + Math.random() * 2) * 10) / 10;
  baseMetrics.unitsPerHour = Math.round((70 + Math.random() * 20) * 10) / 10;

  return baseMetrics;
};

export const getShiftSummary = (shift: 'morning' | 'afternoon' | 'night') => {
  return mockShiftSummaries.find(s => s.shift === shift);
};

export const getQualityStats = () => {
  const totalChecks = mockQualityChecks.length;
  const passedChecks = mockQualityChecks.filter(qc => qc.passed).length;
  return {
    passRate: Math.round((passedChecks / totalChecks) * 1000) / 10,
    totalChecks
  };
};

export const getCriticalAlerts = () => {
  return mockInventoryAlerts.filter(alert => alert.severity === 'critical');
};

export const getRecentActivity = () => {
  return [
    { time: new Date(Date.now() - 300000), action: 'Orden WO-2024-007 asignada a Carlos Ruiz', type: 'assignment' },
    { time: new Date(Date.now() - 600000), action: 'Control de calidad completado para WO-2024-005', type: 'quality' },
    { time: new Date(Date.now() - 900000), action: 'Orden WO-2024-006 enviada', type: 'shipping' },
    { time: new Date(Date.now() - 1200000), action: 'Alerta de stock bajo: SKU-014', type: 'alert' },
    { time: new Date(Date.now() - 1500000), action: 'Ana Martín completó picking para WO-2024-003', type: 'completion' }
  ];
};