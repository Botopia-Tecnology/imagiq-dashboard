"use client";

import { apiGet } from "@/lib/api-client";

export interface CampaignMetrics {
  campanas: number;
  campanas_enviadas: number;
  destinatarios: number;
  abiertos: number;
  con_click: number;
  tasa_apertura: number;
  ctr: number;
}

function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  return localStorage.getItem("imagiq_token");
}

export function useCampaignMetrics() {
  const getMetrics = async () => {
    const token = getAuthToken();
    return await apiGet<CampaignMetrics>("/api/admin/campaigns/metrics", {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };
  return { getMetrics };
}
