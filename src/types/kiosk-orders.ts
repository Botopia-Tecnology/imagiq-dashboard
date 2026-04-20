/**
 * Tipos para los endpoints GET /admin/kiosk-orders
 * y GET /admin/kiosk-orders/metrics
 */

export type KioskOrderEstado =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "APPROVED"
  | "CANCELLED"
  | "REJECTED"
  | "ABANDONED"
  | "INTERNAL_ERROR";

export type KioskOrderSortField =
  | "serial_id"
  | "total_amount"
  | "estado"
  | "cliente"
  | "medio_pago"
  | "tienda"
  | "fecha_creacion";

export type SortOrder = "asc" | "desc";

export interface KioskOrder {
  id: string;
  serial_id: number;
  cliente: string;
  numero_documento: string;
  email: string;
  total_amount: number;
  estado: KioskOrderEstado;
  medio_pago: "Tarjeta" | "PSE" | "Addi" | "Datafono" | null;
  tienda_id: string | null;
  tienda_codigo: string | null;
  tienda_descripcion: string | null;
  tienda_ciudad: string | null;
  tienda_cod_bodega: string | null;
  fecha_creacion: string;
  kiosk_created_at: string;
}

export interface KioskOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface KioskOrdersApiResponse {
  data: KioskOrder[];
  pagination: KioskOrdersPagination;
}

export interface KioskOrdersQueryParams {
  page?: number;
  limit?: number;
  sortField?: KioskOrderSortField;
  sortOrder?: SortOrder;
  search?: string;
  excludeTest?: boolean;
  dateFrom?: string;
  dateTo?: string;
  storeId?: string;
  estado?: KioskOrderEstado;
}

export interface KioskOrdersMetrics {
  total_ordenes: number;
  total_ingresos: number;
  total_aprobadas: number;
  total_pendientes: number;
  total_rechazadas: number;
}

export interface KioskStoreDistribution {
  tienda_id: string | null;
  codigo: string | null;
  descripcion: string | null;
  ciudad: string | null;
  cantidad: number;
  total: number;
}

export interface KioskOrdersMetricsResponse {
  metrics: KioskOrdersMetrics;
  storeDistribution: KioskStoreDistribution[];
}

export const getKioskEstadoLabel = (estado: KioskOrderEstado): string => {
  const labels: Record<KioskOrderEstado, string> = {
    PENDING: "Pendiente",
    PENDING_PAYMENT: "Esperando pago",
    APPROVED: "Aprobada",
    CANCELLED: "Cancelada",
    REJECTED: "Rechazada",
    ABANDONED: "Abandonada",
    INTERNAL_ERROR: "Error interno",
  };
  return labels[estado] || estado;
};

export const getKioskEstadoColor = (estado: KioskOrderEstado): string => {
  const colors: Record<KioskOrderEstado, string> = {
    APPROVED:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
    PENDING:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    PENDING_PAYMENT:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    REJECTED:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    CANCELLED:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700",
    ABANDONED:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700",
    INTERNAL_ERROR:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  };
  return colors[estado] || "bg-gray-100 text-gray-700 border-gray-300";
};
