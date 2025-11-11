"use client"

import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from "react"
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMap } from "react-leaflet"
import { FeatureGroup } from "react-leaflet"
import { EditControl } from "react-leaflet-draw-next"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"
import type { ZonaCobertura, Coordenada } from "@/lib/api/coverage-zones"
import { getStores, getStoresWithValidCoordinates, type Store } from "@/lib/api/stores"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"

interface MapViewerProps {
  center: [number, number]
  zoom: number
  zones: ZonaCobertura[]
  onZoneCreated?: (coordinates: Coordenada[], tipo: "polygon" | "circle" | "rectangle") => void
}

export interface MapViewerRef {
  focusOnZone: (zoneId: string) => void
}

function MapController({ 
  center, 
  zoom, 
  focusZoneId,
  zones 
}: { 
  center: [number, number]
  zoom: number
  focusZoneId: string | null
  zones: ZonaCobertura[]
}) {
  const map = useMap()
  const prevCenterRef = useRef<[number, number] | null>(null)
  const prevZoomRef = useRef<number | null>(null)

  useEffect(() => {
    // Verificar que el mapa esté inicializado
    if (!map || !map.getContainer()) {
      return
    }

    // Verificar si center o zoom han cambiado
    const centerChanged = !prevCenterRef.current || 
      prevCenterRef.current[0] !== center[0] || 
      prevCenterRef.current[1] !== center[1]
    const zoomChanged = prevZoomRef.current === null || prevZoomRef.current !== zoom

    // Actualizar referencias
    prevCenterRef.current = center
    prevZoomRef.current = zoom

    // Si no hay focusZoneId y las coordenadas o zoom cambiaron, actualizar el mapa
    if (!focusZoneId && (centerChanged || zoomChanged)) {
      // Pequeño delay para asegurar que el mapa esté completamente renderizado
      const timeoutId = setTimeout(() => {
        if (!map || !map.getContainer()) {
          return
        }
        try {
          map.setView(center, zoom, { animate: true })
        } catch (error) {
          console.error("Error setting map view:", error)
        }
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }

    // Si hay focusZoneId, hacer zoom a la zona
    if (focusZoneId) {
      const timeoutId = setTimeout(() => {
        if (!map || !map.getContainer()) {
          return
        }

        // Buscar la zona y hacer zoom a ella
        const zone = zones.find(z => z.id === focusZoneId)
        if (!zone || !zone.geometria || !zone.geometria.coordinates) return

        try {
          let coordinateRing: number[][] | number[][][] = zone.geometria.coordinates

          // Si es un array de arrays de arrays (Polygon con múltiples anillos)
          if (Array.isArray(coordinateRing[0]) && Array.isArray(coordinateRing[0][0]) && Array.isArray(coordinateRing[0][0][0])) {
            coordinateRing = coordinateRing[0] as number[][] // Tomar el primer anillo (exterior)
          }

          // Asegurar que coordinateRing es number[][]
          if (!Array.isArray(coordinateRing) || coordinateRing.length === 0) return
          if (!Array.isArray(coordinateRing[0])) return

          // Convertir coordenadas GeoJSON [lon, lat] a Leaflet [lat, lon]
          const latlngs = (coordinateRing as number[][]).map((coord: number[]) => 
            [coord[1], coord[0]] as [number, number]
          )

          // Calcular bounds de la zona
          const bounds = L.latLngBounds(latlngs)
          
          // Hacer zoom a la zona con padding
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        } catch (error) {
          console.error("Error focusing on zone:", error)
        }
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [focusZoneId, zones, center, zoom, map])

  return null
}

// Icono Samsung "S" para tiendas
const getSamsungIcon = (isSelected: boolean = false) => L.divIcon({
  className: "custom-samsung-pin",
  html: `
    <div style="width:32px;height:40px;display:flex;align-items:center;justify-content:center;">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.27 0 0 7.56 0 16.9C0 27.1 16 40 16 40C16 40 32 27.1 32 16.9C32 7.56 24.73 0 16 0Z"
               fill="${isSelected ? 'white' : '#1D8AFF'}"
               stroke="${isSelected ? '#1D8AFF' : 'white'}"
               stroke-width="2"/>
        <text x="50%" y="56%" text-anchor="middle"
               dominant-baseline="middle"
               font-family="Samsung Sharp Sans, Arial, sans-serif"
               font-size="18"
               font-weight="bold"
               fill="${isSelected ? '#1D8AFF' : 'white'}">S</text>
      </svg>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

export const MapViewer = forwardRef<MapViewerRef, MapViewerProps>(
  ({ center, zoom, zones, onZoneCreated }, ref) => {
  const [featureGroup, setFeatureGroup] = useState<L.FeatureGroup | null>(null)
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null)
  const [stores, setStores] = useState<Array<Store & { position: [number, number] }>>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [loadingStores, setLoadingStores] = useState(false)

  // Exponer función para hacer zoom a una zona
  useImperativeHandle(ref, () => ({
    focusOnZone: (zoneId: string) => {
      setFocusZoneId(zoneId)
      // Resetear después de 1 segundo para permitir volver a hacer zoom
      setTimeout(() => setFocusZoneId(null), 1000)
    }
  }))

  // Cargar tiendas al montar el componente
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true)
      try {
        const storesData = await getStores()
        const storesWithCoords = getStoresWithValidCoordinates(storesData)
        setStores(storesWithCoords)
      } catch (error) {
        console.error("Error loading stores:", error)
        // No mostrar error al usuario, simplemente no mostrar tiendas
      } finally {
        setLoadingStores(false)
      }
    }

    loadStores()
  }, [])

  const handleCreated = (e: any) => {
    const { layerType, layer } = e

    let coordinates: Coordenada[] = []

    if (layerType === "polygon" || layerType === "rectangle") {
      // Para polígonos y rectángulos, obtener todos los puntos
      const latlngs = layer.getLatLngs()[0] // Primer anillo del polígono
      coordinates = latlngs.map((latlng: any) => ({
        lat: latlng.lat,
        lon: latlng.lng,
      }))
    } else if (layerType === "circle") {
      // Para círculos, usar el centro y crear un polígono aproximado
      const center = layer.getLatLng()
      const radius = layer.getRadius()

      // Crear un polígono de 32 puntos alrededor del círculo
      const points = 32
      coordinates = []
      for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points
        const lat = center.lat + (radius / 111320) * Math.cos((angle * Math.PI) / 180)
        const lon = center.lng + (radius / (111320 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180)
        coordinates.push({ lat, lon })
      }
    }

    if (coordinates.length > 0) {
      onZoneCreated?.(coordinates, layerType as "polygon" | "circle" | "rectangle")
    }

    // Remover la capa dibujada ya que la renderizaremos desde el estado
    if (featureGroup) {
      featureGroup.removeLayer(layer)
    }
  }

  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapController center={center} zoom={zoom} focusZoneId={focusZoneId} zones={zones} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={setFeatureGroup}>
          {featureGroup && (
            <EditControl
              position="topright"
              onCreated={handleCreated}
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

        {/* Renderizar zonas existentes */}
        {zones.map((zone) => {
          // Convertir geometría GeoJSON a formato Leaflet
          if (!zone.geometria || !zone.geometria.coordinates) return null

          try {
            // Manejar diferentes formatos de coordenadas
            let coordinateRing: number[][] | number[][][] = zone.geometria.coordinates

            // Si es un array de arrays de arrays (Polygon con múltiples anillos)
            if (Array.isArray(coordinateRing[0]) && Array.isArray(coordinateRing[0][0]) && Array.isArray(coordinateRing[0][0][0])) {
              coordinateRing = coordinateRing[0] as number[][] // Tomar el primer anillo (exterior)
            }

            // Asegurar que coordinateRing es number[][]
            if (!Array.isArray(coordinateRing) || coordinateRing.length === 0) {
              console.warn("Invalid coordinates for zone:", zone.id)
              return null
            }
            if (!Array.isArray(coordinateRing[0])) {
              console.warn("Invalid coordinates format for zone:", zone.id)
              return null
            }

            const coordinates: LatLngExpression[] = (coordinateRing as number[][]).map(
              (coord: number[]) => [coord[1], coord[0]] as LatLngExpression // GeoJSON es [lon, lat], Leaflet es [lat, lon]
            )

            // Determinar color según estado
            const fillColor = zone.estado === "activa" ? "#10b981" : "#ef4444"

            return (
              <Polygon
                key={zone.id}
                positions={coordinates}
                pathOptions={{
                  color: fillColor,
                  fillColor,
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm">{zone.nombre}</h3>
                    <p className="text-xs text-gray-600">Ciudad: {zone.ciudad}</p>
                    <p className="text-xs text-gray-600">Tipo: {zone.tipo}</p>
                    <p className="text-xs">
                      Estado:{" "}
                      <span
                        className={
                          zone.estado === "activa"
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {zone.estado}
                      </span>
                    </p>
                  </div>
                </Popup>
              </Polygon>
            )
          } catch (error) {
            console.error("Error rendering zone:", zone.id, error)
            return null
          }
        })}

        {/* Renderizar marcadores de tiendas con icono "S" */}
        {stores.map((store) => {
          const isSelected = selectedStore?.codigo === store.codigo
          return (
            <Marker
              key={store.codigo}
              position={store.position}
              icon={getSamsungIcon(isSelected)}
              eventHandlers={{
                click: () => {
                  if (selectedStore?.codigo === store.codigo) {
                    setSelectedStore(null) // Deseleccionar
                  } else {
                    setSelectedStore(store) // Seleccionar
                  }
                },
              }}
            >
              <Popup maxWidth={200}>
                <div className="p-1.5">
                  <b className="text-xs font-bold block truncate">{store.descripcion}</b>
                  <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">{store.direccion}</p>
                  {store.telefono && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {store.telefono}{store.extension && ` Ext ${store.extension}`}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
})

MapViewer.displayName = "MapViewer"
