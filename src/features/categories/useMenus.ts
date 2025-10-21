/**
 * Hook para manejo de menús de una categoría específica
 * - Obtener menús visibles de una categoría del backend
 * - Manejo de estado de carga y errores
 * - Funciones para actualizar menús
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { menuEndpoints } from "@/lib/api";
import { mapBackendMenusToFrontend } from "@/lib/categoryMapper";
import { WebsiteMenu, CreateMenuRequest, UpdateMenuRequest } from "@/types";

interface UseMenusReturn {
  menus: WebsiteMenu[];
  loading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
  toggleMenuActive: (menuId: string) => Promise<void>;
  deleteMenu: (menuId: string) => Promise<boolean>;
  updatingMenu: string | null;
  deletingMenu: boolean;
  createMenu: (data: CreateMenuRequest) => Promise<boolean>;
  creatingMenu: boolean;
  updateMenu: (menuId: string, data: UpdateMenuRequest) => Promise<boolean>;
  updatingMenuData: boolean;
  updateMenusOrder: (menuIds: string[]) => Promise<boolean>;
  updatingOrder: boolean;
}

export const useMenus = (categoryId: string): UseMenusReturn => {
  const [menus, setMenus] = useState<WebsiteMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingMenu, setUpdatingMenu] = useState<string | null>(null);
  const [deletingMenu, setDeletingMenu] = useState(false);
  const [creatingMenu, setCreatingMenu] = useState(false);
  const [updatingMenuData, setUpdatingMenuData] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Función para obtener menús del backend
  const fetchMenus = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await menuEndpoints.getByCategory(categoryId);

      if (response.success && response.data) {
        const mappedMenus = mapBackendMenusToFrontend(response.data, categoryId);
        setMenus(mappedMenus);
      } else {
        setError(response.message || "Error al cargar menús");
      }
    } catch (err) {
      console.error("Error fetching menus:", err);
      setError("Error de conexión al cargar menús");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Función para refrescar menús
  const refreshMenus = useCallback(async () => {
    await fetchMenus();
  }, [fetchMenus]);

  // Función para cambiar el estado activo de un menú
  const toggleMenuActive = useCallback(async (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    setUpdatingMenu(menuId);
    setError(null);

    try {
      const newActiveStatus = !menu.isActive;
      const response = await menuEndpoints.updateActiveStatus(menuId, newActiveStatus);

      if (response.success) {
        setMenus(prev =>
          prev.map(m =>
            m.id === menuId ? { ...m, isActive: newActiveStatus } : m
          )
        );
      } else {
        setError(response.message || "Error al actualizar el estado del menú");
      }
    } catch (err) {
      console.error("Error updating menu status:", err);
      setError("Error de conexión al actualizar el menú");
    } finally {
      setUpdatingMenu(null);
    }
  }, [menus]);

  // Función para eliminar un menú
  const deleteMenu = useCallback(async (menuId: string): Promise<boolean> => {
    setDeletingMenu(true);

    try {
      console.log("Deleting menu with ID:", menuId);
      const response = await menuEndpoints.delete(menuId);
      console.log("Delete response:", response);

      if (response.success) {
        setMenus(prev => prev.filter(m => m.id !== menuId));
        return true;
      } else {
        console.error("Delete failed:", response.message);
        return false;
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      return false;
    } finally {
      setDeletingMenu(false);
    }
  }, []);

  // Función para crear un nuevo menú
  const createMenu = useCallback(async (data: CreateMenuRequest): Promise<boolean> => {
    setCreatingMenu(true);
    setError(null);

    try {
      // Agregar el categoriasVisiblesId al objeto data
      const menuData = {
        ...data,
        categoriasVisiblesId: categoryId
      };

      const response = await menuEndpoints.create(menuData);

      if (response.success && response.data) {
        // Refrescar todos los menús para obtener datos actualizados del backend
        await fetchMenus();
        return true;
      } else {
        setError(response.message || "Error al crear el menú");
        return false;
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError("Error de conexión al crear el menú");
      return false;
    } finally {
      setCreatingMenu(false);
    }
  }, [categoryId, fetchMenus]);

  // Función para actualizar un menú
  const updateMenu = useCallback(async (menuId: string, data: UpdateMenuRequest): Promise<boolean> => {
    setUpdatingMenuData(true);
    setError(null);

    try {
      const response = await menuEndpoints.update(menuId, data);

      if (response.success && response.data) {
        // Refrescar todos los menús para obtener datos actualizados del backend
        await fetchMenus();
        return true;
      } else {
        setError(response.message || "Error al actualizar el menú");
        return false;
      }
    } catch (err) {
      console.error("Error updating menu:", err);
      setError("Error de conexión al actualizar el menú");
      return false;
    } finally {
      setUpdatingMenuData(false);
    }
  }, [fetchMenus]);

  // Función para actualizar el orden de los menús
  const updateMenusOrder = useCallback(async (menuIds: string[]): Promise<boolean> => {
    setUpdatingOrder(true);
    setError(null);

    try {
      const response = await menuEndpoints.updateOrder(menuIds);

      if (response.success) {
        // Recargar los menús para obtener el nuevo orden
        await fetchMenus();
        return true;
      } else {
        setError(response.message || "Error al actualizar el orden");
        return false;
      }
    } catch (error) {
      console.error("Error al actualizar el orden de menús:", error);
      setError("Error al actualizar el orden de menús");
      return false;
    } finally {
      setUpdatingOrder(false);
    }
  }, [fetchMenus]);

  // Cargar menús al montar el componente o cuando cambia categoryId
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    refreshMenus,
    toggleMenuActive,
    deleteMenu,
    updatingMenu,
    deletingMenu,
    createMenu,
    creatingMenu,
    updateMenu,
    updatingMenuData,
    updateMenusOrder,
    updatingOrder,
  };
};
