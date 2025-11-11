"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Pencil, Trash2, Check, X, RefreshCw, Cloud, CloudOff, ZoomIn, AlertTriangle } from "lucide-react"
import { useCoverageZones } from "@/hooks/use-coverage-zones"
import { TipoGeometria, EstadoZona, type Coordenada } from "@/lib/api/coverage-zones"
import { CoverageChecker } from "@/components/coverage-zones/coverage-checker"
import type { MapViewerRef } from "@/components/coverage-zones/map-viewer"
import { getStores } from "@/lib/api/stores"

// Dynamic import to avoid SSR issues with Leaflet
const MapViewer = dynamic(
  () => import("@/components/coverage-zones/map-viewer").then((mod) => mod.MapViewer),
  { ssr: false }
)

// Lista de ciudades disponibles
const CIUDADES = [
  { id: "bogota", nombre: "Bogotá", coordinates: [4.7110, -74.0721] as [number, number], zoom: 11 },
  { id: "medellin", nombre: "Medellín", coordinates: [6.2442, -75.5812] as [number, number], zoom: 12 },
  { id: "cali", nombre: "Cali", coordinates: [3.4516, -76.5320] as [number, number], zoom: 12 },
  { id: "barranquilla", nombre: "Barranquilla", coordinates: [10.9685, -74.7813] as [number, number], zoom: 12 },
  { id: "cartagena", nombre: "Cartagena", coordinates: [10.3910, -75.4794] as [number, number], zoom: 12 },
]

