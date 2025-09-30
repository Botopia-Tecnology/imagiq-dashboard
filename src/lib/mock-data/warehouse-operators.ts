import { OperatorProfile } from '@/types/warehouse';

export const mockOperators: OperatorProfile[] = [
  {
    id: 'op-001',
    name: 'María González',
    role: 'coordinator',
    shift: 'morning',
    zone: 'ALL',
    skills: ['order_management', 'quality_control', 'team_leadership', 'inventory'],
    performance: {
      unitsPerHour: 85,
      accuracy: 99.2,
      ordersCompleted: 234,
      averagePickTime: 3.2,
      errorRate: 0.8
    },
    isActive: true,
    avatar: 'MG'
  },
  {
    id: 'op-002',
    name: 'Carlos Ruiz',
    role: 'operator',
    shift: 'morning',
    zone: 'A',
    skills: ['picking', 'packing', 'barcode_scanning'],
    performance: {
      unitsPerHour: 78,
      accuracy: 98.7,
      ordersCompleted: 156,
      averagePickTime: 4.1,
      errorRate: 1.3
    },
    isActive: true,
    avatar: 'CR'
  },
  {
    id: 'op-003',
    name: 'Ana Martín',
    role: 'operator',
    shift: 'morning',
    zone: 'B',
    skills: ['picking', 'quality_check', 'returns_processing'],
    performance: {
      unitsPerHour: 82,
      accuracy: 99.1,
      ordersCompleted: 189,
      averagePickTime: 3.8,
      errorRate: 0.9
    },
    isActive: true,
    avatar: 'AM'
  },
  {
    id: 'op-004',
    name: 'David López',
    role: 'quality_controller',
    shift: 'morning',
    zone: 'QC',
    skills: ['quality_control', 'documentation', 'problem_solving'],
    performance: {
      unitsPerHour: 45,
      accuracy: 99.8,
      ordersCompleted: 87,
      averagePickTime: 8.5,
      errorRate: 0.2
    },
    isActive: true,
    avatar: 'DL'
  },
  {
    id: 'op-005',
    name: 'Elena Rodríguez',
    role: 'operator',
    shift: 'afternoon',
    zone: 'C',
    skills: ['packing', 'shipping_labels', 'heavy_items'],
    performance: {
      unitsPerHour: 74,
      accuracy: 98.3,
      ordersCompleted: 143,
      averagePickTime: 4.7,
      errorRate: 1.7
    },
    isActive: true,
    avatar: 'ER'
  },
  {
    id: 'op-006',
    name: 'Javier Sánchez',
    role: 'supervisor',
    shift: 'afternoon',
    zone: 'ALL',
    skills: ['supervision', 'training', 'metrics_analysis', 'problem_resolution'],
    performance: {
      unitsPerHour: 65,
      accuracy: 99.5,
      ordersCompleted: 201,
      averagePickTime: 5.2,
      errorRate: 0.5
    },
    isActive: true,
    avatar: 'JS'
  },
  {
    id: 'op-007',
    name: 'Lucía Fernández',
    role: 'operator',
    shift: 'afternoon',
    zone: 'A',
    skills: ['picking', 'voice_picking', 'fragile_items'],
    performance: {
      unitsPerHour: 88,
      accuracy: 99.0,
      ordersCompleted: 167,
      averagePickTime: 3.5,
      errorRate: 1.0
    },
    isActive: true,
    avatar: 'LF'
  },
  {
    id: 'op-008',
    name: 'Roberto Torres',
    role: 'operator',
    shift: 'night',
    zone: 'B',
    skills: ['picking', 'receiving', 'inventory_management'],
    performance: {
      unitsPerHour: 72,
      accuracy: 98.9,
      ordersCompleted: 128,
      averagePickTime: 4.3,
      errorRate: 1.1
    },
    isActive: true,
    avatar: 'RT'
  }
];

export const getOperatorsByShift = (shift: 'morning' | 'afternoon' | 'night') => {
  return mockOperators.filter(op => op.shift === shift && op.isActive);
};

export const getOperatorsByRole = (role: string) => {
  return mockOperators.filter(op => op.role === role && op.isActive);
};

export const getTopPerformers = (limit: number = 5) => {
  return mockOperators
    .filter(op => op.isActive)
    .sort((a, b) => b.performance.unitsPerHour - a.performance.unitsPerHour)
    .slice(0, limit);
};