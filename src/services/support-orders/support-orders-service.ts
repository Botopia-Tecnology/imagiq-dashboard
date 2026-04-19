/**
 * Servicio para gestión de órdenes de servicio técnico
 * Endpoints:
 * - GET /admin/support-orders
 * - GET /admin/support-orders/metrics
 */

import { apiGet } from "@/lib/api-client";
import {
  AdminSupportOrderDetail,
  SupportOrdersApiResponse,
  SupportOrdersQueryParams,
  SupportOrdersMetricsResponse,
} from "@/types/support-orders";

export async function getSupportOrderDetail(
  orderId: string,
  token?: string | null,
): Promise<AdminSupportOrderDetail> {
  return apiGet<AdminSupportOrderDetail>(
    `/api/admin/support-orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    },
  );
}

/**
 * Construye los query params para la petición
 */
function buildQueryString(params: SupportOrdersQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.sortField) {
    searchParams.set("sortField", params.sortField);
  }
  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.excludeTest) {
    searchParams.set("excludeTest", "true");
  }
  if (params.dateFrom) {
    searchParams.set("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    searchParams.set("dateTo", params.dateTo);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Obtiene la lista paginada de órdenes de soporte
 */
export async function getSupportOrders(
  params: SupportOrdersQueryParams = {},
  token?: string | null
): Promise<SupportOrdersApiResponse> {
  const queryString = buildQueryString(params);
  const endpoint = `/api/admin/support-orders${queryString}`;

  return apiGet<SupportOrdersApiResponse>(endpoint, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

/**
 * Obtiene las métricas de órdenes de soporte
 */
export async function getSupportOrdersMetrics(
  token?: string | null,
  options?: { excludeTest?: boolean; dateFrom?: string; dateTo?: string }
): Promise<SupportOrdersMetricsResponse> {
  const sp = new URLSearchParams();
  if (options?.excludeTest) sp.set("excludeTest", "true");
  if (options?.dateFrom) sp.set("dateFrom", options.dateFrom);
  if (options?.dateTo) sp.set("dateTo", options.dateTo);
  const query = sp.toString() ? `?${sp.toString()}` : "";
  return apiGet<SupportOrdersMetricsResponse>(
    `/api/admin/support-orders/metrics${query}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
}
