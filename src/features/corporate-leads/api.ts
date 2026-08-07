/**
 * Módulo de leads B2B de Ventas Corporativas (sección Empresas)
 * - Tipos del contrato con messaging-ms (via gateway)
 * - Endpoints: listado paginado con filtros, actualización de estado/notas y estadísticas
 */

import { apiClient } from "@/lib/api";

export type CorporateLeadEstado =
  | "nuevo"
  | "contactado"
  | "ganado"
  | "descartado";

export interface CorporateLead {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  industry: string | null;
  solutionInterest: string[];
  message: string | null;
  sourceUrl: string | null;
  attachmentNames: string[];
  estado: CorporateLeadEstado;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateLeadsListData {
  items: CorporateLead[];
  total: number;
  page: number;
  pages: number;
}

export interface CorporateLeadsStats {
  total: number;
  nuevos: number;
  mes: number;
  porEstado: Record<string, number>;
  porIndustria: Record<string, number>;
}

/** Envoltura estándar del backend: { success, data } */
interface BackendEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CorporateLeadsListParams {
  page?: number;
  limit?: number;
  estado?: string;
  industry?: string;
  search?: string;
}

export interface UpdateCorporateLeadDto {
  estado?: CorporateLeadEstado;
  notas?: string;
}

const BASE_PATH = "/api/messaging/admin/corporate-leads";

export const corporateLeadsEndpoints = {
  list: (params: CorporateLeadsListParams = {}) => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      estado: params.estado ?? "",
      industry: params.industry ?? "",
      search: params.search ?? "",
    });
    return apiClient.get<BackendEnvelope<CorporateLeadsListData>>(
      `${BASE_PATH}?${query.toString()}`,
      true
    );
  },

  update: (id: string, data: UpdateCorporateLeadDto) =>
    apiClient.patch<BackendEnvelope<CorporateLead>>(
      `${BASE_PATH}/${id}`,
      data,
      true
    ),

  stats: () =>
    apiClient.get<BackendEnvelope<CorporateLeadsStats>>(
      `${BASE_PATH}/stats`,
      true
    ),
};

/** Configuración visual por estado (badge de color) */
export const ESTADO_CONFIG: Record<
  CorporateLeadEstado,
  { label: string; badgeClass: string }
> = {
  nuevo: {
    label: "Nuevo",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  contactado: {
    label: "Contactado",
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  ganado: {
    label: "Ganado",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  descartado: {
    label: "Descartado",
    badgeClass:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
};

export const ESTADO_OPTIONS = Object.entries(ESTADO_CONFIG).map(
  ([value, config]) => ({
    value: value as CorporateLeadEstado,
    label: config.label,
  })
);

/** Etiquetas legibles de las soluciones de interés */
export const SOLUTION_LABELS: Record<string, string> = {
  mobile: "Dispositivos móviles",
  electrodomesticos: "Electrodomésticos",
  pantallas: "Pantallas y monitores",
  climatizacion: "Climatización",
};

export const getSolutionLabel = (key: string): string =>
  SOLUTION_LABELS[key] ?? key;
