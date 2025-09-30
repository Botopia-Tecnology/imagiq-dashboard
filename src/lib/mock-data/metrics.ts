import { DashboardMetrics } from '@/types';

export const mockDashboardMetrics: DashboardMetrics = {
  totalSales: 156789.50,
  totalOrders: 342,
  totalCustomers: 1247,
  conversionRate: 3.2,
  salesGrowth: 12.5,
  ordersGrowth: 8.3,
};

export const mockSalesData = [
  { month: 'Ene', sales: 45000, orders: 120 },
  { month: 'Feb', sales: 52000, orders: 138 },
  { month: 'Mar', sales: 48000, orders: 125 },
  { month: 'Abr', sales: 61000, orders: 165 },
  { month: 'May', sales: 55000, orders: 148 },
  { month: 'Jun', sales: 67000, orders: 180 },
  { month: 'Jul', sales: 71000, orders: 195 },
  { month: 'Ago', sales: 64000, orders: 172 },
  { month: 'Sep', sales: 156789, orders: 342 },
];

export const mockCategoryData = [
  { name: 'Smartphones', value: 35, sales: 87500 },
  { name: 'Laptops', value: 25, sales: 62500 },
  { name: 'Audio', value: 15, sales: 37500 },
  { name: 'Tablets', value: 12, sales: 30000 },
  { name: 'Gaming', value: 8, sales: 20000 },
  { name: 'Otros', value: 5, sales: 12500 },
];

export const mockPaymentMethodData = [
  { name: 'Tarjeta de Crédito', value: 45, amount: 70654.25 },
  { name: 'PayPal', value: 25, amount: 39197.38, icon: 'paypal' },
  { name: 'Transferencia', value: 20, amount: 31357.90 },
  { name: 'Tarjeta de Débito', value: 8, amount: 12543.12 },
  { name: 'Efectivo', value: 2, amount: 3136.85 },
];

export const mockTopProducts = [
  { name: 'iPhone 15 Pro Max', sales: 45, revenue: 58499.55 },
  { name: 'MacBook Pro M3 16"', sales: 23, revenue: 57499.77 },
  { name: 'Samsung Galaxy S24 Ultra', sales: 38, revenue: 45599.62 },
  { name: 'Canon EOS R5', sales: 8, revenue: 31199.92 },
  { name: 'Sony WH-1000XM5', sales: 67, revenue: 23449.33 },
];

export const mockRecentActivity = [
  {
    id: 'ORD-010',
    customer: 'Fernando Ramos',
    action: 'Nueva orden',
    amount: 1449.98,
    time: '2 minutos',
  },
  {
    id: 'ORD-009',
    customer: 'Carmen Vega',
    action: 'Orden entregada',
    amount: 3199.98,
    time: '15 minutos',
  },
  {
    id: 'ORD-008',
    customer: 'Diego Morales',
    action: 'Pago confirmado',
    amount: 1949.97,
    time: '32 minutos',
  },
  {
    id: 'ORD-007',
    customer: 'Isabella López',
    action: 'Orden cancelada',
    amount: 699.99,
    time: '1 hora',
  },
  {
    id: 'ORD-006',
    customer: 'Roberto Silva',
    action: 'Orden enviada',
    amount: 1849.98,
    time: '2 horas',
  },
];