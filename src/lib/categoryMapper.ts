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
    slug: backendSubcategory.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendSubcategory.descripcion,
    image: backendSubcategory.imagen, // Usar imagen del backend
    order: 1, // Mock order por ahora
    isActive: backendSubcategory.activo,
    productsCount: 0, // Mock productsCount por ahora
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
    slug: backendCategory.nombre.toLowerCase().replace(/\s+/g, '-'),
    description: backendCategory.descripcion,
    image: backendCategory.imagen, // Usar imagen del backend
    order: 1, // Mock order por ahora
    isActive: backendCategory.activo,
    productsCount: 0, // Mock productsCount por ahora
    subcategories: backendCategory.subcategorias.map(subcategory =>
      mapBackendSubcategoryToFrontend(subcategory, backendCategory.uuid)
    ),
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
