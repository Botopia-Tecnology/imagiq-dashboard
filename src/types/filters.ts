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
 * Valor individual con operador opcional
 */
export interface ValueItem {
  value: string; // Valor de comparación (o min si es range)
  label?: string; // Etiqueta para mostrar (opcional, si no se proporciona se usa value)
  operator?: FilterOperator; // Operador específico para este valor (si no se usa operador por columna)
  // Para operadores de rango (range)
  min?: number; // Valor mínimo (cuando operator === "range")
  max?: number; // Valor máximo (cuando operator === "range")
}

/**
 * Rango con operador opcional
 */
export interface RangeItem {
  label: string;
  min: number;
  max: number;
  operator?: FilterOperator;
}

/**
 * Manual value configuration
 */
export interface ManualValueConfig {
  type: "manual";
  // For range filters
  ranges?: RangeItem[];
  // For list filters
  values?: ValueItem[]; // Cambiar de string[] a ValueItem[]
}

/**
 * Dynamic value configuration
 */
export interface DynamicValueConfig {
  type: "dynamic";
  selectedValues: ValueItem[]; // Cambiar de string[] a ValueItem[]
  // The actual unique values will be fetched from the API
}

/**
 * Nueva configuración mixta
 */
export interface MixedValueConfig {
  type: "mixed";
  dynamicValues: ValueItem[];
  manualValues: ValueItem[];
  ranges?: RangeItem[];
}

/**
 * Combined value configuration
 */
export type FilterValueConfig = ManualValueConfig | DynamicValueConfig | MixedValueConfig;

/**
 * Complete dynamic filter configuration
 */
export interface DynamicFilter {
  id: string; // Unique identifier
  sectionName: string; // Display name (e.g., "RANGO DE PRECIOS")
  column: string; // Product column to filter by (e.g., "precioNormal", "color")
  operator?: FilterOperator; // Hacer opcional - solo se usa si operatorMode === "column"
  operatorMode: "column" | "per-value"; // Nuevo campo para elegir modo
  valueConfig: FilterValueConfig;
  displayType: FilterDisplayType;
  scope: FilterScope;
  order: FilterOrderConfig; // Display order per scope (category/menu/submenu)
  isActive: boolean; // Whether filter is active
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Operator metadata for filter configuration
 */
export interface OperatorMetadata {
  value: FilterOperator;
  label: string;
  description: string;
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
  operators?: OperatorMetadata[]; // Supported operators for this column
}


