"use client";

import { useState, useEffect } from "react";
import { DisplayTypesResponse, FilterOperator } from "@/types/filters";
import { productEndpoints } from "@/lib/api";

interface UseDisplayTypesParams {
  columnKey: string;
  operator?: FilterOperator;
}

interface UseDisplayTypesReturn {
  displayTypes: DisplayTypesResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useDisplayTypes({ columnKey, operator }: UseDisplayTypesParams): UseDisplayTypesReturn {
  const [displayTypes, setDisplayTypes] = useState<DisplayTypesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!columnKey) {
      setDisplayTypes(null);
      setError(null);
      return;
    }

    const fetchDisplayTypes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productEndpoints.getDisplayTypes(columnKey, operator);
        
        if (response.success && response.data) {
          setDisplayTypes(response.data);
        } else {
          const errorMsg = response.message || "Error al cargar los tipos de visualización";
          setError(errorMsg);
          console.error("Failed to fetch display types from API");
        }
      } catch (err) {
        const errorMsg = "Error de conexión al cargar los tipos de visualización";
        setError(errorMsg);
        console.error("Error fetching display types:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisplayTypes();
  }, [columnKey, operator]);

  return { displayTypes, isLoading, error };
}

