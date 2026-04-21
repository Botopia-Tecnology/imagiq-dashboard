"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderDetail } from "@/services/orders";
import { AdminOrderDetail } from "@/types/orders";

interface UseOrderDetailState {
  detail: AdminOrderDetail | null;
  isLoading: boolean;
  error: Error | null;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

export function useOrderDetail(orderId: string | null | undefined) {
  const [state, setState] = useState<UseOrderDetailState>({
    detail: null,
    isLoading: false,
    error: null,
  });

  const controllerRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(
    async (signal: AbortSignal) => {
      if (!orderId) {
        setState({ detail: null, isLoading: false, error: null });
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const detail = await getOrderDetail(orderId, {
          token: getAuthToken(),
          signal,
        });
        if (signal.aborted) return;
        setState({ detail, isLoading: false, error: null });
      } catch (err) {
        if (signal.aborted || (err as Error)?.name === "AbortError") return;
        const error =
          err instanceof Error ? err : new Error("Error al obtener detalle");
        setState({ detail: null, isLoading: false, error });
      }
    },
    [orderId],
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    void runFetch(controller.signal);
    return () => controller.abort();
  }, [runFetch]);

  const refetch = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    await runFetch(controller.signal);
  }, [runFetch]);

  return { ...state, refetch };
}
