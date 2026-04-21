"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getOrders } from "@/services/orders";
import { useTestFilter } from "@/contexts/TestFilterContext";
import {
  ApiOrder,
  OrdersApiResponse,
  OrdersPagination,
  OrdersQueryParams,
} from "@/types/orders";

interface UseOrdersState {
  orders: ApiOrder[];
  pagination: OrdersPagination | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseOrdersReturn extends UseOrdersState {
  refetch: () => Promise<void>;
  setParams: (params: Partial<OrdersQueryParams>) => void;
  params: OrdersQueryParams;
}

/**
 * Obtiene el token de autenticación del localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

/**
 * Hook para obtener órdenes con paginación y filtros.
 *
 * Cada ejecución del efecto crea un `AbortController` nuevo. Cuando las
 * dependencias cambian (params/rango/filtro test), el cleanup aborta la
 * request anterior — así las respuestas obsoletas no pueden sobrescribir
 * el estado producido por la request más reciente. Ese era el origen del
 * patrón "data cargada + error banner simultáneos" que se veía cuando un
 * cambio rápido de estado disparaba dos fetches consecutivos.
 */
export function useOrders(
  initialParams: OrdersQueryParams = {},
  range?: { from: Date; to: Date }
): UseOrdersReturn {
  const { excludeTest } = useTestFilter();
  const [params, setParamsState] = useState<OrdersQueryParams>({
    page: 1,
    limit: 20,
    sortField: "serial_id",
    sortOrder: "desc",
    ...initialParams,
  });

  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    pagination: null,
    isLoading: true,
    error: null,
  });

  const rangeFromMs = range?.from.getTime();
  const rangeToMs = range?.to.getTime();
  const rangeFromIso = range?.from.toISOString();
  const rangeToIso = range?.to.toISOString();

  // Ref al controller actual, para que `refetch` pueda también cancelar.
  const controllerRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(
    async (signal: AbortSignal) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: OrdersApiResponse = await getOrders(
          {
            ...params,
            excludeTest,
            dateFrom: rangeFromIso,
            dateTo: rangeToIso,
          },
          { token: getAuthToken(), signal },
        );

        if (signal.aborted) return;

        setState({
          orders: response.data,
          pagination: response.pagination,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        // Request abortada por un re-fetch posterior: silencio total.
        if (signal.aborted || (err as Error)?.name === "AbortError") return;

        const error =
          err instanceof Error ? err : new Error("Error al obtener órdenes");
        setState((prev) => ({ ...prev, isLoading: false, error }));
      }
    },
    [params, excludeTest, rangeFromIso, rangeToIso],
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    void runFetch(controller.signal);
    return () => controller.abort();
  }, [runFetch]);

  // Reset page to 1 when filters toggle (avoid landing on an empty page)
  useEffect(() => {
    setParamsState((prev) => ({ ...prev, page: 1 }));
  }, [excludeTest, rangeFromMs, rangeToMs]);

  const setParams = useCallback((newParams: Partial<OrdersQueryParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
      // Reset to page 1 when search or sort changes
      page:
        newParams.search !== undefined ||
        newParams.sortField !== undefined ||
        newParams.sortOrder !== undefined
          ? 1
          : newParams.page ?? prev.page,
    }));
  }, []);

  const refetch = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    await runFetch(controller.signal);
  }, [runFetch]);

  return {
    ...state,
    refetch,
    setParams,
    params,
  };
}

/**
 * Hook simplificado que solo expone la función de fetch.
 * Útil para casos donde se necesita control manual.
 */
export function useOrdersFetch() {
  const fetchOrders = async (params: OrdersQueryParams = {}) => {
    return getOrders(params, { token: getAuthToken() });
  };

  return { fetchOrders };
}
