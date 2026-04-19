"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupportOrderDetail } from "@/services/support-orders";
import { AdminSupportOrderDetail } from "@/types/support-orders";

interface UseSupportOrderDetailState {
  detail: AdminSupportOrderDetail | null;
  isLoading: boolean;
  error: Error | null;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

export function useSupportOrderDetail(orderId: string | null | undefined) {
  const [state, setState] = useState<UseSupportOrderDetailState>({
    detail: null,
    isLoading: false,
    error: null,
  });

  const fetchDetail = useCallback(async () => {
    if (!orderId) {
      setState({ detail: null, isLoading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const token = getAuthToken();
      const detail = await getSupportOrderDetail(orderId, token);
      setState({ detail, isLoading: false, error: null });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error al obtener detalle");
      setState({ detail: null, isLoading: false, error });
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { ...state, refetch: fetchDetail };
}
