import type { LatLngExpression } from "leaflet"

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
