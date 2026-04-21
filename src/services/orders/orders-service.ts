/**
 * Servicio para gestión de órdenes
 * Endpoints:
 * - GET /admin/orders
 * - GET /admin/orders/:id
 * - GET /admin/orders/metrics
 */

import { apiGet } from "@/lib/api-client";
import {
  AdminOrderDetail,
  OrdersApiResponse,
  OrdersQueryParams,
  OrdersMetricsResponse,
} from "@/types/orders";

/** Opciones comunes de red: token JWT y señal de cancelación. */
export interface RequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

/**
 * Construye los query params para la petición
 */
function buildQueryString(params: OrdersQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.search) searchParams.set("search", params.search);
  if (params.excludeTest) searchParams.set("excludeTest", "true");
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function authHeader(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Obtiene la lista paginada de órdenes
 *
 * @example
 * const { data, pagination } = await getOrders(
 *   { page: 1, limit: 20, sortField: 'fecha_creacion', sortOrder: 'desc' },
 *   { token, signal },
 * );
 */
export async function getOrders(
  params: OrdersQueryParams = {},
  options: RequestOptions = {},
): Promise<OrdersApiResponse> {
  const endpoint = `/api/admin/orders${buildQueryString(params)}`;
  return apiGet<OrdersApiResponse>(endpoint, {
    headers: authHeader(options.token),
    signal: options.signal,
  });
}

/**
 * Obtiene el detalle de una orden específica para el panel admin.
 */
export async function getOrderDetail(
  orderId: string,
  options: RequestOptions = {},
): Promise<AdminOrderDetail> {
  return apiGet<AdminOrderDetail>(
    `/api/admin/orders/${encodeURIComponent(orderId)}`,
    {
      headers: authHeader(options.token),
      signal: options.signal,
    },
  );
}

/**
 * Obtiene las métricas agregadas de órdenes (totales, distribución por estado).
 *
 * @example
 * const { metrics, statusDistribution } = await getOrdersMetrics({
 *   token, signal, excludeTest: true,
 * });
 */
export async function getOrdersMetrics(
  options: RequestOptions & {
    excludeTest?: boolean;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<OrdersMetricsResponse> {
  const sp = new URLSearchParams();
  if (options.excludeTest) sp.set("excludeTest", "true");
  if (options.dateFrom) sp.set("dateFrom", options.dateFrom);
  if (options.dateTo) sp.set("dateTo", options.dateTo);
  const query = sp.toString() ? `?${sp.toString()}` : "";
  return apiGet<OrdersMetricsResponse>(`/api/admin/orders/metrics${query}`, {
    headers: authHeader(options.token),
    signal: options.signal,
  });
}
