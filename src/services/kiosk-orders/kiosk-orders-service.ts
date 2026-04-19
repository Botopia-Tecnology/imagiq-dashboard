/**
 * Servicio para gestión de órdenes kiosko.
 * Endpoints:
 * - GET /admin/kiosk-orders
 * - GET /admin/kiosk-orders/metrics
 */

import { apiGet } from "@/lib/api-client";
import {
  KioskOrdersApiResponse,
  KioskOrdersMetricsResponse,
  KioskOrdersQueryParams,
} from "@/types/kiosk-orders";

function buildQueryString(params: KioskOrdersQueryParams): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", params.page.toString());
  if (params.limit) sp.set("limit", params.limit.toString());
  if (params.sortField) sp.set("sortField", params.sortField);
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params.search) sp.set("search", params.search);
  if (params.excludeTest) sp.set("excludeTest", "true");
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.storeId) sp.set("storeId", params.storeId);
  if (params.estado) sp.set("estado", params.estado);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function getKioskOrders(
  params: KioskOrdersQueryParams = {},
  token?: string | null,
): Promise<KioskOrdersApiResponse> {
  const qs = buildQueryString(params);
  return apiGet<KioskOrdersApiResponse>(`/api/admin/kiosk-orders${qs}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export async function getKioskOrdersMetrics(
  token?: string | null,
  options?: { excludeTest?: boolean; dateFrom?: string; dateTo?: string },
): Promise<KioskOrdersMetricsResponse> {
  const sp = new URLSearchParams();
  if (options?.excludeTest) sp.set("excludeTest", "true");
  if (options?.dateFrom) sp.set("dateFrom", options.dateFrom);
  if (options?.dateTo) sp.set("dateTo", options.dateTo);
  const query = sp.toString() ? `?${sp.toString()}` : "";
  return apiGet<KioskOrdersMetricsResponse>(
    `/api/admin/kiosk-orders/metrics${query}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    },
  );
}
