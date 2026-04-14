"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPut, apiDelete } from "@/lib/api-client";
import type { SeoSettings, PageSeoData, CategoriaSeoData, ProductSeoData } from "@/types/seo";

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const SEO_SETTINGS_ENDPOINT = "/api/multimedia/seo/settings";
const SEO_PAGES_ENDPOINT = "/api/multimedia/pages?limit=500";
const SEO_CATEGORIAS_ENDPOINT = "/api/multimedia/categorias";
const SEO_PRODUCTOS_ENDPOINT = "/api/products/seo/overrides";

// ---------------------------------------------------------------------------
// useSeoSettings
// ---------------------------------------------------------------------------

interface UseSeoSettingsResult {
  /** Current global SEO settings; null while loading or if the fetch failed */
  settings: SeoSettings | null;
  isLoading: boolean;
  error: string | null;
  /**
   * Persist a partial update to the settings.
   * Merges the provided fields into the current settings optimistically,
   * then issues a PUT to the backend.
   *
   * @returns The saved SeoSettings returned by the API.
   * @throws Re-throws the underlying fetch error after rolling back local state.
   */
  updateSettings: (patch: Partial<SeoSettings>) => Promise<SeoSettings>;
  /** Manually re-fetch the settings from the API */
  refreshSettings: () => Promise<void>;
}

/**
 * Hook for reading and writing global SEO settings.
 *
 * Fetches from GET /api/multimedia/seo/settings on mount and exposes an
 * `updateSettings` function that issues a PUT to the same endpoint.
 *
 * Auth is handled automatically by the shared apiClient (X-API-Key header).
 *
 * @example
 * const { settings, isLoading, error, updateSettings } = useSeoSettings();
 *
 * // Update a single field
 * await updateSettings({ site_name: "ImagiQ Pro" });
 *
 * // Batch update
 * await updateSettings({
 *   allow_indexing: "true",
 *   sitemap_enabled: "true",
 *   ai_crawlers_policy: "block_training",
 * });
 */
export function useSeoSettings(): UseSeoSettingsResult {
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<SeoSettings>(SEO_SETTINGS_ENDPOINT);
      setSettings(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar configuracion SEO";
      setError(message);
      console.error("useSeoSettings: fetch failed", message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<SeoSettings>): Promise<SeoSettings> => {
      // Optimistic update: apply the patch immediately so the UI feels instant
      const previous = settings;
      const optimistic = settings
        ? ({ ...settings, ...patch } as SeoSettings)
        : (patch as SeoSettings);
      setSettings(optimistic);

      try {
        const saved = await apiPut<SeoSettings>(SEO_SETTINGS_ENDPOINT, patch);
        // Reconcile with what the server actually persisted
        setSettings(saved);
        return saved;
      } catch (err) {
        // Roll back the optimistic update on failure
        setSettings(previous);
        const message =
          err instanceof Error
            ? err.message
            : "Error desconocido al guardar configuracion SEO";
        setError(message);
        console.error("useSeoSettings: update failed", message);
        throw err;
      }
    },
    [settings]
  );

  // Fetch on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}

// ---------------------------------------------------------------------------
// useSeoPages
// ---------------------------------------------------------------------------

interface UseSeoPagesPagesResponse {
  data: PageSeoData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseSeoPagesFlatResponse {
  pages?: PageSeoData[];
  data?: PageSeoData[];
}

interface UseSeopagesResult {
  /** All pages with SEO data; empty array while loading */
  pages: PageSeoData[];
  isLoading: boolean;
  /** Manually re-fetch the pages list */
  refreshPages: () => Promise<void>;
  /**
   * Persist a partial SEO update for a single page.
   * Optimistically merges the patch into local state, then PUTs to the backend.
   */
  updatePage: (id: string, patch: Partial<PageSeoData>) => Promise<void>;
}

/**
 * Hook for fetching all pages with their SEO metadata.
 *
 * Issues a single GET /api/multimedia/pages?limit=500 on mount, returning the
 * full list without pagination controls. Use this hook to drive the SEO audit
 * table in the dashboard.
 *
 * Auth is handled automatically by the shared apiClient (X-API-Key header).
 *
 * @example
 * const { pages, isLoading, refreshPages } = useSeoPages();
 *
 * // Filter to only indexable pages
 * const indexable = pages.filter(
 *   (p) => !p.seo_no_index && p.status === "published"
 * );
 */
export function useSeoPages(): UseSeopagesResult {
  const [pages, setPages] = useState<PageSeoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPages = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      // The pages endpoint may return a paginated envelope or a flat object
      // depending on the backend version — handle both shapes defensively.
      const raw = await apiGet<
        UseSeoPagesPagesResponse | UseSeoPagesFlatResponse
      >(SEO_PAGES_ENDPOINT);

      if (raw && "data" in raw && Array.isArray((raw as UseSeoPagesPagesResponse).data)) {
        // Paginated envelope: { data: [...], meta: { ... } }
        setPages((raw as UseSeoPagesPagesResponse).data);
      } else if (raw && "pages" in raw && Array.isArray((raw as UseSeoPagesFlatResponse).pages)) {
        // Flat object: { pages: [...] }
        setPages((raw as UseSeoPagesFlatResponse).pages!);
      } else {
        // Fallback: the response itself is the array
        const asArray = raw as unknown as PageSeoData[];
        setPages(Array.isArray(asArray) ? asArray : []);
      }
    } catch (err) {
      console.error(
        "useSeoPages: fetch failed",
        err instanceof Error ? err.message : err
      );
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePage = useCallback(
    async (id: string, patch: Partial<PageSeoData>): Promise<void> => {
      const previous = pages;
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );

      try {
        await apiPut<PageSeoData>(`/api/multimedia/pages/${id}`, patch);
      } catch (err) {
        setPages(previous);
        console.error(
          "useSeoPages: updatePage failed",
          err instanceof Error ? err.message : err
        );
        throw err;
      }
    },
    [pages]
  );

  // Fetch on mount
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    isLoading,
    refreshPages: fetchPages,
    updatePage,
  };
}

