/**
 * Cliente API para comunicación con microservicios
 * - Configuración base de Axios o Fetch
 * - Interceptors para auth tokens
 * - Manejo centralizado de errores
 * - Retry logic para requests fallidos
 * - Rate limiting y caching
 * - TypeScript interfaces para requests/responses
 */

import { BackendCategory, BackendMenu, BackendSubmenu, CreateCategoryRequest, UpdateCategoryRequest, CreateMenuRequest, UpdateMenuRequest, CreateSubmenuRequest, UpdateSubmenuRequest } from "@/types";


// API Client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Generic API response type
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// API Client class
export class ApiClient {
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.headers = {
      "Content-Type": "application/json",
    };
  }


  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Intentar parsear JSON
      let data;
      try {
        data = await response?.json();
      } catch (jsonError) {
        // Si no es JSON válido, retornar error
        console.error("JSON parsing error:", jsonError);
        return {
          data: {} as T,
          success: false,
          message: `Error al procesar la respuesta del servidor (Status: ${response.status})`,
        };
      }

      return {
        data: data as T,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : undefined,
        errors: data?.errors,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: {} as T,
        success: false,
        message: error instanceof Error ? error.message : "Request failed",
      };
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: "PUT",
      body: formData,
      headers: {
        // No incluir Content-Type para que el browser lo establezca automáticamente con boundary
      },
    };

    try {
      const response = await fetch(url, config);

      // Intentar parsear JSON
      let data;
      try {
        data = await response?.json();
      } catch (jsonError) {
        // Si no es JSON válido, retornar error
        console.error("JSON parsing error:", jsonError);
        return {
          data: {} as T,
          success: false,
          message: `Error al procesar la respuesta del servidor (Status: ${response.status})`,
        };
      }

      return {
        data: data as T,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : undefined,
        errors: data?.errors,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: {} as T,
        success: false,
        message: error instanceof Error ? error.message : "Request failed",
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Product API endpoints
export const productEndpoints = {
  getAll: () => apiClient.get<ProductApiResponse>("/api/products"),
  getFiltered: (params: ProductFilterParams) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const url = `/api/products/filtered?${searchParams.toString()}`;
    return apiClient.get<ProductApiResponse>(url);
  },
  getFilteredSearch: (params: ProductFilterParams) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const url = `/api/products/search/grouped?${searchParams.toString()}`;
    return apiClient.get<ProductApiResponse>(url);
  },
  getById: (id: string) =>
    apiClient.get<ProductApiResponse>(`/api/products/${id}`),
  getByCategory: (category: string) =>
    apiClient.get<ProductApiResponse>(
      `/api/products/filtered?categoria=${category}`
    ),
  getByMenu: (menu: string) =>
    apiClient.get<ProductApiResponse>(
      `/api/products/filtered?menu=${menu}`
    ),
  getByCodigoMarket: (codigoMarket: string) =>
    apiClient.get<ProductApiResponse2>(
      `/api/products/filtered?codigoMarket=${codigoMarket}`
    ),
  search: (query: string) =>
    apiClient.get<ProductApiResponse>(`/api/products/filtered?nombre=${query}`),
  getSummary: () => apiClient.get<ProductSummary>("/api/products/summary"),
  updateMedia: (id: string, data: ProductMediaUpdateData) =>
    apiClient.put<ProductMediaUpdateResponse>(`/api/products/${id}/media`, data),
  getMultimedia: (sku: string) =>
    apiClient.get<ProductMultimediaData>(`/api/multimedia/producto/${sku}`),

  // Modificar imagen en posición específica
  updateImageAtPosition: (sku: string, numero: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    return fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagen/${numero}`, {
      method: "PUT",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {},
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // Agregar una imagen al final
  addImage: (sku: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    return fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagen/agregar`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {},
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // Agregar varias imágenes al final
  addMultipleImages: (sku: string, imageFiles: File[]) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    return fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagenes/agregar-multiples`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {},
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // Subir múltiples imágenes usando multiple_data (preview + detalles)
  // Si previewFile es null, mantiene la preview existente
  uploadMultipleData: (sku: string, previewFile: File | null, detailFiles: File[]) => {
    const formData = new FormData();

    // Agregar SKU
    formData.append('sku', sku);

    // Agregar preview (Blob vacío si no se modifica)
    if (previewFile) {
      formData.append('file', previewFile);
    } else {
      // Enviar un Blob vacío para indicar que no se modifica la preview
      formData.append('file', new Blob(), '');
    }

    // Agregar imágenes de detalle
    detailFiles.forEach((file) => {
      formData.append('file', file);
    });

    return fetch(`${API_BASE_URL}/api/multimedia/producto/multiple_data`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {},
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // Obtener videos premium
  getPremiumVideos: (sku: string) =>
    apiClient.get<{ videos: string[] }>(`/api/multimedia/producto/${sku}/premium-videos`),

  // Obtener imágenes premium
  getPremiumImages: (sku: string) =>
    apiClient.get<{ images: string[] }>(`/api/multimedia/producto/${sku}/premium-images`),

  // Reordenar imágenes existentes
  reorderImages: (sku: string, imageUrls: string[]) => {
    return apiClient.put<{ success: boolean; message: string }>(
      `/api/multimedia/producto/${sku}/reordenar`,
      {
        sku,
        imageUrls
      }
    );
  },

  // Eliminar una o varias imágenes de detalle
  deleteDetailImages: (sku: string, numeros: number[]) => {
    return fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagenes-detalle`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numeros }),
    }).then(async (response) => {
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {},
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },
};

