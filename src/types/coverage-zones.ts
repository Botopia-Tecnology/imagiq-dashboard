import type { LatLngExpression } from "leaflet"

// ============================================
// Frontend Types (Leaflet-based)
// ============================================

export interface City {
  id: string
  name: string
  coordinates: LatLngExpression
  zoom: number
}

export interface CoverageZone {
  id: string
  cityId: string
  name: string
  type: "polygon" | "circle" | "rectangle"
  coordinates: LatLngExpression[] | LatLngExpression
  radius?: number
  color?: string
  deliveryFee?: number
  estimatedTime?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface CoverageZoneFormData {
  name: string
  cityId: string
  type: CoverageZone["type"]
  color: string
}

// ============================================
// GeoJSON Types (RFC 7946 Standard)
// ============================================

export type GeoJSONGeometryType = "Point" | "Polygon" | "MultiPolygon"

export interface GeoJSONPoint {
  type: "Point"
  coordinates: [number, number] // [longitude, latitude]
}

export interface GeoJSONPolygon {
  type: "Polygon"
  coordinates: Array<Array<[number, number]>> // Array of linear rings
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon"
  coordinates: Array<Array<Array<[number, number]>>>
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon

export interface GeoJSONProperties {
  color?: string
  isActive: boolean
  deliveryFee?: number
  estimatedTime?: string
  radius?: number
  radiusUnit?: "meters" | "kilometers"
}

export interface GeoJSONFeature {
  type: "Feature"
  geometry: GeoJSONGeometry
  properties: GeoJSONProperties
}

// ============================================
// API Request/Response Types
// ============================================

export interface CoverageZoneDTO {
  id: string
  cityId: string
  name: string
  type: "Feature"
  geometry: GeoJSONGeometry
  properties: GeoJSONProperties
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface CreateCoverageZoneRequest {
  cityId: string
  name: string
  geometry: GeoJSONGeometry
  properties: GeoJSONProperties
}

export interface UpdateCoverageZoneRequest {
  name?: string
  geometry?: GeoJSONGeometry
  properties?: Partial<GeoJSONProperties>
}

export interface CoverageCheckRequest {
  point: {
    lat: number
    lng: number
  }
  cityId: string
}

export interface CoverageCheckResponse {
  covered: boolean
  zone?: {
    id: string
    name: string
    deliveryFee?: number
    estimatedTime?: string
  }
}

export interface APIResponse<T> {
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
