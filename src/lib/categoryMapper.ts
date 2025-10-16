/**
 * Mapper para convertir datos de categorías del backend al formato del frontend
 */

import { BackendCategory, BackendSubcategory, WebsiteCategory, WebsiteSubcategory } from "@/types";

/**
 * Convierte una subcategoría del backend al formato del frontend
 */
export const mapBackendSubcategoryToFrontend = (
  backendSubcategory: BackendSubcategory,
  categoryId: string
): WebsiteSubcategory => {
  return {
    id: backendSubcategory.uuid,
    categoryId: categoryId,
    name: backendSubcategory.nombre,
    nombreVisible: backendSubcategory.nombreVisible,
    slug: backendSubcategory.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendSubcategory.descripcion,
    image: backendSubcategory.imagen, // Usar imagen del backend
    order: 1, // Mock order por ahora
    isActive: backendSubcategory.activo,
    productsCount: backendSubcategory.totalProducts || 0, // Usar totalProducts del backend
    createdAt: new Date(backendSubcategory.createdAt),
    updatedAt: new Date(backendSubcategory.updatedAt),
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
    subcategories: backendCategory.subcategorias?.map(subcategory =>
      mapBackendSubcategoryToFrontend(subcategory, backendCategory.uuid)
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
 * Convierte un array de subcategorías del backend al formato del frontend
 */
export const mapBackendSubcategoriesToFrontend = (
  backendSubcategories: BackendSubcategory[],
  categoryId: string
): WebsiteSubcategory[] => {
  return backendSubcategories.map(subcategory =>
    mapBackendSubcategoryToFrontend(subcategory, categoryId)
  );
};