// Product filter parameters interface
export interface ProductFilterParams {
  categoria?: string;
  menu?: string;
  precioMin?: number;
  precioMax?: number;
  conDescuento?: boolean;
  stockMinimo?: number;
  stockMaximo?: number;
  color?: string;
  capacidad?: string;
  nombre?: string;
  query?: string;
  modelo?: string;
  desDetallada?: string;
  codigoMarket?: string;
  filterMode?: string;
  page?: number;
  stock?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
}


// API Response types
export interface ProductPaginationData {
  products: ProductApiData[];
  total: number; // Total de productos encontrados
  page: number; // Página actual
  limit: number; // Límite de productos por página
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  message?: string; // Mensaje opcional del backend
}

export interface ProductApiResponse {
  data: ProductPaginationData; // El backend envuelve los datos en un campo "data"
  success?: boolean;
  message?: string;
}

export interface ProductApiResponse2 {
   products: ProductApiData[];
  total: number; // Total de productos encontrados
  page: number; // Página actual
  limit: number; // Límite de productos por página
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  message?: string; // Mensaje opcional del backend
}

export interface ProductSummary {
  productsTotal: number;
  totalValue: number;
  lowStock: number;
}

export interface ProductApiData {
  codigoMarketBase: string;
  codigoMarket?: string[];
  nombreMarket: string;
  categoria: string;
  menu: string;
  modelo: string;
  color?: string[];
  capacidad?: string[];
  descGeneral?: string | null;
  sku?: string[];
  desDetallada?: string[];
  stock?: number[];
  stockTiendas?: Record<string, number>[];
  stockTotal?: number[];
  imagePreviewUrl?: string[];
  imageDetailsUrls?: string[][]; // Array de arrays de URLs de imágenes detalladas
  urlImagenes?: string[];
  urlRender3D?: string[];
  precioNormal?: number[];
  precioDescto?: number[];
  fechaInicioVigencia?: string[];
  fechaFinalVigencia?: string[];
  imagenPremium?: string[][]; // Array de arrays de URLs de imágenes premium
  videoPremium?: string[][]; // Array de arrays de URLs de videos premium
  segmento?: string[]; // Array de segmentos del producto (ej: ["Premium"])
}

// Product media update interfaces
export interface ProductMediaUpdateData {
  sku: string;
  codigoMarket: string;
  previewImage?: string | null;
  detailImages?: string[];
  videos?: string[];
  glbFile?: File | null;
  usdzFile?: File | null;
}

export interface ProductMediaUpdateResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ProductMultimediaData {
  id: number;
  sku: string;
  image_preview_url: string | null;
  image_details_urls: string[];
  video_urls: string[];
  total_images: number;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Categories API endpoints
export const categoryEndpoints = {
  getVisibleCompletas: () => apiClient.get<BackendCategory[]>("/api/categorias/visibles/completas"),
  getDistinct: () => apiClient.get<string[]>("/api/categorias/distinct"),
  create: (data: CreateCategoryRequest) =>
    apiClient.post<BackendCategory>("/api/categorias/visibles", data),
  update: (uuid: string, data: UpdateCategoryRequest) =>
    apiClient.patch<BackendCategory>(`/api/categorias/visibles/${uuid}`, data),
  updateActiveStatus: (uuid: string, activo: boolean) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/api/categorias/visibles/${uuid}/activo`, { activo }),
  delete: (uuid: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/api/categorias/visibles/${uuid}`),
  sync: () =>
    apiClient.post<{ success: boolean; message?: string }>("/api/categorias/sync"),
  updateOrder: (categoryIds: string[]) =>
    apiClient.put<{ success: boolean; message?: string }>("/api/categorias/visibles/order", { categoryIds }),
};

