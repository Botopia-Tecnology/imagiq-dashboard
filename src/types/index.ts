export interface Product {
  id: string; // codigoMarketBase
  codigoMarket: string[];
  name: string; // nombreMarket
  modelo: string;
  description?: string; // descGeneral
  desDetallada: string[];
  price: number; // precioNormal[0]
  precioDescto: number[];
  stock: number; // stock[0]
  category: string; // categoria
  subcategoria: string;
  color: string[];
  capacidad: string[];
  sku: string[];
  status: 'active' | 'inactive' | 'draft';
  image?: string; // urlImagenes[0]
  urlImagenes: string[];
  urlRender3D: string[];
  fechaInicioVigencia: string[];
  fechaFinalVigencia: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  ordersCount: number;
  segment: 'vip' | 'regular' | 'new' | 'inactive';
  lastOrder?: Date;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in-web';
  status: 'draft' | 'active' | 'paused' | 'completed';
  reach: number;
  clicks: number;
  conversions: number;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  salesGrowth: number;
  ordersGrowth: number;
}