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
import { WebsiteCategory, CreateCategoryRequest } from "@/types";

interface UseCategoriesReturn {
  categories: WebsiteCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  toggleCategoryActive: (categoryId: string) => Promise<void>;
  deleteCategory: (categoryId: string) => void;
  updatingCategory: string | null; // Para mostrar loading en categoría específica
  createCategory: (data: CreateCategoryRequest) => Promise<boolean>;
  creatingCategory: boolean; // Para mostrar loading al crear categoría
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<WebsiteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

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
  const toggleCategoryActive = useCallback(async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    setUpdatingCategory(categoryId);
    setError(null);

    try {
      const newActiveStatus = !category.isActive;
      const response = await categoryEndpoints.updateActiveStatus(categoryId, newActiveStatus);

      if (response.success) {
        // Actualizar el estado local solo si la petición fue exitosa
        setCategories(prev =>
          prev.map(cat =>
            cat.id === categoryId ? { ...cat, isActive: newActiveStatus } : cat
          )
        );
      } else {
        setError(response.message || "Error al actualizar el estado de la categoría");
      }
    } catch (err) {
      console.error("Error updating category status:", err);
      setError("Error de conexión al actualizar la categoría");
    } finally {
      setUpdatingCategory(null);
    }
  }, [categories]);

  // Función para eliminar una categoría
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // Función para crear una nueva categoría
  const createCategory = useCallback(async (data: CreateCategoryRequest): Promise<boolean> => {
    setCreatingCategory(true);
    setError(null);

    try {
      const response = await categoryEndpoints.create(data);

      if (response.success && response.data) {
        // Agregar la nueva categoría al estado local
        const newCategory = mapBackendCategoriesToFrontend([response.data])[0];
        setCategories(prev => [...prev, newCategory]);
        return true;
      } else {
        setError(response.message || "Error al crear la categoría");
        return false;
      }
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Error de conexión al crear la categoría");
      return false;
    } finally {
      setCreatingCategory(false);
    }
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
    updatingCategory,
    createCategory,
    creatingCategory,
  };
};