// Menus API endpoints
export const menuEndpoints = {
  // GET /api/categorias/visibles/:categoryId/menus
  getByCategory: (categoryId: string) =>
    apiClient.get<BackendMenu[]>(`/api/categorias/visibles/${categoryId}/menus`),
  // GET /api/categorias/distinct/menus?categoria=CATEGORIA_NAME
  getDistinct: (categoryName: string) =>
    apiClient.get<string[]>(`/api/categorias/distinct/menus?categoria=${encodeURIComponent(categoryName)}`),
  // POST /api/menus/visibles
  create: (data: CreateMenuRequest & { categoriasVisiblesId: string }) =>
    apiClient.post<BackendMenu>(`/api/menus/visibles`, data),
  // PATCH /api/menus/visibles/:menuId
  update: (menuId: string, data: UpdateMenuRequest) =>
    apiClient.patch<BackendMenu>(`/api/menus/visibles/${menuId}`, data),
  // PATCH /api/menus/visibles/:menuId/activo
  updateActiveStatus: (menuId: string, activo: boolean) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/api/menus/visibles/${menuId}/activo`, { activo }),
  // DELETE /api/menus/visibles/:menuId
  delete: (menuId: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/api/menus/visibles/${menuId}`),
  // PUT /api/menus/visibles/order
  updateOrder: (menuIds: string[]) =>
    apiClient.put<{ success: boolean; message?: string }>("/api/menus/visibles/order", { menuIds }),
};

// Submenus API endpoints
export const submenuEndpoints = {
  // GET /api/menus/visibles/:menuId/submenus
  getByMenu: (menuId: string) =>
    apiClient.get<BackendSubmenu[]>(`/api/menus/visibles/${menuId}/submenus`),
  // POST /api/submenus/visibles
  create: (data: CreateSubmenuRequest & { menusVisiblesId: string }) =>
    apiClient.post<BackendSubmenu>(`/api/submenus/visibles`, data),
  // PATCH /api/submenus/visibles/:submenuId
  update: (submenuId: string, data: UpdateSubmenuRequest) =>
    apiClient.patch<BackendSubmenu>(`/api/submenus/visibles/${submenuId}`, data),
  // PATCH /api/submenus/visibles/:submenuId/activo
  updateActiveStatus: (submenuId: string, activo: boolean) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/api/submenus/visibles/${submenuId}/activo`, { activo }),
  // DELETE /api/submenus/visibles/:submenuId
  delete: (submenuId: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/api/submenus/visibles/${submenuId}`),
  // PUT /api/submenus/visibles/order
  updateOrder: (submenuIds: string[]) =>
    apiClient.put<{ success: boolean; message?: string }>("/api/submenus/visibles/order", { submenuIds }),
};

// Multimedia API endpoints
export const multimediaEndpoints = {
  // POST /api/multimedia/menus - Create/upload image for menu (first time)
  createMenuImage: (menuId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('menuId', menuId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/menus`;
    return fetch(url, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen subida exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen subida exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al subir la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // PUT /api/multimedia/menus - Update image for menu (when image already exists)
  updateMenuImage: (menuId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('menuId', menuId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/menus`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (200 OK o 201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen actualizada exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen actualizada exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al actualizar la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // POST /api/multimedia/categorias - Create/upload image for category (first time)
  createCategoryImage: (categoryId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('categoriaId', categoryId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/categorias`;
    return fetch(url, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen subida exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen subida exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al subir la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // PUT /api/multimedia/categorias - Update image for category (when image already exists)
  updateCategoryImage: (categoryId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('categoriaId', categoryId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/categorias`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (200 OK o 201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen actualizada exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen actualizada exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al actualizar la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // DELETE /api/multimedia/menus/:id - Delete menu image
  deleteMenuImage: (menuId: string) => {
    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/multimedia/menus/${menuId}`
    );
  },

  // DELETE /api/multimedia/categorias/:id - Delete category image
  deleteCategoryImage: (categoryId: string) => {
    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/multimedia/categorias/${categoryId}`
    );
  },

  // POST /api/multimedia/submenus - Create/upload image for submenu (first time)
  createSubmenuImage: (submenuId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('submenuId', submenuId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/submenus`;
    return fetch(url, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen subida exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen subida exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al subir la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // PUT /api/multimedia/submenus - Update image for submenu (when image already exists)
  updateSubmenuImage: (submenuId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('submenuId', submenuId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/submenus`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then(async (response) => {
      // Si la respuesta es exitosa (200 OK o 201 Created), considerar como éxito
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            data: data as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: typeof data?.message === 'string' ? data.message : "Imagen actualizada exitosamente",
          };
        } catch (jsonError) {
          // Si no se puede parsear JSON pero la respuesta es exitosa, considerar como éxito
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: true,
            message: "Imagen actualizada exitosamente",
          };
        }
      } else {
        // Si la respuesta no es exitosa, intentar obtener el mensaje de error
        try {
          const data = await response.json();
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: typeof data?.message === 'string' ? data.message : (data?.error || "Error al actualizar la imagen"),
          };
        } catch (jsonError) {
          return {
            data: {} as { success: boolean; message?: string; imageUrl?: string },
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // DELETE /api/multimedia/submenus/:id - Delete submenu image
  deleteSubmenuImage: (submenuId: string) => {
    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/multimedia/submenus/${submenuId}`
    );
  },
};
