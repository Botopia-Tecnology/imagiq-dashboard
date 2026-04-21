/**
 * 🔐 API Client - Cliente HTTP con API Key automática
 *
 * Este módulo proporciona funciones helper para hacer peticiones HTTP al backend
 * con autenticación API Key automática.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Advertencia en desarrollo si no está configurada la API Key
if (!API_KEY && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_KEY no está configurada. Las peticiones al API fallarán.\n" +
      "Agrega NEXT_PUBLIC_API_KEY a tu archivo .env.local"
  );
}

/**
 * Error tipado de las respuestas del API. A diferencia de un `Error` plano,
 * transporta el HTTP `status` y — cuando el backend devolvió JSON con
 * `{message, ...}` — el cuerpo estructurado.
 *
 * Los consumidores pueden hacer `if (err instanceof ApiError) ...` para
 * ramificar lógica (ej. mostrar toast vs redirigir a login) sin parsear
 * strings.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly endpoint: string;

  constructor(
    status: number,
    message: string,
    options: { body?: unknown; endpoint: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = options.body;
    this.endpoint = options.endpoint;
  }
}

/**
 * Lee el mejor mensaje de error disponible en la respuesta. Prefiere JSON
 * estructurado `{message}` (el contrato del api-gateway); cae a texto plano
 * y finalmente a `statusText`.
 *
 * `statusText` suele ser "" en HTTP/2 (Railway/Vercel), por eso se evita como
 * primera opción — dejaba al usuario final viendo un `HTTP Error 400:` sin
 * cuerpo útil.
 */
async function readErrorPayload(
  response: Response,
): Promise<{ message: string; body: unknown }> {
  const clone = response.clone();
  try {
    const json = (await clone.json()) as Record<string, unknown>;
    const message =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error === "string" && json.error) ||
      null;
    if (message) return { message, body: json };
    return {
      message: response.statusText || `HTTP ${response.status}`,
      body: json,
    };
  } catch {
    // No es JSON, intentar texto plano.
    try {
      const text = await response.text();
      if (text) return { message: text, body: text };
    } catch {
      /* ignore */
    }
    return {
      message: response.statusText || `HTTP ${response.status}`,
      body: undefined,
    };
  }
}

/**
 * Maneja los códigos de estado que requieren acción global (sesión expirada,
 * rate limit). Centralizado aquí para no duplicar entre `apiClient` y
 * `apiClientFormData`.
 *
 * @returns `true` si manejó el status y relanzó; `false` si no.
 */
async function handleWellKnownHttpError(
  response: Response,
  endpoint: string,
): Promise<void> {
  if (response.status === 401) {
    if (
      typeof globalThis !== "undefined" &&
      typeof localStorage !== "undefined"
    ) {
      localStorage.removeItem("imagiq_user");
      localStorage.removeItem("imagiq_token");
      globalThis.location.href = "/login";
    }
    throw new ApiError(
      401,
      "Sesión expirada. Por favor, inicie sesión nuevamente.",
      { endpoint },
    );
  }
  if (response.status === 429) {
    throw new ApiError(
      429,
      "Demasiadas peticiones. Por favor intenta más tarde.",
      { endpoint },
    );
  }
  // Otros errores: leer body y lanzar ApiError con el mensaje real del backend.
  const { message, body } = await readErrorPayload(response);
  throw new ApiError(response.status, message, { body, endpoint });
}

/**
 * Cliente HTTP base con API Key automática.
 *
 * @param endpoint - Ruta relativa del API (ej: '/api/products')
 * @param options - Opciones de fetch estándar (incluye `signal` para cancelación)
 * @returns Promise<Response> — el `Response` sin consumir si el status es 2xx
 * @throws ApiError con `status` y `message` legible si el status no es 2xx
 *
 * @example
 * const response = await apiClient('/api/products', { method: 'GET' });
 * const data = await response.json();
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;

  // Combinar headers: API Key + headers personalizados
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(API_KEY && { "X-API-Key": API_KEY }),
    ...options.headers,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      await handleWellKnownHttpError(response, endpoint);
    }

    return response;
  } catch (error) {
    // Errores de red / AbortError / ApiError: log y re-throw.
    if (error instanceof ApiError) {
      console.error(
        `❌ API ${error.status} ${error.endpoint}: ${error.message}`,
      );
    } else if (error instanceof Error && error.name !== "AbortError") {
      console.error("❌ API Client Error:", error.message, { endpoint, url });
    }
    throw error;
  }
}

/**
 * Cliente HTTP para FormData con API Key automática
 * (No incluye Content-Type para que el navegador lo setee con boundary correcto)
 *
 * @param endpoint - Ruta relativa del API
 * @param options - Opciones de fetch estándar
 * @returns Promise<Response>
 * @throws ApiError con `status` y `message` legible si el status no es 2xx
 */
export async function apiClientFormData(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;

  // Headers sin Content-Type (para FormData)
  const headers = new Headers({
    ...(API_KEY && { "X-API-Key": API_KEY }),
    ...options.headers,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      await handleWellKnownHttpError(response, endpoint);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(
        `❌ API ${error.status} ${error.endpoint}: ${error.message}`,
      );
    } else if (error instanceof Error && error.name !== "AbortError") {
      console.error("❌ API Client Error:", error.message, { endpoint, url });
    }
    throw error;
  }
}

/**
 * Helper para peticiones GET con tipado TypeScript
 *
 * @param endpoint - Ruta relativa del API
 * @param options - Opciones adicionales (headers, signal, etc.)
 * @returns Promise con datos parseados
 *
 * @example
 * const products = await apiGet<Product[]>('/api/products?limit=10');
 * const data = await apiGet<Data>('/api/data', { headers: { Authorization: 'Bearer token' } });
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options: Omit<RequestInit, "method" | "body"> = {}
): Promise<T> {
  const response = await apiClient(endpoint, { ...options, method: "GET" });
  return response.json();
}

/**
 * Helper para peticiones POST con tipado TypeScript
 *
 * @param endpoint - Ruta relativa del API
 * @param data - Datos a enviar en el body
 * @returns Promise con datos parseados
 *
 * @example
 * const order = await apiPost<Order>('/api/orders', { items: [...] });
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper para peticiones PUT con tipado TypeScript
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper para peticiones PATCH con tipado TypeScript
 */
export async function apiPatch<T = unknown>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper para peticiones DELETE con tipado TypeScript
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: "DELETE" });

  // Algunas APIs de DELETE retornan 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Obtener URL base del API
 */
export function getApiUrl(): string {
  return API_URL;
}

/**
 * Verificar si la API Key está configurada
 */
export function isApiKeyConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Obtener la API Key (para casos especiales)
 */
export function getApiKey(): string | undefined {
  return API_KEY;
}