export default function ZonasCoberturaPage() {
  const [selectedCiudad, setSelectedCiudad] = useState<string>("Bogotá")
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [availableCities, setAvailableCities] = useState<typeof CIUDADES>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const mapViewerRef = useRef<MapViewerRef>(null)

  // Hook para API
  const {
    zones,
    isLoading,
    error,
    createZone,
    updateZone,
    deleteZone,
    refreshZones,
    checkCoverage,
  } = useCoverageZones({
    ciudad: selectedCiudad,
    autoFetch: true,
  })

  // Cargar ciudades donde hay tiendas
  useEffect(() => {
    const loadCitiesWithStores = async () => {
      setLoadingCities(true)
      try {
        const stores = await getStores()
        // Extraer ciudades únicas de las tiendas y calcular coordenadas promedio
        const citiesMap = new Map<string, { count: number; latSum: number; lonSum: number }>()
        
        stores.forEach(store => {
          if (store.ciudad && store.ciudad.trim()) {
            const cityName = store.ciudad.trim()
            const lat = typeof store.latitud === 'string' ? parseFloat(store.latitud.trim()) : store.latitud
            const lon = typeof store.longitud === 'string' ? parseFloat(store.longitud.trim()) : store.longitud
            
            // Solo contar tiendas con coordenadas válidas
            if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
              if (!citiesMap.has(cityName)) {
                citiesMap.set(cityName, { count: 0, latSum: 0, lonSum: 0 })
              }
              const cityData = citiesMap.get(cityName)!
              cityData.count++
              cityData.latSum += lat
              cityData.lonSum += lon
            }
          }
        })
        
        // Crear array de ciudades disponibles
        // Primero, buscar ciudades que están en CIUDADES y tienen tiendas
        const citiesFromList = CIUDADES.filter(city => 
          citiesMap.has(city.nombre)
        )
        
        // Luego, agregar ciudades que tienen tiendas pero no están en CIUDADES
        // Usar coordenadas promedio de las tiendas para calcular el centro
        const citiesNotInList: typeof CIUDADES = []
        citiesMap.forEach((cityData, cityName) => {
          if (!CIUDADES.find(c => c.nombre === cityName)) {
            // Calcular promedio de coordenadas de las tiendas
            const avgLat = cityData.latSum / cityData.count
            const avgLon = cityData.lonSum / cityData.count
            
            citiesNotInList.push({
              id: cityName.toLowerCase().replace(/\s+/g, '-'),
              nombre: cityName,
              coordinates: [avgLat, avgLon] as [number, number],
              zoom: 12
            })
          }
        })
        
        // Combinar ambas listas
        const allCitiesWithStores = [...citiesFromList, ...citiesNotInList]
        
        // Si hay ciudades con tiendas, usar esas; si no, mostrar todas de CIUDADES
        if (allCitiesWithStores.length > 0) {
          setAvailableCities(allCitiesWithStores)
          
          // Si la ciudad seleccionada no está en las disponibles, seleccionar la primera
          if (!allCitiesWithStores.find(c => c.nombre === selectedCiudad)) {
            setSelectedCiudad(allCitiesWithStores[0].nombre)
          }
        } else {
          // Si no hay tiendas, mostrar todas las ciudades como fallback
          setAvailableCities(CIUDADES)
        }
      } catch (error) {
        console.error("Error loading cities with stores:", error)
        // Si hay error, mostrar todas las ciudades como fallback
        setAvailableCities(CIUDADES)
      } finally {
        setLoadingCities(false)
      }
    }

    loadCitiesWithStores()
  }, [])

  const selectedCityData = useMemo(
    () => {
      if (availableCities.length === 0) return CIUDADES.find((city) => city.nombre === selectedCiudad) || CIUDADES[0]
      return availableCities.find((city) => city.nombre === selectedCiudad) || availableCities[0]
    },
    [selectedCiudad, availableCities]
  )

  const handleZoneCreated = async (coordinates: Coordenada[], tipo: "polygon" | "circle" | "rectangle") => {
    const newZone = {
      nombre: `Zona ${zones.length + 1}`,
      ciudad: selectedCiudad,
      tipo: tipo as TipoGeometria,
      coordenadas: coordinates,
      estado: EstadoZona.ACTIVA,
    }

    await createZone(newZone)
  }

  const handleToggleZone = async (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    if (!zone) return

    const newEstado = zone.estado === EstadoZona.ACTIVA ? EstadoZona.INACTIVA : EstadoZona.ACTIVA

    await updateZone(zoneId, { estado: newEstado })
  }

  const handleDeleteZone = (zoneId: string) => {
    setDeleteZoneId(zoneId)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteZone = async () => {
    if (deleteZoneId) {
      await deleteZone(deleteZoneId)
      setIsDeleteModalOpen(false)
      setDeleteZoneId(null)
    }
  }

  const cancelDeleteZone = () => {
    setIsDeleteModalOpen(false)
    setDeleteZoneId(null)
  }

  const handleStartEdit = (zone: any) => {
    setEditingZoneId(zone.id)
    setEditingName(zone.nombre)
  }

  const handleSaveEdit = async (zoneId: string) => {
    if (editingName.trim()) {
      await updateZone(zoneId, { nombre: editingName.trim() })
    }
    setEditingZoneId(null)
    setEditingName("")
  }

  const handleCancelEdit = () => {
    setEditingZoneId(null)
    setEditingName("")
  }

  const handleCheckCoverage = async (lat: number, lon: number) => {
    return await checkCoverage(lat, lon, selectedCiudad)
  }

  const isOnline = !error || error.status !== 0

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Zonas de Cobertura</h1>
            {!isOnline ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <CloudOff className="h-3 w-3" />
                Sin conexión
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600">
                <Cloud className="h-3 w-3" />
                Conectado
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Configura las zonas de entrega para cada ciudad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refreshZones()}
            disabled={isLoading}
            title="Refrescar zonas"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Select value={selectedCiudad} onValueChange={setSelectedCiudad} disabled={loadingCities}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={loadingCities ? "Cargando ciudades..." : "Selecciona una ciudad"} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.length > 0 ? (
                availableCities.map((ciudad) => (
                  <SelectItem key={ciudad.id} value={ciudad.nombre}>
                    {ciudad.nombre}
                  </SelectItem>
                ))
              ) : (
                CIUDADES.map((ciudad) => (
                  <SelectItem key={ciudad.id} value={ciudad.nombre}>
                    {ciudad.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        {/* Mapa a la izquierda */}
        <Card className="lg:col-span-3 flex flex-col order-1">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de {selectedCiudad}
            </CardTitle>
            <CardDescription>
              Dibuja polígonos, círculos o rectángulos para definir las zonas de cobertura
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0 min-h-0">
            {selectedCityData ? (
              <MapViewer
                ref={mapViewerRef}
                center={selectedCityData.coordinates}
                zoom={selectedCityData.zoom}
                zones={zones}
                onZoneCreated={handleZoneCreated}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {loadingCities ? "Cargando ciudades..." : "Selecciona una ciudad"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna derecha: Verificar Cobertura arriba, Zonas Activas abajo */}
        <div className="lg:col-span-1 flex flex-col gap-3 order-2">
          {/* Verificar Cobertura - Arriba */}
          <CoverageChecker ciudad={selectedCiudad} onCheckCoverage={handleCheckCoverage} />

          {/* Zonas Activas - Abajo */}
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="py-3 px-4">
              <CardTitle>Zonas Activas</CardTitle>
              <CardDescription>
                {zones.length} {zones.length === 1 ? "zona" : "zonas"} configuradas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0 overflow-hidden flex flex-col">
              {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay zonas configuradas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa las herramientas del mapa para crear zonas
                  </p>
                </div>
              ) : (
                <div 
                  className="space-y-2 overflow-y-scroll flex-1 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500" 
                  style={{ 
                    maxHeight: 'calc(100vh - 500px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(155, 155, 155, 0.7) transparent',
                  }}
                >
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          {editingZoneId === zone.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit(zone.id)
                                  if (e.key === "Escape") handleCancelEdit()
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={() => handleSaveEdit(zone.id)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{zone.nombre}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => handleStartEdit(zone)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {zone.tipo}
                                </Badge>
                                <Badge
                                  variant={zone.estado === EstadoZona.ACTIVA ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {zone.estado}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {editingZoneId !== zone.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              // Hacer zoom/focus en la zona en el mapa
                              mapViewerRef.current?.focusOnZone(zone.id)
                            }}
                            title="Ver en mapa (zoom)"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleZone(zone.id)}
                            title={zone.estado === EstadoZona.ACTIVA ? "Desactivar" : "Activar"}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteZone(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[320px] !z-[9999] p-6">
          <DialogHeader className="space-y-4 pb-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Eliminar Zona
            </DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4"></div>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={cancelDeleteZone}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteZone}
              className="flex-1"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
