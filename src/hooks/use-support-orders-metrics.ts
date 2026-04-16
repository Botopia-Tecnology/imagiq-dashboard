"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupportOrdersMetrics } from "@/services/support-orders";
import { useTestFilter } from "@/contexts/TestFilterContext";
import {
  SupportOrderMetrics,
  SupportOrdersMetricsResponse,
  SupportStatusDistribution,
  SupportPaymentDistribution,
} from "@/types/support-orders";

interface UseSupportOrdersMetricsState {
  metrics: SupportOrderMetrics | null;
  statusDistribution: SupportStatusDistribution[];
  paymentMethodDistribution: SupportPaymentDistribution[];
  isLoading: boolean;
  error: Error | null;
}

interface UseSupportOrdersMetricsReturn extends UseSupportOrdersMetricsState {
  refetch: () => Promise<void>;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("imagiq_token");
}

export function useSupportOrdersMetrics(
  range?: { from: Date; to: Date }
): UseSupportOrdersMetricsReturn {
  const { excludeTest } = useTestFilter();
  const rangeFromMs = range?.from.getTime();
  const rangeToMs = range?.to.getTime();
  const [state, setState] = useState<UseSupportOrdersMetricsState>({
    metrics: null,
    statusDistribution: [],
    paymentMethodDistribution: [],
    isLoading: true,
    error: null,
  });

  const fetchMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = getAuthToken();
      const response: SupportOrdersMetricsResponse =
        await getSupportOrdersMetrics(token, {
          excludeTest,
          dateFrom: range ? range.from.toISOString() : undefined,
          dateTo: range ? range.to.toISOString() : undefined,
        });

      setState({
        metrics: response.metrics,
        statusDistribution: response.statusDistribution,
        paymentMethodDistribution: response.paymentMethodDistribution,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Error al obtener métricas de soporte");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeTest, rangeFromMs, rangeToMs]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  return {
    ...state,
    refetch,
  };
}
