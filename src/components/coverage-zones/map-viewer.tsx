"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Polygon, Circle, Rectangle, useMap } from "react-leaflet"
import { FeatureGroup } from "react-leaflet"
import { EditControl } from "react-leaflet-draw-next"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import type { CoverageZone } from "@/types/coverage-zones"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"

interface MapViewerProps {
  center: LatLngExpression
  zoom: number
  zones: CoverageZone[]
  onZoneCreated?: (zone: Partial<CoverageZone>) => void
  onZoneEdited?: (id: string, zone: Partial<CoverageZone>) => void
  onZoneDeleted?: (id: string) => void
}

function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

export function MapViewer({ center, zoom, zones, onZoneCreated, onZoneEdited, onZoneDeleted }: MapViewerProps) {
  const [featureGroup, setFeatureGroup] = useState<L.FeatureGroup | null>(null)

  const handleCreated = (e: any) => {
    const { layerType, layer } = e
    const coordinates = layerType === "circle"
      ? layer.getLatLng()
      : layer.getLatLngs()[0]

    const newZone: Partial<CoverageZone> = {
      type: layerType,
      coordinates,
      radius: layerType === "circle" ? layer.getRadius() : undefined,
    }

    onZoneCreated?.(newZone)

    // Remove the drawn layer as we'll render it from state
    if (featureGroup) {
      featureGroup.removeLayer(layer)
    }
  }

  const handleEdited = (e: any) => {
    const layers = e.layers
    layers.eachLayer((layer: any) => {
      // Handle edit logic if needed
      console.log("Edited layer:", layer)
    })
  }

  const handleDeleted = (e: any) => {
    const layers = e.layers
    layers.eachLayer((layer: any) => {
      // Handle delete logic if needed
      console.log("Deleted layer:", layer)
    })
  }

  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={setFeatureGroup}>
          {featureGroup && (
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
              featureGroup={featureGroup}
              draw={{
                rectangle: true,
                circle: true,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                },
              }}
            />
          )}
        </FeatureGroup>

        {zones.map((zone) => {
          if (!zone.isActive) return null

          const fillColor = zone.color || "#3b82f6"
          const options = {
            color: fillColor,
            fillColor,
            fillOpacity: 0.3,
            weight: 2,
          }

          if (zone.type === "polygon" && Array.isArray(zone.coordinates)) {
            return (
              <Polygon
                key={zone.id}
                positions={zone.coordinates as LatLngExpression[]}
                pathOptions={options}
              />
            )
          }

          if (zone.type === "circle" && !Array.isArray(zone.coordinates) && zone.radius) {
            return (
              <Circle
                key={zone.id}
                center={zone.coordinates as LatLngExpression}
                radius={zone.radius}
                pathOptions={options}
              />
            )
          }

          if (zone.type === "rectangle" && Array.isArray(zone.coordinates) && zone.coordinates.length >= 2) {
            return (
              <Rectangle
                key={zone.id}
                bounds={zone.coordinates as LatLngBoundsExpression}
                pathOptions={options}
              />
            )
          }

          return null
        })}
      </MapContainer>
    </div>
  )
}
