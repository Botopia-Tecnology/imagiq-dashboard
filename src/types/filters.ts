/**
 * Types for dynamic filter configuration
 */

import { WebsiteCategory, WebsiteMenu, WebsiteSubmenu } from "./index";

/**
 * Scope for filter application
 */
export interface FilterScope {
  categories: string[]; // Array of category IDs
  menus: string[]; // Array of menu IDs
  submenus: string[]; // Array of submenu IDs
}

/**
 * Order configuration per scope
 * Maps each category/menu/submenu to its order position
 */
export interface FilterOrderConfig {
  categories: Record<string, number>; // categoryId -> order
  menus: Record<string, number>; // menuId -> order
  submenus: Record<string, number>; // submenuId -> order
}

/**
 * Available filter operators
 */
export type FilterOperator =
  | "equal" // Exact match
  | "includes" // Array contains value
  | "range" // Between min and max (for numbers)
  | "greater_than" // Greater than value
  | "less_than" // Less than value
  | "contains" // String contains substring
  | "starts_with" // String starts with
  | "ends_with" // String ends with
  | "not_equal" // Not equal
  | "not_in" // Not in array
  | "in"; // In array

/**
 * Display types for filters in the frontend
 */
export type FilterDisplayType =
  | "checkbox" // Multiple selection checkboxes
  | "radio" // Single selection radio buttons
  | "slider" // Range slider (for price ranges, etc.)
  | "multi_select" // Multi-select dropdown
  | "single_select"; // Single select dropdown

/**
 * Value source configuration
 */
export type ValueSource = "manual" | "dynamic";

/**
 * Manual value configuration
 */
export interface ManualValueConfig {
  type: "manual";
  // For range filters
  ranges?: Array<{
    label: string;
    min: number;
    max: number;
  }>;
  // For list filters
  values?: string[];
}

/**
 * Dynamic value configuration
 */
export interface DynamicValueConfig {
  type: "dynamic";
  selectedValues: string[]; // Values selected from DB to include in filter
  // The actual unique values will be fetched from the API
}

/**
 * Combined value configuration
 */
export type FilterValueConfig = ManualValueConfig | DynamicValueConfig;

/**
 * Complete dynamic filter configuration
 */
export interface DynamicFilter {
  id: string; // Unique identifier
  sectionName: string; // Display name (e.g., "RANGO DE PRECIOS")
  column: string; // Product column to filter by (e.g., "precioNormal", "color")
  operator: FilterOperator;
  valueConfig: FilterValueConfig;
  displayType: FilterDisplayType;
  scope: FilterScope;
  order: FilterOrderConfig; // Display order per scope (category/menu/submenu)
  isActive: boolean; // Whether filter is active
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Product column metadata for filter configuration
 */
export interface ProductColumn {
  key: string; // Column key in ProductApiData
  label: string; // Display label
  type: "string" | "number" | "array" | "boolean"; // Data type
  supportsRange: boolean; // Whether it supports range operations
  supportsDynamic: boolean; // Whether it supports dynamic value fetching
}

/**
 * Available product columns for filtering
 * Based on ProductApiData interface
 */
export const PRODUCT_COLUMNS: ProductColumn[] = [
  {
    key: "precioNormal",
    label: "Precio Normal",
    type: "number",
    supportsRange: true,
    supportsDynamic: false,
  },
  {
    key: "precioDescto",
    label: "Precio con Descuento",
    type: "number",
    supportsRange: true,
    supportsDynamic: false,
  },
  {
    key: "color",
    label: "Color",
    type: "array",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "capacidad",
    label: "Capacidad/Almacenamiento",
    type: "array",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "memoriaram",
    label: "Memoria RAM",
    type: "array",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "categoria",
    label: "Categoría",
    type: "string",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "menu",
    label: "Menú",
    type: "string",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "modelo",
    label: "Modelo",
    type: "string",
    supportsRange: false,
    supportsDynamic: true,
  },
  {
    key: "stock",
    label: "Stock",
    type: "number",
    supportsRange: true,
    supportsDynamic: false,
  },
  {
    key: "stockTotal",
    label: "Stock Total",
    type: "number",
    supportsRange: true,
    supportsDynamic: false,
  },
  {
    key: "segmento",
    label: "Segmento",
    type: "array",
    supportsRange: false,
    supportsDynamic: true,
  },
];

/**
 * Operator metadata with descriptions
 */
export interface OperatorMetadata {
  value: FilterOperator;
  label: string;
  description: string;
  supportedTypes: ("string" | "number" | "array" | "boolean")[];
}

export const FILTER_OPERATORS: OperatorMetadata[] = [
  {
    value: "equal",
    label: "Igual a",
    description: "Coincidencia exacta del valor",
    supportedTypes: ["string", "number", "boolean"],
  },
  {
    value: "includes",
    label: "Incluye",
    description: "El array incluye el valor",
    supportedTypes: ["array"],
  },
  {
    value: "range",
    label: "Rango",
    description: "Valor entre mínimo y máximo",
    supportedTypes: ["number"],
  },
  {
    value: "greater_than",
    label: "Mayor que",
    description: "Valor mayor que el especificado",
    supportedTypes: ["number"],
  },
  {
    value: "less_than",
    label: "Menor que",
    description: "Valor menor que el especificado",
    supportedTypes: ["number"],
  },
  {
    value: "contains",
    label: "Contiene",
    description: "El texto contiene la cadena especificada",
    supportedTypes: ["string"],
  },
  {
    value: "starts_with",
    label: "Comienza con",
    description: "El texto comienza con la cadena especificada",
    supportedTypes: ["string"],
  },
  {
    value: "ends_with",
    label: "Termina con",
    description: "El texto termina con la cadena especificada",
    supportedTypes: ["string"],
  },
  {
    value: "not_equal",
    label: "No igual a",
    description: "Valor diferente al especificado",
    supportedTypes: ["string", "number", "boolean"],
  },
  {
    value: "in",
    label: "En lista",
    description: "Valor está en la lista especificada",
    supportedTypes: ["string", "number"],
  },
  {
    value: "not_in",
    label: "No en lista",
    description: "Valor no está en la lista especificada",
    supportedTypes: ["string", "number"],
  },
];

