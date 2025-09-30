import { WarehouseOrder, OrderItem, WarehouseLocation } from '@/types/warehouse';

const locations: WarehouseLocation[] = [
  { zone: 'A', aisle: '01', shelf: '03', position: 'B', coordinates: { x: 10, y: 15 } },
  { zone: 'A', aisle: '02', shelf: '01', position: 'A', coordinates: { x: 12, y: 8 } },
  { zone: 'B', aisle: '03', shelf: '02', position: 'C', coordinates: { x: 25, y: 20 } },
  { zone: 'B', aisle: '04', shelf: '01', position: 'B', coordinates: { x: 28, y: 12 } },
  { zone: 'C', aisle: '05', shelf: '03', position: 'A', coordinates: { x: 40, y: 18 } },
  { zone: 'C', aisle: '06', shelf: '02', position: 'C', coordinates: { x: 42, y: 25 } }
];

const createOrderItem = (
  productId: string,
  sku: string,
  name: string,
  quantity: number,
  locationIndex: number,
  picked = false
): OrderItem => ({
  productId,
  sku,
  name,
  quantity,
  location: locations[locationIndex % locations.length],
  picked,
  pickedAt: picked ? new Date(Date.now() - Math.random() * 3600000) : undefined,
  pickedBy: picked ? 'op-002' : undefined,
  weight: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
  dimensions: {
    length: Math.round((Math.random() * 20 + 10) * 100) / 100,
    width: Math.round((Math.random() * 15 + 8) * 100) / 100,
    height: Math.round((Math.random() * 10 + 5) * 100) / 100
  }
});

export const mockWarehouseOrders: WarehouseOrder[] = [
  {
    id: 'wo-001',
    orderNumber: 'WO-2024-001',
    customerId: 'cust-001',
    customerName: 'Laura Jiménez',
    status: 'picking',
    priority: 'high',
    items: [
      createOrderItem('prod-001', 'SKU-001', 'Smartphone Galaxy S24', 1, 0, true),
      createOrderItem('prod-002', 'SKU-002', 'Funda Protectora', 1, 1, false)
    ],
    assignedOperator: 'op-002',
    pickingMethod: 'single_order',
    estimatedPickTime: 8,
    actualPickTime: 6.5,
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 900000),
    dueDate: new Date(Date.now() + 3600000),
    shippingMethod: 'Express',
    totalWeight: 0.35,
    notes: 'Cliente VIP - manejo cuidadoso'
  },
  {
    id: 'wo-002',
    orderNumber: 'WO-2024-002',
    customerId: 'cust-002',
    customerName: 'Miguel Herrera',
    status: 'assigned',
    priority: 'normal',
    items: [
      createOrderItem('prod-003', 'SKU-003', 'Laptop MacBook Pro', 1, 2),
      createOrderItem('prod-004', 'SKU-004', 'Mouse Inalámbrico', 1, 3),
      createOrderItem('prod-005', 'SKU-005', 'Teclado Mecánico', 1, 4)
    ],
    assignedOperator: 'op-003',
    pickingMethod: 'batch',
    estimatedPickTime: 12,
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date(Date.now() - 600000),
    dueDate: new Date(Date.now() + 7200000),
    shippingMethod: 'Standard',
    totalWeight: 2.1
  },
  {
    id: 'wo-003',
    orderNumber: 'WO-2024-003',
    customerId: 'cust-003',
    customerName: 'Carmen Vega',
    status: 'packing',
    priority: 'urgent',
    items: [
      createOrderItem('prod-006', 'SKU-006', 'Tablet iPad Air', 1, 5, true),
      createOrderItem('prod-007', 'SKU-007', 'Cargador Rápido', 2, 0, true)
    ],
    assignedOperator: 'op-005',
    pickingMethod: 'single_order',
    estimatedPickTime: 6,
    actualPickTime: 5.2,
    createdAt: new Date(Date.now() - 2700000),
    updatedAt: new Date(Date.now() - 300000),
    dueDate: new Date(Date.now() + 1800000),
    shippingMethod: 'Same Day',
    totalWeight: 0.8,
    notes: 'Entrega urgente - mismo día'
  },
  {
    id: 'wo-004',
    orderNumber: 'WO-2024-004',
    customerId: 'cust-004',
    customerName: 'Antonio Morales',
    status: 'received',
    priority: 'normal',
    items: [
      createOrderItem('prod-008', 'SKU-008', 'Monitor 4K 27"', 1, 1),
      createOrderItem('prod-009', 'SKU-009', 'Cable HDMI', 1, 2),
      createOrderItem('prod-010', 'SKU-010', 'Soporte Monitor', 1, 3)
    ],
    pickingMethod: 'zone',
    estimatedPickTime: 15,
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 300000),
    dueDate: new Date(Date.now() + 10800000),
    shippingMethod: 'Standard',
    totalWeight: 5.2
  },
  {
    id: 'wo-005',
    orderNumber: 'WO-2024-005',
    customerId: 'cust-005',
    customerName: 'Isabel Castillo',
    status: 'quality_check',
    priority: 'high',
    items: [
      createOrderItem('prod-011', 'SKU-011', 'Auriculares Premium', 1, 4, true),
      createOrderItem('prod-012', 'SKU-012', 'Estuche de Viaje', 1, 5, true)
    ],
    assignedOperator: 'op-004',
    pickingMethod: 'single_order',
    estimatedPickTime: 7,
    actualPickTime: 6.8,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 180000),
    dueDate: new Date(Date.now() + 5400000),
    shippingMethod: 'Express',
    totalWeight: 0.45
  },
  {
    id: 'wo-006',
    orderNumber: 'WO-2024-006',
    customerId: 'cust-006',
    customerName: 'Francisco Delgado',
    status: 'shipped',
    priority: 'normal',
    items: [
      createOrderItem('prod-013', 'SKU-013', 'Cámara Digital', 1, 0, true),
      createOrderItem('prod-014', 'SKU-014', 'Tarjeta SD 128GB', 1, 1, true),
      createOrderItem('prod-015', 'SKU-015', 'Batería Extra', 1, 2, true)
    ],
    assignedOperator: 'op-007',
    pickingMethod: 'batch',
    estimatedPickTime: 10,
    actualPickTime: 9.3,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000),
    dueDate: new Date(Date.now() + 3600000),
    shippingMethod: 'Standard',
    totalWeight: 1.2
  }
];

export const getOrdersByStatus = (status: string) => {
  return mockWarehouseOrders.filter(order => order.status === status);
};

export const getOrdersByPriority = (priority: string) => {
  return mockWarehouseOrders.filter(order => order.priority === priority);
};

export const getOrdersByOperator = (operatorId: string) => {
  return mockWarehouseOrders.filter(order => order.assignedOperator === operatorId);
};