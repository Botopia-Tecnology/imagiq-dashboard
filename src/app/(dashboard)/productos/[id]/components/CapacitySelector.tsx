import { ProductColor } from "@/features/products/useProducts"

interface CapacitySelectorProps {
  capacities: Array<{ value: string; missingImages: boolean }>
  selectedCapacity?: string
  onCapacityChange: (capacity: string) => void
}

export function CapacitySelector({
  capacities,
  selectedCapacity,
  onCapacityChange,
}: CapacitySelectorProps) {
  if (capacities.length === 0) return null

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Capacidad: {selectedCapacity || 'Selecciona una capacidad'}
      </label>
      <div className="flex flex-wrap gap-2">
        {capacities.map((capacity) => (
          <button
            key={capacity.value}
            onClick={() => onCapacityChange(capacity.value)}
            className={`relative px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
              selectedCapacity === capacity.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {capacity.value}
            {capacity.missingImages && (
              <span
                className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-background"
                title="Sin imágenes"
                aria-label="Sin imágenes"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
