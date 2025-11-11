// ============================================
// API CLIENT PARA TIENDAS
// ============================================

// Usar la misma configuración que el resto de la aplicación
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// ============================================
// Types
// ============================================

export interface Store {
  codigo: number
  descripcion: string
  departamento: string
  ciudad: string
  direccion: string
  place_ID: string
  ubicacion_cc: string
  horario: string
  telefono: string
  extension: number | string
  email: string
  codBodega: number | string
  codDane: number
  latitud: number | string
  longitud: number | string
}

export interface StoresResponse {
  success: boolean
  data: Store[]
  message?: string
}

// ============================================
// API Functions
// ============================================

export async function getStores(): Promise<Store[]> {
  try {
    // Asegurar que la URL tenga /api si no lo tiene
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`
    const response = await fetch(`${baseUrl}/stores`)
    
    if (!response.ok) {
      throw new Error(`Error al obtener tiendas: ${response.statusText}`)
    }

    const data: StoresResponse = await response.json()
    
    if (data.success && data.data) {
      return data.data
    }
    
    // Si la respuesta no tiene el formato esperado, intentar parsear directamente
    if (Array.isArray(data)) {
      return data as Store[]
    }
    
    throw new Error(data.message || "Error al obtener tiendas")
  } catch (error) {
    console.error("Error fetching stores:", error)
    throw error
  }
}

// ============================================
// Helper Functions
// ============================================

export function formatStoreCoordinates(store: Store): { lat: number; lon: number } | null {
  const lat = typeof store.latitud === 'string' ? parseFloat(store.latitud) : store.latitud
  const lon = typeof store.longitud === 'string' ? parseFloat(store.longitud) : store.longitud
  
  if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
    return null
  }
  
  return { lat, lon }
}

export function getStoresWithValidCoordinates(stores: Store[]): Array<Store & { position: [number, number] }> {
  return stores
    .map(store => {
      const coords = formatStoreCoordinates(store)
      if (!coords) return null
      return {
        ...store,
        position: [coords.lat, coords.lon] as [number, number]
      }
    })
    .filter((store): store is Store & { position: [number, number] } => store !== null)
}

