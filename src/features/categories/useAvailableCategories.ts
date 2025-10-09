/**
 * Hook para manejar categorías disponibles del backend
 * - Obtener categorías distintas del backend
 * - Manejo de estado de carga y errores
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { categoryEndpoints } from "@/lib/api";

interface UseAvailableCategoriesReturn {
  availableCategories: string[];
  loading: boolean;
  error: string | null;
  refreshAvailableCategories: () => Promise<void>;
}

export const useAvailableCategories = (): UseAvailableCategoriesReturn => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener categorías disponibles del backend
  const fetchAvailableCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryEndpoints.getDistinct();

      if (response.success && response.data) {
        setAvailableCategories(response.data);
      } else {
        setError(response.message || "Error al cargar categorías disponibles");
      }
    } catch (err) {
      console.error("Error fetching available categories:", err);
      setError("Error de conexión al cargar categorías disponibles");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar categorías disponibles
  const refreshAvailableCategories = useCallback(async () => {
    await fetchAvailableCategories();
  }, [fetchAvailableCategories]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchAvailableCategories();
  }, [fetchAvailableCategories]);

  return {
    availableCategories,
    loading,
    error,
    refreshAvailableCategories,
  };
};
