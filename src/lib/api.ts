/**
 * Cliente API para comunicación con microservicios
 * - Configuración base de Axios o Fetch
 * - Interceptors para auth tokens
 * - Manejo centralizado de errores
 * - Retry logic para requests fallidos
 * - Rate limiting y caching
 * - TypeScript interfaces para requests/responses
 */

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
      const data = await response?.json();

      return {
        data: data as T,
        success: response.ok,
        message: data.message,
        errors: data.errors,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: {} as T,
        success: false,
        message: "Request failed",
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
      const data = await response?.json();

      return {
        data: data as T,
        success: response.ok,
        message: data.message,
        errors: data.errors,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: {} as T,
        success: false,
        message: "Request failed",
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
  codigoMarket: string[];
  nombreMarket: string;
  categoria: string;
  subcategoria: string;
  modelo: string;
  color: string[];
  capacidad: string[];
  descGeneral: string | null;
  sku: string[];
  desDetallada: string[];
  stock: number[];
  imagePreviewUrl: string[];
  imageDetailsUrls?: string[][]; // Array de arrays de URLs de imágenes detalladas
  urlImagenes: string[];
  urlRender3D: string[];
  precioNormal: number[];
  precioDescto: number[];
  fechaInicioVigencia: string[];
  fechaFinalVigencia: string[];
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
