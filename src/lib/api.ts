/**
 * Cliente API para comunicación con microservicios
 * - Configuración base de Axios o Fetch
 * - Interceptors para auth tokens
 * - Manejo centralizado de errores
 * - Retry logic para requests fallidos
 * - Rate limiting y caching
 * - TypeScript interfaces para requests/responses
 */

import { BackendCategory, BackendSubcategory, CreateCategoryRequest, UpdateCategoryRequest, CreateSubcategoryRequest, UpdateSubcategoryRequest } from "@/types";

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
  getById: (id: string) =>
    apiClient.get<ProductApiResponse>(`/api/products/${id}`),
  getByCategory: (category: string) =>
    apiClient.get<ProductApiResponse>(
      `/api/products/filtered?categoria=${category}`
    ),
  getBySubcategory: (subcategory: string) =>
    apiClient.get<ProductApiResponse>(
      `/api/products/filtered?subcategoria=${subcategory}`
    ),
  getByCodigoMarket: (codigoMarket: string) =>
    apiClient.get<ProductApiResponse>(
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
  subcategoria?: string;
  precioMin?: number;
  precioMax?: number;
  conDescuento?: boolean;
  stockMinimo?: number;
  color?: string;
  capacidad?: string;
  nombre?: string;
  modelo?: string;
  desDetallada?: string;
  codigoMarket?: string;
  filterMode?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?:  "desc"  |"asc" ;
}


// API Response types
export interface ProductApiResponse {
  products: ProductApiData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  subcategoria: string;
  modelo: string;
  color?: string[];
  capacidad?: string[];
  descGeneral?: string | null;
  sku?: string[];
  desDetallada?: string[];
  stock?: number[];
  imagePreviewUrl?: string[];
  imageDetailsUrls?: string[][]; // Array de arrays de URLs de imágenes detalladas
  urlImagenes?: string[];
  urlRender3D?: string[];
  precioNormal?: number[];
  precioDescto?: number[];
  fechaInicioVigencia?: string[];
  fechaFinalVigencia?: string[];
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
  getVisible: () => apiClient.get<BackendCategory[]>("/api/categorias/visibles"),
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

// Subcategories API endpoints
export const subcategoryEndpoints = {
  // GET /api/categorias/visibles/:categoryId/subcategorias
  getByCategory: (categoryId: string) =>
    apiClient.get<BackendSubcategory[]>(`/api/categorias/visibles/${categoryId}/subcategorias`),
  // GET /api/categorias/distinct/subcategorias?categoria=CATEGORIA_NAME
  getDistinct: (categoryName: string) =>
    apiClient.get<string[]>(`/api/categorias/distinct/subcategorias?categoria=${encodeURIComponent(categoryName)}`),
  // POST /api/subcategorias/visibles
  create: (data: CreateSubcategoryRequest & { categoriasVisiblesId: string }) =>
    apiClient.post<BackendSubcategory>(`/api/subcategorias/visibles`, data),
  // PATCH /api/subcategorias/visibles/:subcategoryId
  update: (subcategoryId: string, data: UpdateSubcategoryRequest) =>
    apiClient.patch<BackendSubcategory>(`/api/subcategorias/visibles/${subcategoryId}`, data),
  // PATCH /api/subcategorias/visibles/:subcategoryId/activo
  updateActiveStatus: (subcategoryId: string, activo: boolean) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/api/subcategorias/visibles/${subcategoryId}/activo`, { activo }),
  // DELETE /api/subcategorias/visibles/:subcategoryId
  delete: (subcategoryId: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/api/subcategorias/visibles/${subcategoryId}`),
  // PUT /api/subcategorias/visibles/order
  updateOrder: (subcategoryIds: string[]) =>
    apiClient.put<{ success: boolean; message?: string }>("/api/subcategorias/visibles/order", { subcategoryIds }),
};

// Multimedia API endpoints
export const multimediaEndpoints = {
  // POST /api/multimedia/subcategorias - Create/upload image for subcategory (first time)
  createSubcategoryImage: (subcategoryId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('subcategoriaId', subcategoryId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/subcategorias`;
    return fetch(url, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data: data as { success: boolean; message?: string; imageUrl?: string },
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // PUT /api/multimedia/subcategorias - Update image for subcategory (when image already exists)
  updateSubcategoryImage: (subcategoryId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('subcategoriaId', subcategoryId);
    formData.append('file', imageFile);

    const url = `${API_BASE_URL}/api/multimedia/subcategorias`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        data: data as { success: boolean; message?: string; imageUrl?: string },
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
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
      const data = await response.json();
      return {
        data: data as { success: boolean; message?: string; imageUrl?: string },
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
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
      const data = await response.json();
      return {
        data: data as { success: boolean; message?: string; imageUrl?: string },
        success: response.ok,
        message: typeof data?.message === 'string' ? data.message : (data?.error || "Error desconocido"),
      };
    }).catch((error) => ({
      data: {} as { success: boolean; message?: string; imageUrl?: string },
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
  },

  // DELETE /api/multimedia/subcategorias/:id - Delete subcategory image
  deleteSubcategoryImage: (subcategoryId: string) => {
    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/multimedia/subcategorias/${subcategoryId}`
    );
  },

  // DELETE /api/multimedia/categorias/:id - Delete category image
  deleteCategoryImage: (categoryId: string) => {
    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/multimedia/categorias/${categoryId}`
    );
  },
};
