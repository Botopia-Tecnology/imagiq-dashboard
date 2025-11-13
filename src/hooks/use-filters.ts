"use client";

import { useState, useEffect, useCallback } from "react";
import { DynamicFilter } from "@/types/filters";
import { filterEndpoints } from "@/lib/api";
import { toast } from "sonner";

interface CreateFilterData {
  sectionName: string;
  column: string;
  operator?: string;
  operatorMode: "column" | "per-value";
  valueConfig: DynamicFilter["valueConfig"];
  displayType: string;
  scope: DynamicFilter["scope"];
  order: DynamicFilter["order"];
  isActive: boolean;
}

interface UseFiltersReturn {
  filters: DynamicFilter[];
  isLoading: boolean;
  error: string | null;
  refreshFilters: () => Promise<void>;
  createFilter: (data: CreateFilterData) => Promise<DynamicFilter | null>;
  updateFilter: (id: string, data: Partial<CreateFilterData>) => Promise<DynamicFilter | null>;
  deleteFilter: (id: string) => Promise<boolean>;
  deleteBulk: (filterIds: string[]) => Promise<boolean>;
}

export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<DynamicFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert date strings to Date objects
  const parseFilterDates = (filter: any): DynamicFilter => {
    return {
      ...filter,
      createdAt: filter.createdAt ? new Date(filter.createdAt) : new Date(),
      updatedAt: filter.updatedAt ? new Date(filter.updatedAt) : new Date(),
    };
  };

  // Fetch all filters
  const fetchFilters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await filterEndpoints.getAll();
      
      // Handle nested response structure: { success: true, data: [...] }
      // The API client wraps it, so we get: response.data = { success: true, data: [...] }
      let filtersArray: any[] = [];
      
      if (response.success && response.data) {
        // Check if response.data is directly an array
        if (Array.isArray(response.data)) {
          filtersArray = response.data;
        } 
        // Check if response.data has a nested data property (backend response structure)
        else if (response.data.data && Array.isArray(response.data.data)) {
          filtersArray = response.data.data;
        }
        // Check if response.data is an object with success and data
        else if (typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
          filtersArray = (response.data as any).data;
        }
      }
      
      if (filtersArray.length > 0 || (response.success && filtersArray.length === 0)) {
        const filtersWithDates = filtersArray.map(parseFilterDates);
        setFilters(filtersWithDates);
      } else {
        const errorMsg = response.message || "Error al cargar los filtros";
        setError(errorMsg);
        console.error("Failed to fetch filters from API", { response });
      }
    } catch (err) {
      const errorMsg = "Error de conexión al cargar los filtros";
      setError(errorMsg);
      console.error("Error fetching filters:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load filters on mount
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Refresh filters
  const refreshFilters = useCallback(async () => {
    await fetchFilters();
  }, [fetchFilters]);

  // Create filter
  const createFilter = useCallback(async (data: CreateFilterData): Promise<DynamicFilter | null> => {
    try {
      const response = await filterEndpoints.create(data);
      
      if (response.success && response.data) {
        const newFilter = parseFilterDates(response.data);
        setFilters((prev) => [...prev, newFilter]);
        toast.success(response.message || "Filtro creado correctamente");
        return newFilter;
      } else {
        const errorMsg = response.message || "Error al crear el filtro";
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = "Error de conexión al crear el filtro";
      toast.error(errorMsg);
      console.error("Error creating filter:", err);
      return null;
    }
  }, []);

  // Update filter
  const updateFilter = useCallback(async (id: string, data: Partial<CreateFilterData>): Promise<DynamicFilter | null> => {
    try {
      const response = await filterEndpoints.update(id, data);
      
      if (response.success && response.data) {
        const updatedFilter = parseFilterDates(response.data);
        setFilters((prev) => prev.map((f) => (f.id === id ? updatedFilter : f)));
        toast.success(response.message || "Filtro actualizado correctamente");
        return updatedFilter;
      } else {
        const errorMsg = response.message || "Error al actualizar el filtro";
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = "Error de conexión al actualizar el filtro";
      toast.error(errorMsg);
      console.error("Error updating filter:", err);
      return null;
    }
  }, []);

  // Delete filter
  const deleteFilter = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await filterEndpoints.delete(id);
      
      if (response.success) {
        setFilters((prev) => prev.filter((f) => f.id !== id));
        toast.success(response.message || "Filtro eliminado correctamente");
        return true;
      } else {
        const errorMsg = response.message || "Error al eliminar el filtro";
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = "Error de conexión al eliminar el filtro";
      toast.error(errorMsg);
      console.error("Error deleting filter:", err);
      return false;
    }
  }, []);

  // Delete multiple filters
  const deleteBulk = useCallback(async (filterIds: string[]): Promise<boolean> => {
    if (filterIds.length === 0) return false;
    
    try {
      const response = await filterEndpoints.deleteBulk({ filterIds });
      
      if (response.success) {
        setFilters((prev) => prev.filter((f) => !filterIds.includes(f.id)));
        const deletedCount = response.data?.deletedCount || filterIds.length;
        toast.success(response.message || `${deletedCount} filtro(s) eliminado(s) correctamente`);
        return true;
      } else {
        const errorMsg = response.message || "Error al eliminar los filtros";
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = "Error de conexión al eliminar los filtros";
      toast.error(errorMsg);
      console.error("Error deleting filters:", err);
      return false;
    }
  }, []);

  return {
    filters,
    isLoading,
    error,
    refreshFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    deleteBulk,
  };
}

