/**
 * Tipos para los endpoints GET /admin/support-orders
 * y GET /admin/support-orders/metrics
 */

import type {
  WhatsappMessage,
  EmailMessage,
  PseAttempt,
  CardAttempt,
} from "./orders";

// Estados de pago de soporte
export type SupportOrderStatus = "APPROVED" | "PENDING" | "REJECTED";

// Medios de pago de soporte
export type SupportPaymentMethod = "Tarjeta" | "PSE";

// Campos permitidos para ordenamiento
export type SupportOrderSortField =
  | "orden_numero"
  | "total"
  | "estado_pago"
  | "cliente"
  | "medio_pago"
  | "fecha_creacion";

// Dirección del ordenamiento
export type SortOrder = "asc" | "desc";

/**
 * Orden de soporte devuelta por la API
 */
export interface SupportOrder {
  id: string;
  orden_numero: string;
  cliente: string;
  numero_documento: string;
  total: number;
  estado_pago: SupportOrderStatus | null;
  medio_pago: SupportPaymentMethod;
  info_pago: string;
  fecha_creacion: string;
}

/**
 * Información de paginación
 */
export interface SupportOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Respuesta del endpoint GET /admin/support-orders
 */
export interface SupportOrdersApiResponse {
  data: SupportOrder[];
  pagination: SupportOrdersPagination;
}

/**
 * Parámetros de consulta
 */
export interface SupportOrdersQueryParams {
  page?: number;
  limit?: number;
  sortField?: SupportOrderSortField;
  sortOrder?: SortOrder;
  search?: string;
  excludeTest?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Helper para obtener el label del estado de pago
 */
export const getSupportStatusLabel = (
  status: SupportOrderStatus | null
): string => {
  if (!status) return "Pendiente";
  const labels: Record<SupportOrderStatus, string> = {
    APPROVED: "Aprobado",
    PENDING: "Pendiente",
    REJECTED: "Rechazado",
  };
  return labels[status] || status;
};

/**
 * Helper para obtener la variante del badge (consistente con shadcn/ui)
 */
export const getSupportStatusVariant = (
  status: SupportOrderStatus | null,
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
    case null:
    case undefined:
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Helper para obtener las clases de color del badge
 */
export const getSupportStatusColor = (
  status: SupportOrderStatus | null
): string => {
  if (!status || status === "PENDING") {
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700";
  }
  const colors: Record<SupportOrderStatus, string> = {
    APPROVED:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
    PENDING:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    REJECTED:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

// ============================================
// Tipos para GET /admin/support-orders/metrics
// ============================================

/**
 * Métricas generales de tickets de soporte
 */
export interface SupportOrderMetrics {
  total_tickets: number;
  total_ingresos: number;
  promedio_ticket: number;
  total_aprobados: number;
  total_pendientes: number;
  total_rechazados: number;
}

/**
 * Distribución por estado de pago
 */
export interface SupportStatusDistribution {
  cantidad: number;
  estado_pago: string;
}

/**
 * Distribución por medio de pago
 */
export interface SupportPaymentDistribution {
  medio_pago: string;
  cantidad: number;
  total: number;
}

/**
 * Respuesta del endpoint GET /admin/support-orders/metrics
 */
export interface SupportOrdersMetricsResponse {
  metrics: SupportOrderMetrics;
  statusDistribution: SupportStatusDistribution[];
  paymentMethodDistribution: SupportPaymentDistribution[];
}

// ============================================
// Tipos para GET /admin/support-orders/:id
// ============================================

export interface AdminSupportOrderDetail {
  order: {
    id: string;
    ordenNumero: string;
    estado: string;
    estadoPago: string;
    total: number;
    referencia: string | null;
    fechaCreacion: string;
    fechaActualizacion: string;
    medioPago: string | null;
  };
  customer: {
    id: string | null;
    nombre: string;
    apellido: string | null;
    email: string;
    telefono: string | null;
    codigoPais: string | null;
    tipoDocumento: string | null;
    numeroDocumento: string | null;
    fechaCreacion: string | null;
    emailVerificado: boolean | null;
    telefonoVerificado: boolean | null;
  };
  payment: {
    method: string | null;
    pse: { banco: string } | null;
    card: { last_four: string; franquicia: string } | null;
  };
  transactionAttempts: {
    pse: Array<PseAttempt>;
    card: Array<CardAttempt>;
  };
  communications: {
    whatsapp: Array<WhatsappMessage>;
    emails: Array<EmailMessage>;
  };
  rejection: {
    estado: string | null;
    respuesta: string | null;
    codRespuesta: number | null;
    codError: string | null;
    banco: string | null;
    timestamp: string;
  } | null;
}
