/**
 * Hook para manejo de submenús de un menú específico
 * - Obtener submenús visibles de un menú del backend
 * - Manejo de estado de carga y errores
 * - Funciones para actualizar submenús
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { submenuEndpoints } from "@/lib/api";
import { mapBackendSubmenusToFrontend } from "@/lib/categoryMapper";
import { WebsiteSubmenu, CreateSubmenuRequest, UpdateSubmenuRequest } from "@/types";

interface UseSubmenusReturn {
  submenus: WebsiteSubmenu[];
  loading: boolean;
  error: string | null;
  refreshSubmenus: () => Promise<void>;
  toggleSubmenuActive: (submenuId: string) => Promise<void>;
  deleteSubmenu: (submenuId: string) => Promise<boolean>;
  updatingSubmenu: string | null;
  deletingSubmenu: boolean;
  createSubmenu: (data: CreateSubmenuRequest) => Promise<boolean>;
  creatingSubmenu: boolean;
  updateSubmenu: (submenuId: string, data: UpdateSubmenuRequest) => Promise<boolean>;
  updatingSubmenuData: boolean;
  updateSubmenusOrder: (submenuIds: string[]) => Promise<boolean>;
  updatingOrder: boolean;
}

export const useSubmenus = (menuId: string): UseSubmenusReturn => {
  const [submenus, setSubmenus] = useState<WebsiteSubmenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingSubmenu, setUpdatingSubmenu] = useState<string | null>(null);
  const [deletingSubmenu, setDeletingSubmenu] = useState(false);
  const [creatingSubmenu, setCreatingSubmenu] = useState(false);
  const [updatingSubmenuData, setUpdatingSubmenuData] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Función para obtener submenús del backend
  const fetchSubmenus = useCallback(async () => {
    if (!menuId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await submenuEndpoints.getByMenu(menuId);

      if (response.success && response.data) {
        const mappedSubmenus = mapBackendSubmenusToFrontend(response.data, menuId);
        setSubmenus(mappedSubmenus);
      } else {
        setError(response.message || "Error al cargar submenús");
      }
    } catch (err) {
      console.error("Error fetching submenus:", err);
      setError("Error de conexión al cargar submenús");
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  // Función para refrescar submenús
  const refreshSubmenus = useCallback(async () => {
    await fetchSubmenus();
  }, [fetchSubmenus]);

  // Función para cambiar el estado activo de un submenú
  const toggleSubmenuActive = useCallback(async (submenuId: string) => {
    const submenu = submenus.find(s => s.id === submenuId);
    if (!submenu) return;

    setUpdatingSubmenu(submenuId);
    setError(null);

    try {
      const newActiveStatus = !submenu.isActive;
      const response = await submenuEndpoints.updateActiveStatus(submenuId, newActiveStatus);

      if (response.success) {
        setSubmenus(prev =>
          prev.map(s =>
            s.id === submenuId ? { ...s, isActive: newActiveStatus } : s
          )
        );
      } else {
        setError(response.message || "Error al actualizar el estado del submenú");
      }
    } catch (err) {
      console.error("Error updating submenu status:", err);
      setError("Error de conexión al actualizar el submenú");
    } finally {
      setUpdatingSubmenu(null);
    }
  }, [submenus]);

  // Función para eliminar un submenú
  const deleteSubmenu = useCallback(async (submenuId: string): Promise<boolean> => {
    setDeletingSubmenu(true);

    try {
      console.log("Deleting submenu with ID:", submenuId);
      const response = await submenuEndpoints.delete(submenuId);
      console.log("Delete response:", response);

      if (response.success) {
        setSubmenus(prev => prev.filter(s => s.id !== submenuId));
        return true;
      } else {
        console.error("Delete failed:", response.message);
        return false;
      }
    } catch (err) {
      console.error("Error deleting submenu:", err);
      return false;
    } finally {
      setDeletingSubmenu(false);
    }
  }, []);

  // Función para crear un nuevo submenú
  const createSubmenu = useCallback(async (data: CreateSubmenuRequest): Promise<boolean> => {
    setCreatingSubmenu(true);
    setError(null);

    try {
      // Agregar el menusVisiblesId al objeto data
      const submenuData = {
        ...data,
        menusVisiblesId: menuId
      };

      const response = await submenuEndpoints.create(submenuData);

      if (response.success && response.data) {
        // Refrescar todos los submenús para obtener datos actualizados del backend
        await fetchSubmenus();
        return true;
      } else {
        setError(response.message || "Error al crear el submenú");
        return false;
      }
    } catch (err) {
      console.error("Error creating submenu:", err);
      setError("Error de conexión al crear el submenú");
      return false;
    } finally {
      setCreatingSubmenu(false);
    }
  }, [menuId, fetchSubmenus]);

  // Función para actualizar un submenú
  const updateSubmenu = useCallback(async (submenuId: string, data: UpdateSubmenuRequest): Promise<boolean> => {
    setUpdatingSubmenuData(true);
    setError(null);

    try {
      const response = await submenuEndpoints.update(submenuId, data);

      if (response.success && response.data) {
        // Refrescar todos los submenús para obtener datos actualizados del backend
        await fetchSubmenus();
        return true;
      } else {
        setError(response.message || "Error al actualizar el submenú");
        return false;
      }
    } catch (err) {
      console.error("Error updating submenu:", err);
      setError("Error de conexión al actualizar el submenú");
      return false;
    } finally {
      setUpdatingSubmenuData(false);
    }
  }, [fetchSubmenus]);

  // Función para actualizar el orden de los submenús
  const updateSubmenusOrder = useCallback(async (submenuIds: string[]): Promise<boolean> => {
    setUpdatingOrder(true);
    setError(null);

    try {
      const response = await submenuEndpoints.updateOrder(submenuIds);

      if (response.success) {
        // Recargar los submenús para obtener el nuevo orden
        await fetchSubmenus();
        return true;
      } else {
        setError(response.message || "Error al actualizar el orden");
        return false;
      }
    } catch (error) {
      console.error("Error al actualizar el orden de submenús:", error);
      setError("Error al actualizar el orden de submenús");
      return false;
    } finally {
      setUpdatingOrder(false);
    }
  }, [fetchSubmenus]);

  // Cargar submenús al montar el componente o cuando cambia menuId
  useEffect(() => {
    fetchSubmenus();
  }, [fetchSubmenus]);

  return {
    submenus,
    loading,
    error,
    refreshSubmenus,
    toggleSubmenuActive,
    deleteSubmenu,
    updatingSubmenu,
    deletingSubmenu,
    createSubmenu,
    creatingSubmenu,
    updateSubmenu,
    updatingSubmenuData,
    updateSubmenusOrder,
    updatingOrder,
  };
};
