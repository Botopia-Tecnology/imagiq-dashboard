"use client";

import { apiGet } from "@/lib/api-client";

export interface ClientesMetrics {
  total_clientes: number;
  clientes_activos: number;
  valor_promedio_cliente: number;
  tasa_retencion: number;
}

function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  return localStorage.getItem("imagiq_token");
}

export function useClientesMetrics() {
  const getMetrics = async () => {
    const token = getAuthToken();
    return await apiGet<ClientesMetrics>("/api/admin/clientes/metrics", {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };
  return { getMetrics };
}
