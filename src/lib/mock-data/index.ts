export { mockProducts } from './products';
export { mockOrders } from './orders';
export { mockCustomers } from './customers';
export { mockCampaigns, mockWhatsAppTemplates } from './campaigns';
export {
  mockDashboardMetrics,
  mockSalesData,
  mockCategoryData,
  mockPaymentMethodData,
  mockTopProducts,
  mockRecentActivity,
} from './metrics';

// Función helper para simular delay de API
export const delay = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener productos con paginación simulada
export const getProducts = async (page: number = 1, limit: number = 10) => {
  await delay(500);
  const { mockProducts: products } = await import('./products');
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: products.slice(start, end),
    total: products.length,
    page,
    limit,
    totalPages: Math.ceil(products.length / limit),
  };
};

// Función para obtener órdenes con filtros simulados
export const getOrders = async (status?: string, page: number = 1, limit: number = 10) => {
  await delay(500);
  const { mockOrders: orders } = await import('./orders');
  let filteredOrders = orders;

  if (status && status !== 'all') {
    filteredOrders = orders.filter(order => order.status === status);
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filteredOrders.slice(start, end),
    total: filteredOrders.length,
    page,
    limit,
    totalPages: Math.ceil(filteredOrders.length / limit),
  };
};

// Función para obtener clientes con filtros simulados
export const getCustomers = async (segment?: string, page: number = 1, limit: number = 10) => {
  await delay(500);
  const { mockCustomers: customers } = await import('./customers');
  let filteredCustomers = customers;

  if (segment && segment !== 'all') {
    filteredCustomers = customers.filter(customer => customer.segment === segment);
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filteredCustomers.slice(start, end),
    total: filteredCustomers.length,
    page,
    limit,
    totalPages: Math.ceil(filteredCustomers.length / limit),
  };
};