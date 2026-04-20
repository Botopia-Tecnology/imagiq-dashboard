/**
 * Tipos para el endpoint GET /admin/orders
 * y GET /admin/orders/metrics
 * Documentación: ORDENES_README.md
 */

// Estados de orden posibles
export type ApiOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "CANCELLED"
  | "REJECTED"
  | "ABANDONED"
  | "INTERNAL_ERROR";

// Medios de pago
export type ApiPaymentMethod = "Tarjeta" | "PSE" | "Addi" | "Datafono";

// Campos permitidos para ordenamiento
export type OrderSortField =
  | "serial_id"
  | "total_amount"
  | "estado"
  | "cliente"
  | "medio_pago"
  | "numero_documento"
  | "fecha_creacion";

// Dirección del ordenamiento
export type SortOrder = "asc" | "desc";

/**
 * Orden devuelta por la API
 */
export interface ApiOrder {
  id: string;
  serial_id: number;
  cliente: string;
  numero_documento: string;
  total_amount: number;
  estado: ApiOrderStatus;
  medio_pago: ApiPaymentMethod;
  info_pago: string;
  fecha_creacion: string;
}

export interface AdminOrderDetail {
  order: {
    id: string;
    serialId: number;
    estado: ApiOrderStatus;
    total: number;
    shipping: number;
    taxes: number | null;
    currency: string;
    fechaCreacion: string;
    medioPago: string | null;
    metodoEnvio: string | null;
    referencia: string | null;
    transactionId: string | null;
    couponCode: string | null;
    couponDiscount: number | null;
    latitude: string | null;
    longitude: string | null;
  };
  customer: {
    id: string;
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
  billing: {
    type: string;
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    email: string;
    telefono: string;
    razon_social: string;
    nit: string;
    representante_legal: string;
    direccion_id: string | null;
    linea_uno: string | null;
    ciudad: string | null;
    departamento: string | null;
    pais: string | null;
    complemento: string | null;
    barrio: string | null;
    codigo_postal: string | null;
    direccion_formateada: string | null;
  } | null;
  shippingAddress: {
    id: string;
    linea_uno: string;
    complemento: string | null;
    barrio: string | null;
    localidad: string | null;
    ciudad: string | null;
    departamento: string | null;
    pais: string;
    codigo_postal: string | null;
    tipo_direccion: string | null;
    nombre_direccion: string | null;
    latitud: string | null;
    longitud: string | null;
    direccion_formateada: string | null;
    google_place_id: string | null;
    google_url: string | null;
  } | null;
  items: Array<{
    id: string;
    sku: string;
    nombre: string;
    desdetallada: string;
    cantidad: number;
    unit_price: string;
    tax: string;
    picture_url: string | null;
    categoria: string | null;
    cod_campana: string | null;
    skupostback: string;
    ean: string;
    codigo_market: string | null;
    bundle_id: string | null;
    bundle_product_sku: string | null;
  }>;
  beneficios: unknown;
  payment: {
    method: string | null;
    pse: { id: number; bank: string } | null;
    card: {
      installments: number;
      masked: string | null;
      franchise: string | null;
    } | null;
  };
  transactionAttempts: {
    pse: Array<PseAttempt>;
    card: Array<CardAttempt>;
  };
  envios: Array<{
    id: string;
    numero_guia: string;
    activo: boolean;
    tiempo_entrega_estimado: string | null;
    url_seguimiento: string | null;
    direccion_origen: string | null;
    costoEnvioBase: number | null;
    eventos: Array<{ evento: string; time_stamp: string }>;
    items: Array<{ sku: string; cantidad: number }>;
  }>;
  kiosk: {
    orden_id: string;
    kiosk_store_id: string;
    created_at: string;
    usuario_id: string | null;
    store_codigo: string | null;
    store_descripcion: string | null;
    store_ciudad: string | null;
    store_direccion: string | null;
    store_telefono: string | null;
    store_email: string;
    store_cod_bodega: string | null;
  } | null;
  pickup: {
    id: string;
    validado: boolean;
    entregado: boolean;
    codbodega: string;
    activa: boolean | null;
    hora_recogida_autorizada: string | null;
    updated_at: string | null;
  } | null;
  session: {
    clientIp: string | null;
    posthogSessionId: string | null;
    posthogCapturedAt: string | null;
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

export interface WhatsappMessage {
  message_id: string;
  template_name: string;
  recipient_phone: string;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  failed_at: string | null;
  error_code: number | null;
  error_title: string | null;
  body_text: string | null;
  header_media_url: string | null;
  variables: string[] | null;
  raw_payload: unknown;
  orden_id: string | null;
}

export interface EmailMessage {
  id: string;
  template_name: string;
  recipient_email: string;
  subject: string | null;
  cc: string | null;
  status: string;
  message_id: string | null;
  error_message: string | null;
  body_html: string | null;
  body_text: string | null;
  attachments: Array<{ filename: string; contentType?: string; size?: number }> | null;
  sent_at: string;
}

export interface PseAttempt {
  id: string;
  estado: string | null;
  cod_respuesta: number | null;
  respuesta: string | null;
  autorizacion: string | null;
  recibo: string | null;
  banco: string | null;
  urlbanco: string | null;
  tipo_doc: string | null;
  documento: string | null;
  nombres: string | null;
  apellidos: string | null;
  email: string | null;
  ip: string | null;
  ref_payco: string | null;
  transaction_id: string | null;
  factura: string | null;
  valor: string | null;
  fecha: string | null;
  raw_response: unknown;
  created_at: string;
}

export interface CardAttempt {
  id: string;
  estado: string | null;
  cod_respuesta: number | null;
  cod_error: string | null;
  respuesta: string | null;
  autorizacion: string | null;
  recibo: string | null;
  banco: string | null;
  franquicia: string | null;
  country_card: string | null;
  cc_network_code: string | null;
  cc_network_message: string | null;
  tipo_doc: string | null;
  documento: string | null;
  nombres: string | null;
  apellidos: string | null;
  email: string | null;
  ip: string | null;
  ref_payco: string | null;
  factura: string | null;
  valor: string | null;
  fecha: string | null;
  raw_response: unknown;
  created_at: string;
}

/**
 * Información de paginación
 */
export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Respuesta del endpoint GET /admin/orders
 */
export interface OrdersApiResponse {
  data: ApiOrder[];
  pagination: OrdersPagination;
}

/**
 * Parámetros de consulta para el endpoint
 */
export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  sortField?: OrderSortField;
  sortOrder?: SortOrder;
  search?: string;
  excludeTest?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Helper para obtener el label del estado
 */
export const getApiOrderStatusLabel = (status: ApiOrderStatus): string => {
  const labels: Record<ApiOrderStatus, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobada",
    CANCELLED: "Cancelada",
    REJECTED: "Rechazada",
    ABANDONED: "Abandonada",
    INTERNAL_ERROR: "Error Interno",
  };
  return labels[status] || status;
};

/**
 * Helper para obtener el color del badge según el estado
 * Retorna "outline" para usar colores personalizados
 */
export const getApiOrderStatusVariant = (
  status: ApiOrderStatus
): "default" | "secondary" | "destructive" | "outline" => {
  // Usamos outline para todos y aplicamos colores personalizados
  return "outline";
};

/**
 * Helper para obtener las clases de estilo del badge según el estado
 * Incluye colores de fondo, texto y borde para mejor visibilidad
 */
export const getApiOrderStatusColor = (status: ApiOrderStatus): string => {
  const colors: Record<ApiOrderStatus, string> = {
    PENDING:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    APPROVED:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
    CANCELLED:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-600",
    REJECTED:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    ABANDONED:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600",
    INTERNAL_ERROR:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

// ============================================
// Tipos para GET /admin/orders/metrics
// ============================================

/**
 * Métricas generales de órdenes
 */
export interface OrderMetrics {
  total_ordenes: number;
  total_ingresos: number;
  promedio_ingreso: number;
  tasa_entrega_porcentaje: number;
  total_recoger_en_tienda: number;
  total_pendientes: number;
  total_aprobadas: number;
  total_en_reparto: number;
  total_entregadas: number;
  total_canceladas: number;
}

/**
 * Distribución de órdenes por estado
 */
export interface StatusDistribution {
  cantidad: number;
  estado: string;
}

/**
 * Respuesta del endpoint GET /admin/orders/metrics
 */
export interface OrdersMetricsResponse {
  metrics: OrderMetrics;
  statusDistribution: StatusDistribution[];
}
