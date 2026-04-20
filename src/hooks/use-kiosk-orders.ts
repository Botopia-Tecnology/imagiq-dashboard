"use client";

import { useState, useEffect, useCallback } from "react";
import { getKioskOrders, getKioskOrdersMetrics } from "@/services/kiosk-orders/kiosk-orders-service";
import { useTestFilter } from "@/contexts/TestFilterContext";
import {
  KioskOrder,
  KioskOrdersApiResponse,
  KioskOrdersPagination,
  KioskOrdersQueryParams,
  KioskOrdersMetrics,
  KioskStoreDistribution,
} from "@/types/kiosk-orders";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

interface UseKioskOrdersState {
  orders: KioskOrder[];
  pagination: KioskOrdersPagination | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseKioskOrdersReturn extends UseKioskOrdersState {
  refetch: () => Promise<void>;
  setParams: (params: Partial<KioskOrdersQueryParams>) => void;
  params: KioskOrdersQueryParams;
}

export function useKioskOrders(
  initialParams: KioskOrdersQueryParams = {},
  range?: { from: Date; to: Date },
): UseKioskOrdersReturn {
  const { excludeTest } = useTestFilter();
  const [params, setParamsState] = useState<KioskOrdersQueryParams>({
    page: 1,
    limit: 20,
    sortField: "fecha_creacion",
    sortOrder: "desc",
    ...initialParams,
  });

  const [state, setState] = useState<UseKioskOrdersState>({
    orders: [],
    pagination: null,
    isLoading: true,
    error: null,
  });

  const rangeFromMs = range?.from.getTime();
  const rangeToMs = range?.to.getTime();

  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const token = getAuthToken();
      const response: KioskOrdersApiResponse = await getKioskOrders(
        {
          ...params,
          excludeTest,
          dateFrom: range ? range.from.toISOString() : undefined,
          dateTo: range ? range.to.toISOString() : undefined,
        },
        token,
      );
      setState({
        orders: response.data,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error al obtener órdenes kiosko");
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, excludeTest, rangeFromMs, rangeToMs]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setParamsState((prev) => ({ ...prev, page: 1 }));
  }, [excludeTest, rangeFromMs, rangeToMs]);

  const setParams = useCallback((newParams: Partial<KioskOrdersQueryParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
      page:
        newParams.search !== undefined ||
        newParams.sortField !== undefined ||
        newParams.sortOrder !== undefined ||
        newParams.storeId !== undefined ||
        newParams.estado !== undefined
          ? 1
          : newParams.page ?? prev.page,
    }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  return { ...state, refetch, setParams, params };
}

interface UseKioskMetricsState {
  metrics: KioskOrdersMetrics;
  storeDistribution: KioskStoreDistribution[];
  isLoading: boolean;
  error: Error | null;
}

const EMPTY_METRICS: KioskOrdersMetrics = {
  total_ordenes: 0,
  total_ingresos: 0,
  total_aprobadas: 0,
  total_pendientes: 0,
  total_rechazadas: 0,
};

export function useKioskOrdersMetrics(range?: { from: Date; to: Date }) {
  const { excludeTest } = useTestFilter();
  const [state, setState] = useState<UseKioskMetricsState>({
    metrics: EMPTY_METRICS,
    storeDistribution: [],
    isLoading: true,
    error: null,
  });

  const rangeFromMs = range?.from.getTime();
  const rangeToMs = range?.to.getTime();

  const fetchMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const token = getAuthToken();
      const response = await getKioskOrdersMetrics(token, {
        excludeTest,
        dateFrom: range ? range.from.toISOString() : undefined,
        dateTo: range ? range.to.toISOString() : undefined,
      });
      setState({
        metrics: response.metrics,
        storeDistribution: response.storeDistribution,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error al obtener métricas");
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeTest, rangeFromMs, rangeToMs]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { ...state, refetch: fetchMetrics };
}
