/**
 * Hook para manejar menús disponibles de una categoría del backend
 * - Obtener menús distintos del backend para una categoría
 * - Manejo de estado de carga y errores
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { menuEndpoints } from "@/lib/api";

interface UseAvailableMenusReturn {
  availableMenus: string[];
  loading: boolean;
  error: string | null;
  refreshAvailableMenus: () => Promise<void>;
}

export const useAvailableMenus = (categoryName: string): UseAvailableMenusReturn => {
  const [availableMenus, setAvailableMenus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener menús disponibles del backend
  const fetchAvailableMenus = useCallback(async () => {
    if (!categoryName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await menuEndpoints.getDistinct(categoryName);

      if (response.success) {
        // Si la respuesta es exitosa, usar los datos (puede ser un array vacío)
        setAvailableMenus(response.data || []);
      } else {
        // Solo marcar error si la petición falla, no si simplemente no hay datos
        setError(response.message || "Error al cargar menús disponibles");
        setAvailableMenus([]);
      }
    } catch (err) {
      console.error("Error fetching available menus:", err);
      setError("Error de conexión al cargar menús disponibles");
      setAvailableMenus([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  // Función para refrescar menús disponibles
  const refreshAvailableMenus = useCallback(async () => {
    await fetchAvailableMenus();
  }, [fetchAvailableMenus]);

  // Cargar menús al montar el componente o cuando cambia categoryName
  useEffect(() => {
    fetchAvailableMenus();
  }, [fetchAvailableMenus]);

  return {
    availableMenus,
    loading,
    error,
    refreshAvailableMenus,
  };
};
