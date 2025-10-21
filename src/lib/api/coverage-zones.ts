import type {
  CoverageZone,
  CoverageZoneDTO,
  CreateCoverageZoneRequest,
  UpdateCoverageZoneRequest,
  CoverageCheckRequest,
  CoverageCheckResponse,
  APIResponse,
} from "@/types/coverage-zones"
import { coverageZoneToDTO, dtoToCoverageZone } from "@/lib/utils/geojson"

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
const COVERAGE_ZONES_ENDPOINT = `${API_BASE_URL}/coverage-zones`

// ============================================
// HTTP Client Helper
// ============================================

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function fetchAPI<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new APIError(
        error.message || `HTTP ${response.status}`,
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) throw error

    throw new APIError(
      error instanceof Error ? error.message : "Network error",
      0,
      error
    )
  }
}

// ============================================
// Coverage Zones API Service
// ============================================

export const coverageZonesAPI = {
  /**
   * Get all coverage zones for a city
   */
  async getZonesByCity(cityId: string): Promise<CoverageZone[]> {
    const url = `${COVERAGE_ZONES_ENDPOINT}?cityId=${encodeURIComponent(cityId)}`
    const response = await fetchAPI<APIResponse<CoverageZoneDTO[]>>(url)

    return response.data.map(dtoToCoverageZone)
  },

  /**
   * Get a single coverage zone by ID
   */
  async getZoneById(id: string): Promise<CoverageZone> {
    const url = `${COVERAGE_ZONES_ENDPOINT}/${id}`
    const response = await fetchAPI<APIResponse<CoverageZoneDTO>>(url)

    return dtoToCoverageZone(response.data)
  },

  /**
   * Create a new coverage zone
   */
  async createZone(zone: CoverageZone): Promise<CoverageZone> {
    const dto = coverageZoneToDTO(zone)

    const payload: CreateCoverageZoneRequest = {
      cityId: dto.cityId,
      name: dto.name,
      geometry: dto.geometry,
      properties: dto.properties,
    }

    const response = await fetchAPI<APIResponse<CoverageZoneDTO>>(COVERAGE_ZONES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return dtoToCoverageZone(response.data)
  },

  /**
   * Update an existing coverage zone
   */
  async updateZone(id: string, updates: Partial<CoverageZone>): Promise<CoverageZone> {
    const payload: UpdateCoverageZoneRequest = {}

    if (updates.name !== undefined) {
      payload.name = updates.name
    }

    if (updates.coordinates !== undefined || updates.type !== undefined) {
      // If coordinates changed, rebuild geometry
      const tempZone: CoverageZone = {
        id,
        cityId: updates.cityId || "",
        name: updates.name || "",
        type: updates.type || "polygon",
        coordinates: updates.coordinates || [],
        radius: updates.radius,
        color: updates.color,
        isActive: updates.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const dto = coverageZoneToDTO(tempZone)
      payload.geometry = dto.geometry
    }

    if (
      updates.color !== undefined ||
      updates.isActive !== undefined ||
      updates.deliveryFee !== undefined ||
      updates.estimatedTime !== undefined
    ) {
      payload.properties = {
        color: updates.color,
        isActive: updates.isActive,
        deliveryFee: updates.deliveryFee,
        estimatedTime: updates.estimatedTime,
      }
    }

    const response = await fetchAPI<APIResponse<CoverageZoneDTO>>(
      `${COVERAGE_ZONES_ENDPOINT}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    )

    return dtoToCoverageZone(response.data)
  },

  /**
   * Delete a coverage zone
   */
  async deleteZone(id: string): Promise<void> {
    await fetchAPI<APIResponse<void>>(`${COVERAGE_ZONES_ENDPOINT}/${id}`, {
      method: "DELETE",
    })
  },

  /**
   * Check if a point is covered by any zone
   */
  async checkCoverage(
    lat: number,
    lng: number,
    cityId: string
  ): Promise<CoverageCheckResponse> {
    const payload: CoverageCheckRequest = {
      point: { lat, lng },
      cityId,
    }

    const response = await fetchAPI<APIResponse<CoverageCheckResponse>>(
      `${COVERAGE_ZONES_ENDPOINT}/check`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )

    return response.data
  },

  /**
   * Batch check multiple addresses
   */
  async batchCheckCoverage(
    points: Array<{ lat: number; lng: number }>,
    cityId: string
  ): Promise<CoverageCheckResponse[]> {
    const response = await fetchAPI<APIResponse<CoverageCheckResponse[]>>(
      `${COVERAGE_ZONES_ENDPOINT}/batch-check`,
      {
        method: "POST",
        body: JSON.stringify({ points, cityId }),
      }
    )

    return response.data
  },
}

// ============================================
// Export Error Class
// ============================================

export { APIError }
