import { useState, useEffect, useCallback } from "react"
import { coverageZonesAPI, ZonaCobertura, CreateZonaCoberturaDto, UpdateZonaCoberturaDto, APIError } from "@/lib/api/coverage-zones"
import { toast } from "sonner"

// ============================================
// Hook Configuration
// ============================================

interface UseCoverageZonesOptions {
  ciudad: string
  autoFetch?: boolean
  onSuccess?: (zones: ZonaCobertura[]) => void
  onError?: (error: APIError) => void
}

interface UseCoverageZonesReturn {
  // State
  zones: ZonaCobertura[]
  isLoading: boolean
  error: APIError | null

  // Actions
  fetchZones: () => Promise<void>
  createZone: (zone: CreateZonaCoberturaDto) => Promise<ZonaCobertura | null>
  updateZone: (id: string, updates: UpdateZonaCoberturaDto) => Promise<ZonaCobertura | null>
  deleteZone: (id: string) => Promise<boolean>
  refreshZones: () => Promise<void>
  checkCoverage: (lat: number, lon: number, ciudad?: string) => Promise<ResultadoCobertura | null>

  // Local state management (optimistic updates)
  addZoneLocally: (zone: ZonaCobertura) => void
  updateZoneLocally: (id: string, updates: Partial<ZonaCobertura>) => void
  deleteZoneLocally: (id: string) => void
}

// ============================================
// Main Hook
// ============================================

export function useCoverageZones({
  ciudad,
  autoFetch = true,
  onSuccess,
  onError,
}: UseCoverageZonesOptions): UseCoverageZonesReturn {
  const [zones, setZones] = useState<ZonaCobertura[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<APIError | null>(null)

  // ============================================
  // Fetch Zones
  // ============================================

  const fetchZones = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await coverageZonesAPI.getZonas(ciudad)
      setZones(data)
      onSuccess?.(data)
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
      setError(apiError)
      onError?.(apiError)

      // Solo mostrar toast si es un error real, no si el backend no está disponible
      if (apiError.status !== 0) {
        toast.error(`Error al cargar zonas: ${apiError.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [ciudad, onSuccess, onError])

  // Auto-fetch on mount and when ciudad changes
  useEffect(() => {
    if (autoFetch && ciudad) {
      fetchZones()
    }
  }, [autoFetch, ciudad, fetchZones])

  // ============================================
  // Create Zone
  // ============================================

  const createZone = useCallback(
    async (zoneData: CreateZonaCoberturaDto): Promise<ZonaCobertura | null> => {
      try {
        const createdZone = await coverageZonesAPI.createZona(zoneData)
        setZones((prev) => [...prev, createdZone])
        toast.success(`Zona "${createdZone.nombre}" creada exitosamente`)
        return createdZone
      } catch (err) {
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al crear zona: ${apiError.message}`)
        return null
      }
    },
    []
  )

  // ============================================
  // Update Zone
  // ============================================

  const updateZone = useCallback(
    async (id: string, updates: UpdateZonaCoberturaDto): Promise<ZonaCobertura | null> => {
      // Optimistic update
      const previousZones = zones
      setZones((prev) =>
        prev.map((zone) =>
          zone.id === id
            ? {
                ...zone,
                ...updates,
                actualizado_en: new Date().toISOString(),
              }
            : zone
        )
      )

      try {
        const updatedZone = await coverageZonesAPI.updateZona(id, updates)
        setZones((prev) => prev.map((zone) => (zone.id === id ? updatedZone : zone)))
        toast.success("Zona actualizada exitosamente")
        return updatedZone
      } catch (err) {
        // Rollback on error
        setZones(previousZones)
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al actualizar zona: ${apiError.message}`)
        return null
      }
    },
    [zones]
  )

  // ============================================
  // Delete Zone
  // ============================================

  const deleteZone = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic delete
      const deletedZone = zones.find((z) => z.id === id)
      const previousZones = zones
      setZones((prev) => prev.filter((zone) => zone.id !== id))

      try {
        await coverageZonesAPI.deleteZona(id)
        toast.success(`Zona "${deletedZone?.nombre}" eliminada exitosamente`)
        return true
      } catch (err) {
        // Rollback on error
        setZones(previousZones)
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al eliminar zona: ${apiError.message}`)
        return false
      }
    },
    [zones]
  )

  // ============================================
  // Local State Management (for offline mode)
  // ============================================

  const addZoneLocally = useCallback((zone: ZonaCobertura) => {
    setZones((prev) => [...prev, zone])
  }, [])

  const updateZoneLocally = useCallback((id: string, updates: Partial<ZonaCobertura>) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              ...updates,
              actualizado_en: new Date().toISOString(),
            }
          : zone
      )
    )
  }, [])

  const deleteZoneLocally = useCallback((id: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id))
  }, [])

  const refreshZones = useCallback(async () => {
    await fetchZones()
  }, [fetchZones])

  // ============================================
  // Check Coverage
  // ============================================

  const checkCoverage = useCallback(
    async (lat: number, lon: number, ciudadParam?: string): Promise<ResultadoCobertura | null> => {
      try {
        const result = await coverageZonesAPI.verificarCobertura({
          lat,
          lon,
          ciudad: ciudadParam || ciudad,
        })
        return result
      } catch (err) {
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al verificar cobertura: ${apiError.message}`)
        return null
      }
    },
    [ciudad]
  )

  // ============================================
  // Return
  // ============================================

  return {
    // State
    zones,
    isLoading,
    error,

    // Actions
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    refreshZones,
    checkCoverage,

    // Local state
    addZoneLocally,
    updateZoneLocally,
    deleteZoneLocally,
  }
}
