/**
 * Mapper para convertir datos de categorías del backend al formato del frontend
 */

import { BackendCategory, BackendMenu, BackendSubmenu, WebsiteCategory, WebsiteMenu, WebsiteSubmenu } from "@/types";

/**
 * Convierte un submenú del backend al formato del frontend
 */
export const mapBackendSubmenuToFrontend = (
  backendSubmenu: BackendSubmenu,
  menuId: string
): WebsiteSubmenu => {
  return {
    id: backendSubmenu.uuid,
    menuId: menuId,
    name: backendSubmenu.nombre,
    nombreVisible: backendSubmenu.nombreVisible,
    slug: backendSubmenu.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendSubmenu.descripcion,
    image: backendSubmenu.imagen,
    order: 1, // Mock order por ahora
    isActive: backendSubmenu.activo,
    productsCount: backendSubmenu.totalProducts || 0,
    createdAt: new Date(backendSubmenu.createdAt),
    updatedAt: new Date(backendSubmenu.updatedAt),
  };
};

/**
 * Convierte un menú del backend al formato del frontend
 */
export const mapBackendMenuToFrontend = (
  backendMenu: BackendMenu,
  categoryId: string
): WebsiteMenu => {
  return {
    id: backendMenu.uuid,
    categoryId: categoryId,
    name: backendMenu.nombre,
    nombreVisible: backendMenu.nombreVisible,
    slug: backendMenu.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendMenu.descripcion,
    image: backendMenu.imagen, // Usar imagen del backend
    order: backendMenu.orden,
    isActive: backendMenu.activo,
    productsCount: backendMenu.totalProducts || 0, // Usar totalProducts del backend
    submenus: backendMenu.submenus?.map(submenu =>
      mapBackendSubmenuToFrontend(submenu, backendMenu.uuid)
    ) || [],
    createdAt: new Date(backendMenu.createdAt),
    updatedAt: new Date(backendMenu.updatedAt),
  };
};

/**
 * Convierte una categoría del backend al formato del frontend
 */
export const mapBackendCategoryToFrontend = (backendCategory: BackendCategory): WebsiteCategory => {
  return {
    id: backendCategory.uuid,
    name: backendCategory.nombre,
    nombreVisible: backendCategory.nombreVisible,
    slug: backendCategory.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendCategory.descripcion,
    image: backendCategory.imagen, // Usar imagen del backend
    order: 1, // Mock order por ahora
    isActive: backendCategory.activo,
    productsCount: backendCategory.totalProducts,
    menus: backendCategory.menus?.map(menu =>
      mapBackendMenuToFrontend(menu, backendCategory.uuid)
    ) || [],
    createdAt: new Date(backendCategory.createdAt),
    updatedAt: new Date(backendCategory.updatedAt),
  };
};

/**
 * Convierte un array de categorías del backend al formato del frontend
 */
export const mapBackendCategoriesToFrontend = (backendCategories: BackendCategory[]): WebsiteCategory[] => {
  return backendCategories.map(mapBackendCategoryToFrontend);
};

/**
 * Convierte un array de menús del backend al formato del frontend
 */
export const mapBackendMenusToFrontend = (
  backendMenus: BackendMenu[],
  categoryId: string
): WebsiteMenu[] => {
  return backendMenus.map(menu =>
    mapBackendMenuToFrontend(menu, categoryId)
  );
};

/**
 * Convierte un array de submenús del backend al formato del frontend
 */
export const mapBackendSubmenusToFrontend = (
  backendSubmenus: BackendSubmenu[],
  menuId: string
): WebsiteSubmenu[] => {
  return backendSubmenus.map(submenu =>
    mapBackendSubmenuToFrontend(submenu, menuId)
  );
};