// ---------------------------------------------------------------------------
// useSeoCategorias
// ---------------------------------------------------------------------------

interface UseSeoCategoriasResult {
  categorias: CategoriaSeoData[];
  isLoading: boolean;
  refreshCategorias: () => Promise<void>;
  /**
   * Persist a partial SEO update for a single category.
   * Optimistically merges the patch into local state, then PUTs to the backend.
   */
  updateCategoriaSeo: (
    uuid: string,
    patch: Partial<CategoriaSeoData>,
  ) => Promise<void>;
}

/**
 * Hook for fetching all categorias_visibles with their SEO metadata.
 * Uses the same /api/multimedia/categorias endpoint that already drives the
 * storefront navbar — after the migration it also returns the SEO columns.
 */
export function useSeoCategorias(): UseSeoCategoriasResult {
  const [categorias, setCategorias] = useState<CategoriaSeoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCategorias = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const raw = await apiGet<CategoriaSeoData[]>(SEO_CATEGORIAS_ENDPOINT);
      setCategorias(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(
        "useSeoCategorias: fetch failed",
        err instanceof Error ? err.message : err,
      );
      setCategorias([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategoriaSeo = useCallback(
    async (uuid: string, patch: Partial<CategoriaSeoData>): Promise<void> => {
      const previous = categorias;
      setCategorias((prev) =>
        prev.map((c) => (c.uuid === uuid ? { ...c, ...patch } : c)),
      );

      try {
        await apiPut(`/api/multimedia/categorias/${uuid}/seo`, patch);
      } catch (err) {
        setCategorias(previous);
        console.error(
          "useSeoCategorias: updateCategoriaSeo failed",
          err instanceof Error ? err.message : err,
        );
        throw err;
      }
    },
    [categorias],
  );

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    isLoading,
    refreshCategorias: fetchCategorias,
    updateCategoriaSeo,
  };
}

// ---------------------------------------------------------------------------
// useSeoProductos
// ---------------------------------------------------------------------------

interface UseSeoProductosResult {
  overrides: ProductSeoData[];
  isLoading: boolean;
  refreshOverrides: () => Promise<void>;
  /**
   * Upsert SEO fields for a product by SKU. Works for both existing overrides
   * and brand-new rows (the backend creates the row on first write).
   */
  upsertProductSeo: (
    sku: string,
    patch: Partial<ProductSeoData>,
  ) => Promise<ProductSeoData>;
  /**
   * Remove an override entirely. The product will fall back to default
   * metadata derived from the catalog.
   */
  deleteProductSeo: (sku: string) => Promise<void>;
}

/**
 * Hook for managing per-product SEO overrides stored in the product_seo table.
 * Only products an admin has explicitly customized show up here; the editor
 * exposes an "Add SKU" affordance for creating new overrides on demand.
 */
export function useSeoProductos(): UseSeoProductosResult {
  const [overrides, setOverrides] = useState<ProductSeoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchOverrides = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const raw = await apiGet<ProductSeoData[]>(SEO_PRODUCTOS_ENDPOINT);
      setOverrides(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(
        "useSeoProductos: fetch failed",
        err instanceof Error ? err.message : err,
      );
      setOverrides([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upsertProductSeo = useCallback(
    async (sku: string, patch: Partial<ProductSeoData>): Promise<ProductSeoData> => {
      const previous = overrides;
      // Optimistic merge
      setOverrides((prev) => {
        const existing = prev.find((o) => o.sku === sku);
        if (existing) {
          return prev.map((o) => (o.sku === sku ? { ...o, ...patch } : o));
        }
        return [
          {
            sku,
            seo_no_index: false,
            seo_no_follow: false,
            include_in_sitemap: true,
            updated_at: new Date().toISOString(),
            ...patch,
          } as ProductSeoData,
          ...prev,
        ];
      });

      try {
        const saved = await apiPut<ProductSeoData>(
          `${SEO_PRODUCTOS_ENDPOINT}/${sku}`,
          patch,
        );
        // Reconcile with whatever the server persisted
        setOverrides((prev) => prev.map((o) => (o.sku === sku ? saved : o)));
        return saved;
      } catch (err) {
        setOverrides(previous);
        console.error(
          "useSeoProductos: upsertProductSeo failed",
          err instanceof Error ? err.message : err,
        );
        throw err;
      }
    },
    [overrides],
  );

  const deleteProductSeo = useCallback(
    async (sku: string): Promise<void> => {
      const previous = overrides;
      setOverrides((prev) => prev.filter((o) => o.sku !== sku));
      try {
        await apiDelete(`${SEO_PRODUCTOS_ENDPOINT}/${sku}`);
      } catch (err) {
        setOverrides(previous);
        throw err;
      }
    },
    [overrides],
  );

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  return {
    overrides,
    isLoading,
    refreshOverrides: fetchOverrides,
    upsertProductSeo,
    deleteProductSeo,
  };
}
