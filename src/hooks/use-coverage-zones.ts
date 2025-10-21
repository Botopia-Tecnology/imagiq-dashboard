import { useState, useEffect, useCallback } from "react"
import type { CoverageZone } from "@/types/coverage-zones"
import { coverageZonesAPI, APIError } from "@/lib/api/coverage-zones"
import { toast } from "sonner"

// ============================================
// Hook Configuration
// ============================================

interface UseCoverageZonesOptions {
  cityId: string
  autoFetch?: boolean
  onSuccess?: (zones: CoverageZone[]) => void
  onError?: (error: APIError) => void
}

interface UseCoverageZonesReturn {
  // State
  zones: CoverageZone[]
  isLoading: boolean
  error: APIError | null

  // Actions
  fetchZones: () => Promise<void>
  createZone: (zone: CoverageZone) => Promise<CoverageZone | null>
  updateZone: (id: string, updates: Partial<CoverageZone>) => Promise<CoverageZone | null>
  deleteZone: (id: string) => Promise<boolean>
  refreshZones: () => Promise<void>

  // Local state management (optimistic updates)
  addZoneLocally: (zone: CoverageZone) => void
  updateZoneLocally: (id: string, updates: Partial<CoverageZone>) => void
  deleteZoneLocally: (id: string) => void
}

// ============================================
// Main Hook
// ============================================

export function useCoverageZones({
  cityId,
  autoFetch = true,
  onSuccess,
  onError,
}: UseCoverageZonesOptions): UseCoverageZonesReturn {
  const [zones, setZones] = useState<CoverageZone[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<APIError | null>(null)

  // ============================================
  // Fetch Zones
  // ============================================

  const fetchZones = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await coverageZonesAPI.getZonesByCity(cityId)
      setZones(data)
      onSuccess?.(data)
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
      setError(apiError)
      onError?.(apiError)
      toast.error(`Error al cargar zonas: ${apiError.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [cityId, onSuccess, onError])

  // Auto-fetch on mount and when cityId changes
  useEffect(() => {
    if (autoFetch) {
      fetchZones()
    }
  }, [autoFetch, fetchZones])

  // ============================================
  // Create Zone
  // ============================================

  const createZone = useCallback(
    async (zone: CoverageZone): Promise<CoverageZone | null> => {
      try {
        const createdZone = await coverageZonesAPI.createZone(zone)
        setZones((prev) => [...prev, createdZone])
        toast.success(`Zona "${createdZone.name}" creada exitosamente`)
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
    async (id: string, updates: Partial<CoverageZone>): Promise<CoverageZone | null> => {
      // Optimistic update
      setZones((prev) =>
        prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone))
      )

      try {
        const updatedZone = await coverageZonesAPI.updateZone(id, updates)
        setZones((prev) => prev.map((zone) => (zone.id === id ? updatedZone : zone)))
        toast.success("Zona actualizada exitosamente")
        return updatedZone
      } catch (err) {
        // Rollback on error
        await fetchZones()
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al actualizar zona: ${apiError.message}`)
        return null
      }
    },
    [fetchZones]
  )

  // ============================================
  // Delete Zone
  // ============================================

  const deleteZone = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic delete
      const deletedZone = zones.find((z) => z.id === id)
      setZones((prev) => prev.filter((zone) => zone.id !== id))

      try {
        await coverageZonesAPI.deleteZone(id)
        toast.success(`Zona "${deletedZone?.name}" eliminada exitosamente`)
        return true
      } catch (err) {
        // Rollback on error
        if (deletedZone) {
          setZones((prev) => [...prev, deletedZone])
        }
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

  const addZoneLocally = useCallback((zone: CoverageZone) => {
    setZones((prev) => [...prev, zone])
  }, [])

  const updateZoneLocally = useCallback((id: string, updates: Partial<CoverageZone>) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone))
    )
  }, [])

  const deleteZoneLocally = useCallback((id: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id))
  }, [])

  const refreshZones = useCallback(async () => {
    await fetchZones()
  }, [fetchZones])

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

    // Local state
    addZoneLocally,
    updateZoneLocally,
    deleteZoneLocally,
  }
}

// ============================================
// Coverage Check Hook
// ============================================

interface UseCoverageCheckOptions {
  cityId: string
}

export function useCoverageCheck({ cityId }: UseCoverageCheckOptions) {
  const [isChecking, setIsChecking] = useState(false)

  const checkCoverage = useCallback(
    async (lat: number, lng: number) => {
      setIsChecking(true)
      try {
        const result = await coverageZonesAPI.checkCoverage(lat, lng, cityId)
        return result
      } catch (err) {
        const apiError = err instanceof APIError ? err : new APIError("Unknown error", 0, err)
        toast.error(`Error al verificar cobertura: ${apiError.message}`)
        return null
      } finally {
        setIsChecking(false)
      }
    },
    [cityId]
  )

  return {
    checkCoverage,
    isChecking,
  }
}
