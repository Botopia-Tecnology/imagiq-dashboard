import type { LatLngExpression } from "leaflet"
import type {
  CoverageZone,
  CoverageZoneDTO,
  GeoJSONGeometry,
  GeoJSONPoint,
  GeoJSONPolygon,
  GeoJSONProperties,
} from "@/types/coverage-zones"

/**
 * Converts Leaflet LatLngExpression to GeoJSON coordinate [lng, lat]
 * Note: GeoJSON uses [longitude, latitude] order (opposite of Leaflet)
 */
export function latLngToGeoJSON(latLng: LatLngExpression): [number, number] {
  if (Array.isArray(latLng)) {
    // [lat, lng] -> [lng, lat]
    return [latLng[1], latLng[0]]
  }
  // LatLng object
  return [(latLng as any).lng, (latLng as any).lat]
}

/**
 * Converts GeoJSON coordinate [lng, lat] to Leaflet LatLngExpression [lat, lng]
 */
export function geoJSONToLatLng(coords: [number, number]): [number, number] {
  return [coords[1], coords[0]] // [lng, lat] -> [lat, lng]
}

/**
 * Converts CoverageZone (frontend) to GeoJSON geometry
 */
export function coverageZoneToGeoJSON(zone: CoverageZone): GeoJSONGeometry {
  if (zone.type === "circle" && !Array.isArray(zone.coordinates) && zone.radius) {
    // Circle -> Point with radius property
    const point: GeoJSONPoint = {
      type: "Point",
      coordinates: latLngToGeoJSON(zone.coordinates),
    }
    return point
  }

  if (zone.type === "polygon" && Array.isArray(zone.coordinates)) {
    // Polygon -> GeoJSON Polygon
    const coordinates = zone.coordinates.map((coord) => latLngToGeoJSON(coord as LatLngExpression))

    // Close the polygon if not already closed
    const firstCoord = coordinates[0]
    const lastCoord = coordinates[coordinates.length - 1]
    const isClosed = firstCoord[0] === lastCoord[0] && firstCoord[1] === lastCoord[1]

    if (!isClosed) {
      coordinates.push([...firstCoord])
    }

    const polygon: GeoJSONPolygon = {
      type: "Polygon",
      coordinates: [coordinates], // Array of linear rings
    }
    return polygon
  }

  if (zone.type === "rectangle" && Array.isArray(zone.coordinates)) {
    // Rectangle -> GeoJSON Polygon (4 corners + closing point)
    const coords = zone.coordinates.map((coord) => latLngToGeoJSON(coord as LatLngExpression))

    // Ensure we have at least 2 points for bounds
    if (coords.length >= 2) {
      const [topLeft, bottomRight] = coords
      const topRight: [number, number] = [bottomRight[0], topLeft[1]]
      const bottomLeft: [number, number] = [topLeft[0], bottomRight[1]]

      const polygon: GeoJSONPolygon = {
        type: "Polygon",
        coordinates: [[topLeft, topRight, bottomRight, bottomLeft, topLeft]],
      }
      return polygon
    }
  }

  // Fallback: empty polygon
  return {
    type: "Polygon",
    coordinates: [[]],
  }
}

/**
 * Converts CoverageZone to CoverageZoneDTO (API format)
 */
export function coverageZoneToDTO(zone: CoverageZone): Omit<CoverageZoneDTO, "id" | "createdAt" | "updatedAt"> {
  const geometry = coverageZoneToGeoJSON(zone)

  const properties: GeoJSONProperties = {
    color: zone.color,
    isActive: zone.isActive,
    deliveryFee: zone.deliveryFee,
    estimatedTime: zone.estimatedTime,
  }

  // Add radius for circles
  if (zone.type === "circle" && zone.radius) {
    properties.radius = zone.radius
    properties.radiusUnit = "meters"
  }

  return {
    cityId: zone.cityId,
    name: zone.name,
    type: "Feature",
    geometry,
    properties,
  }
}

/**
 * Converts CoverageZoneDTO (API format) to CoverageZone (frontend)
 */
export function dtoToCoverageZone(dto: CoverageZoneDTO): CoverageZone {
  let type: CoverageZone["type"] = "polygon"
  let coordinates: LatLngExpression[] | LatLngExpression = []
  let radius: number | undefined

  if (dto.geometry.type === "Point") {
    // Point with radius -> Circle
    type = "circle"
    coordinates = geoJSONToLatLng(dto.geometry.coordinates)
    radius = dto.properties.radius
  } else if (dto.geometry.type === "Polygon") {
    // Polygon -> Polygon or Rectangle
    const ring = dto.geometry.coordinates[0] || []
    coordinates = ring.slice(0, -1).map((coord) => geoJSONToLatLng(coord)) // Remove closing point

    // Detect if it's a rectangle (4 points forming a rectangle)
    if (coordinates.length === 4) {
      type = "rectangle"
    } else {
      type = "polygon"
    }
  }

  return {
    id: dto.id,
    cityId: dto.cityId,
    name: dto.name,
    type,
    coordinates,
    radius,
    color: dto.properties.color,
    deliveryFee: dto.properties.deliveryFee,
    estimatedTime: dto.properties.estimatedTime,
    isActive: dto.properties.isActive,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}

/**
 * Validates GeoJSON geometry
 */
export function validateGeoJSON(geometry: GeoJSONGeometry): boolean {
  try {
    if (geometry.type === "Point") {
      return (
        Array.isArray(geometry.coordinates) &&
        geometry.coordinates.length === 2 &&
        typeof geometry.coordinates[0] === "number" &&
        typeof geometry.coordinates[1] === "number"
      )
    }

    if (geometry.type === "Polygon") {
      return (
        Array.isArray(geometry.coordinates) &&
        geometry.coordinates.length > 0 &&
        Array.isArray(geometry.coordinates[0]) &&
        geometry.coordinates[0].length >= 4 // Minimum 3 points + closing point
      )
    }

    return false
  } catch {
    return false
  }
}
