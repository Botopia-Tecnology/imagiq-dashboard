/**
 * Hook para manejo de subcategorías de una categoría específica
 * - Obtener subcategorías visibles de una categoría del backend
 * - Manejo de estado de carga y errores
 * - Funciones para actualizar subcategorías
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { subcategoryEndpoints } from "@/lib/api";
import { mapBackendSubcategoriesToFrontend } from "@/lib/categoryMapper";
import { WebsiteSubcategory, CreateSubcategoryRequest, UpdateSubcategoryRequest } from "@/types";

interface UseSubcategoriesReturn {
  subcategories: WebsiteSubcategory[];
  loading: boolean;
  error: string | null;
  refreshSubcategories: () => Promise<void>;
  toggleSubcategoryActive: (subcategoryId: string) => Promise<void>;
  deleteSubcategory: (subcategoryId: string) => Promise<boolean>;
  updatingSubcategory: string | null;
  deletingSubcategory: boolean;
  createSubcategory: (data: CreateSubcategoryRequest) => Promise<boolean>;
  creatingSubcategory: boolean;
  updateSubcategory: (subcategoryId: string, data: UpdateSubcategoryRequest) => Promise<boolean>;
  updatingSubcategoryData: boolean;
}

export const useSubcategories = (categoryId: string): UseSubcategoriesReturn => {
  const [subcategories, setSubcategories] = useState<WebsiteSubcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingSubcategory, setUpdatingSubcategory] = useState<string | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState(false);
  const [creatingSubcategory, setCreatingSubcategory] = useState(false);
  const [updatingSubcategoryData, setUpdatingSubcategoryData] = useState(false);

  // Función para obtener subcategorías del backend
  const fetchSubcategories = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subcategoryEndpoints.getByCategory(categoryId);

      if (response.success && response.data) {
        const mappedSubcategories = mapBackendSubcategoriesToFrontend(response.data, categoryId);
        setSubcategories(mappedSubcategories);
      } else {
        setError(response.message || "Error al cargar subcategorías");
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setError("Error de conexión al cargar subcategorías");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Función para refrescar subcategorías
  const refreshSubcategories = useCallback(async () => {
    await fetchSubcategories();
  }, [fetchSubcategories]);

  // Función para cambiar el estado activo de una subcategoría
  const toggleSubcategoryActive = useCallback(async (subcategoryId: string) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return;

    setUpdatingSubcategory(subcategoryId);
    setError(null);

    try {
      const newActiveStatus = !subcategory.isActive;
      const response = await subcategoryEndpoints.updateActiveStatus(subcategoryId, newActiveStatus);

      if (response.success) {
        setSubcategories(prev =>
          prev.map(sub =>
            sub.id === subcategoryId ? { ...sub, isActive: newActiveStatus } : sub
          )
        );
      } else {
        setError(response.message || "Error al actualizar el estado de la subcategoría");
      }
    } catch (err) {
      console.error("Error updating subcategory status:", err);
      setError("Error de conexión al actualizar la subcategoría");
    } finally {
      setUpdatingSubcategory(null);
    }
  }, [subcategories]);

  // Función para eliminar una subcategoría
  const deleteSubcategory = useCallback(async (subcategoryId: string): Promise<boolean> => {
    setDeletingSubcategory(true);

    try {
      console.log("Deleting subcategory with ID:", subcategoryId);
      const response = await subcategoryEndpoints.delete(subcategoryId);
      console.log("Delete response:", response);

      if (response.success) {
        setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
        return true;
      } else {
        console.error("Delete failed:", response.message);
        return false;
      }
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      return false;
    } finally {
      setDeletingSubcategory(false);
    }
  }, []);

  // Función para crear una nueva subcategoría
  const createSubcategory = useCallback(async (data: CreateSubcategoryRequest): Promise<boolean> => {
    setCreatingSubcategory(true);
    setError(null);

    try {
      // Agregar el categoriasVisiblesId al objeto data
      const subcategoryData = {
        ...data,
        categoriasVisiblesId: categoryId
      };

      const response = await subcategoryEndpoints.create(subcategoryData);

      if (response.success && response.data) {
        const newSubcategory = mapBackendSubcategoriesToFrontend([response.data], categoryId)[0];
        setSubcategories(prev => [...prev, newSubcategory]);
        return true;
      } else {
        setError(response.message || "Error al crear la subcategoría");
        return false;
      }
    } catch (err) {
      console.error("Error creating subcategory:", err);
      setError("Error de conexión al crear la subcategoría");
      return false;
    } finally {
      setCreatingSubcategory(false);
    }
  }, [categoryId]);

  // Función para actualizar una subcategoría
  const updateSubcategory = useCallback(async (subcategoryId: string, data: UpdateSubcategoryRequest): Promise<boolean> => {
    setUpdatingSubcategoryData(true);
    setError(null);

    try {
      const response = await subcategoryEndpoints.update(subcategoryId, data);

      if (response.success && response.data) {
        const updatedSubcategory = mapBackendSubcategoriesToFrontend([response.data], categoryId)[0];
        setSubcategories(prev =>
          prev.map(sub =>
            sub.id === subcategoryId ? updatedSubcategory : sub
          )
        );
        return true;
      } else {
        setError(response.message || "Error al actualizar la subcategoría");
        return false;
      }
    } catch (err) {
      console.error("Error updating subcategory:", err);
      setError("Error de conexión al actualizar la subcategoría");
      return false;
    } finally {
      setUpdatingSubcategoryData(false);
    }
  }, [categoryId]);

  // Cargar subcategorías al montar el componente o cuando cambia categoryId
  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  return {
    subcategories,
    loading,
    error,
    refreshSubcategories,
    toggleSubcategoryActive,
    deleteSubcategory,
    updatingSubcategory,
    deletingSubcategory,
    createSubcategory,
    creatingSubcategory,
    updateSubcategory,
    updatingSubcategoryData,
  };
};
