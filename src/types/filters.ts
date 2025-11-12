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


