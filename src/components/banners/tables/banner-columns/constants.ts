/**
 * Constantes para las columnas de la tabla de banners
 * Centralizadas para fácil modificación y consistencia
 */

export const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  draft: "bg-yellow-500",
} as const;

export const statusLabels = {
  active: "Activo",
  inactive: "Inactivo",
  draft: "Borrador",
} as const;

export const placementLabels: Record<string, string> = {
  hero: "Hero Banner",
  "home-2": "Banner Home 2",
  "home-3": "Banner Home 3",
  "home-4": "Banner Home 4",
  subheader: "Subheader",
  "category-top": "Categoría Superior",
  "product-grid": "Grid de Productos",
  "product-detail": "Detalle de Producto",
  cart: "Carrito",
  checkout: "Checkout",
  "sticky-bottom": "Sticky Inferior",
  notification: "Notificación",
};

export type BannerStatus = keyof typeof statusColors;
