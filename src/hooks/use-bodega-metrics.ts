"use client";

import { apiGet } from "@/lib/api-client";

export interface BodegaAlerta {
  sku: string;
  solicitudes: number;
  ultima: string;
}

export interface BodegaActividad {
  numero_guia: string;
  evento: string;
  time_stamp: string;
}

export interface BodegaMetrics {
  alertas: BodegaAlerta[];
  actividad: BodegaActividad[];
  alertas_total: number;
}

function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  return localStorage.getItem("imagiq_token");
}

export function useBodegaMetrics() {
  const getMetrics = async () => {
    const token = getAuthToken();
    return await apiGet<BodegaMetrics>("/api/admin/bodega/metrics", {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };
  return { getMetrics };
}
