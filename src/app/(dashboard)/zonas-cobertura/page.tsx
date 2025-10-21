"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CitySelector } from "@/components/coverage-zones/city-selector"
import { cities, coverageZones as initialZones } from "@/lib/mock-data/coverage-zones"
import type { CoverageZone } from "@/types/coverage-zones"
import { MapPin, Pencil, Trash2, Check, X, Palette } from "lucide-react"

// Dynamic import to avoid SSR issues with Leaflet
const MapViewer = dynamic(
  () => import("@/components/coverage-zones/map-viewer").then((mod) => mod.MapViewer),
  { ssr: false }
)

export default function ZonasCoberturaPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>(cities[0].id)
  const [zones, setZones] = useState<CoverageZone[]>(initialZones)
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId),
    [selectedCityId]
  )

  const cityZones = useMemo(
    () => zones.filter((zone) => zone.cityId === selectedCityId),
    [zones, selectedCityId]
  )

  const handleZoneCreated = (newZone: Partial<CoverageZone>) => {
    const zone: CoverageZone = {
      id: `zone-${Date.now()}`,
      cityId: selectedCityId,
      name: `Zona ${cityZones.length + 1}`,
      type: newZone.type || "polygon",
      coordinates: newZone.coordinates || [],
      radius: newZone.radius,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    setZones((prev) => [...prev, zone])
  }

  const handleToggleZone = (zoneId: string) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
      )
    )
  }

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== zoneId))
  }

  const handleStartEdit = (zone: CoverageZone) => {
    setEditingZoneId(zone.id)
    setEditingName(zone.name)
  }

  const handleSaveEdit = (zoneId: string) => {
    if (editingName.trim()) {
      setZones((prev) =>
        prev.map((zone) =>
          zone.id === zoneId ? { ...zone, name: editingName.trim(), updatedAt: new Date() } : zone
        )
      )
    }
    setEditingZoneId(null)
    setEditingName("")
  }

  const handleCancelEdit = () => {
    setEditingZoneId(null)
    setEditingName("")
  }

  const handleColorChange = (zoneId: string, color: string) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId ? { ...zone, color, updatedAt: new Date() } : zone
      )
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zonas de Cobertura</h1>
          <p className="text-muted-foreground">
            Configura las zonas de entrega para cada ciudad
          </p>
        </div>
        <CitySelector
          cities={cities}
          selectedCityId={selectedCityId}
          onCityChange={setSelectedCityId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de {selectedCity?.name}
            </CardTitle>
            <CardDescription>
              Dibuja polígonos, círculos o rectángulos para definir las zonas de cobertura
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0 min-h-0">
            {selectedCity && (
              <MapViewer
                center={selectedCity.coordinates}
                zoom={selectedCity.zoom}
                zones={cityZones}
                onZoneCreated={handleZoneCreated}
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle>Zonas Activas</CardTitle>
            <CardDescription>
              {cityZones.length} {cityZones.length === 1 ? "zona" : "zonas"} configuradas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0 overflow-auto">
            {cityZones.length === 0 ? (
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
              <div className="space-y-2">
                {cityZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative group flex-shrink-0">
                        <div
                          className="w-4 h-4 rounded-sm cursor-pointer"
                          style={{ backgroundColor: zone.color }}
                        />
                        <input
                          type="color"
                          value={zone.color || "#3b82f6"}
                          onChange={(e) => handleColorChange(zone.id, e.target.value)}
                          className="absolute inset-0 w-4 h-4 opacity-0 cursor-pointer"
                          title="Cambiar color"
                        />
                      </div>
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
                              <p className="font-medium text-sm truncate">{zone.name}</p>
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
                                {zone.type}
                              </Badge>
                              <Badge
                                variant={zone.isActive ? "default" : "outline"}
                                className="text-xs"
                              >
                                {zone.isActive ? "Activa" : "Inactiva"}
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
                          onClick={() => handleToggleZone(zone.id)}
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
  )
}
