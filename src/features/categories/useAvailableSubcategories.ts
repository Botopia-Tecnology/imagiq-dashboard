/**
 * Hook para manejar subcategorías disponibles de una categoría del backend
 * - Obtener subcategorías distintas del backend para una categoría
 * - Manejo de estado de carga y errores
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { subcategoryEndpoints } from "@/lib/api";

interface UseAvailableSubcategoriesReturn {
  availableSubcategories: string[];
  loading: boolean;
  error: string | null;
  refreshAvailableSubcategories: () => Promise<void>;
}

export const useAvailableSubcategories = (categoryName: string): UseAvailableSubcategoriesReturn => {
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener subcategorías disponibles del backend
  const fetchAvailableSubcategories = useCallback(async () => {
    if (!categoryName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subcategoryEndpoints.getDistinct(categoryName);

      if (response.success && response.data) {
        setAvailableSubcategories(response.data);
      } else {
        setError(response.message || "Error al cargar subcategorías disponibles");
      }
    } catch (err) {
      console.error("Error fetching available subcategories:", err);
      setError("Error de conexión al cargar subcategorías disponibles");
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  // Función para refrescar subcategorías disponibles
  const refreshAvailableSubcategories = useCallback(async () => {
    await fetchAvailableSubcategories();
  }, [fetchAvailableSubcategories]);

  // Cargar subcategorías al montar el componente o cuando cambia categoryName
  useEffect(() => {
    fetchAvailableSubcategories();
  }, [fetchAvailableSubcategories]);

  return {
    availableSubcategories,
    loading,
    error,
    refreshAvailableSubcategories,
  };
};
