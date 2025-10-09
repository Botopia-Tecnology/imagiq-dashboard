/**
 * Hook para manejo de categorías del sitio web
 * - Obtener categorías visibles del backend
 * - Manejo de estado de carga y errores
 * - Funciones para actualizar categorías
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { categoryEndpoints } from "@/lib/api";
import { mapBackendCategoriesToFrontend } from "@/lib/categoryMapper";
import { WebsiteCategory } from "@/types";

interface UseCategoriesReturn {
  categories: WebsiteCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  toggleCategoryActive: (categoryId: string) => void;
  deleteCategory: (categoryId: string) => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<WebsiteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener categorías del backend
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryEndpoints.getVisible();

      if (response.success && response.data) {
        const mappedCategories = mapBackendCategoriesToFrontend(response.data);
        setCategories(mappedCategories);
      } else {
        setError(response.message || "Error al cargar categorías");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Error de conexión al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar categorías
  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  // Función para cambiar el estado activo de una categoría
  const toggleCategoryActive = useCallback((categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  }, []);

  // Función para eliminar una categoría
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories,
    toggleCategoryActive,
    deleteCategory,
  };
};
