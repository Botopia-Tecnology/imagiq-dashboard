"use client";

import { apiGet } from "@/lib/api-client";
import { useTestFilter } from "@/contexts/TestFilterContext";
import { DashboardMetrics } from "@/types/dasboard";

function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  return localStorage.getItem("imagiq_token");
}

export type OrderType = "todos" | "ecommerce" | "soporte";

export function useDashboardMetrics(
  range?: { from: Date; to: Date },
  orderType?: OrderType
) {
  const { excludeTest } = useTestFilter();
  const getMetrics = async () => {
    const token = getAuthToken();
    const sp = new URLSearchParams();
    if (excludeTest) sp.set("excludeTest", "true");
    if (range) {
      sp.set("dateFrom", range.from.toISOString());
      sp.set("dateTo", range.to.toISOString());
    }
    if (orderType) sp.set("orderType", orderType);
    const query = sp.toString() ? `?${sp.toString()}` : "";
    return await apiGet<DashboardMetrics>(`/api/admin/metrics${query}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };
  return { getMetrics, excludeTest };
}
