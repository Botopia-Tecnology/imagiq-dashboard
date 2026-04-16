"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupportOrders } from "@/services/support-orders";
import { useTestFilter } from "@/contexts/TestFilterContext";
import {
  SupportOrder,
  SupportOrdersApiResponse,
  SupportOrdersPagination,
  SupportOrdersQueryParams,
} from "@/types/support-orders";

interface UseSupportOrdersState {
  orders: SupportOrder[];
  pagination: SupportOrdersPagination | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseSupportOrdersReturn extends UseSupportOrdersState {
  refetch: () => Promise<void>;
  setParams: (params: Partial<SupportOrdersQueryParams>) => void;
  params: SupportOrdersQueryParams;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

export function useSupportOrders(
  initialParams: SupportOrdersQueryParams = {},
  range?: { from: Date; to: Date }
): UseSupportOrdersReturn {
  const { excludeTest } = useTestFilter();
  const [params, setParamsState] = useState<SupportOrdersQueryParams>({
    page: 1,
    limit: 20,
    sortField: "fecha_creacion",
    sortOrder: "desc",
    ...initialParams,
  });

  const [state, setState] = useState<UseSupportOrdersState>({
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
      const response: SupportOrdersApiResponse = await getSupportOrders(
        {
          ...params,
          excludeTest,
          dateFrom: range ? range.from.toISOString() : undefined,
          dateTo: range ? range.to.toISOString() : undefined,
        },
        token
      );

      setState({
        orders: response.data,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Error al obtener órdenes de soporte");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, excludeTest, rangeFromMs, rangeToMs]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setParamsState((prev) => ({ ...prev, page: 1 }));
  }, [excludeTest, rangeFromMs, rangeToMs]);

  const setParams = useCallback((newParams: Partial<SupportOrdersQueryParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
      page:
        newParams.search !== undefined ||
        newParams.sortField !== undefined ||
        newParams.sortOrder !== undefined
          ? 1
          : newParams.page ?? prev.page,
    }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  return {
    ...state,
    refetch,
    setParams,
    params,
  };
}
