"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getOrdersMetrics } from "@/services/orders";
import { useTestFilter } from "@/contexts/TestFilterContext";
import {
  OrderMetrics,
  OrdersMetricsResponse,
  StatusDistribution,
} from "@/types/orders";

interface UseOrdersMetricsState {
  metrics: OrderMetrics | null;
  statusDistribution: StatusDistribution[];
  isLoading: boolean;
  error: Error | null;
}

interface UseOrdersMetricsReturn extends UseOrdersMetricsState {
  refetch: () => Promise<void>;
}

/**
 * Obtiene el token de autenticación del localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

/**
 * Hook para obtener métricas de órdenes.
 *
 * Usa `AbortController` para cancelar cualquier request en vuelo cuando las
 * dependencias (rango/filtro test) cambian. Así las respuestas obsoletas nunca
 * pueden sobrescribir el estado más reciente — especialmente importante en
 * este hook donde el antes existente "error banner sobre data ya cargada" era
 * síntoma directo de una race de dos fetches.
 */
export function useOrdersMetrics(
  range?: { from: Date; to: Date },
): UseOrdersMetricsReturn {
  const { excludeTest } = useTestFilter();
  const rangeFromIso = range?.from.toISOString();
  const rangeToIso = range?.to.toISOString();

  const [state, setState] = useState<UseOrdersMetricsState>({
    metrics: null,
    statusDistribution: [],
    isLoading: true,
    error: null,
  });

  const controllerRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(
    async (signal: AbortSignal) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: OrdersMetricsResponse = await getOrdersMetrics({
          token: getAuthToken(),
          signal,
          excludeTest,
          dateFrom: rangeFromIso,
          dateTo: rangeToIso,
        });

        if (signal.aborted) return;

        setState({
          metrics: response.metrics,
          statusDistribution: response.statusDistribution,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (signal.aborted || (err as Error)?.name === "AbortError") return;

        const error =
          err instanceof Error ? err : new Error("Error al obtener métricas");
        setState((prev) => ({ ...prev, isLoading: false, error }));
      }
    },
    [excludeTest, rangeFromIso, rangeToIso],
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

  return {
    ...state,
    refetch,
  };
}
