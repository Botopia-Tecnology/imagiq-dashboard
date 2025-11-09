import { ProductColor } from "@/features/products/useProducts"

interface CapacitySelectorProps {
  capacities: string[]
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
            key={capacity}
            onClick={() => onCapacityChange(capacity)}
            className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
              selectedCapacity === capacity
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {capacity}
          </button>
        ))}
      </div>
    </div>
  )
}
