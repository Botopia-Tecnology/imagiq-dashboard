import { ProductColor } from "@/features/products/useProducts"

interface ColorSelectorProps {
  colors: Array<{ hex: string; label: string; hasStock: boolean }>
  selectedColor: ProductColor | null
  onColorChange: (hex: string) => void
  getStockColor: (stock: number) => string
}

export function ColorSelector({
  colors,
  selectedColor,
  onColorChange,
  getStockColor,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Color: {selectedColor?.label || 'Selecciona un color'}
        </label>
        {selectedColor?.stockTotal !== undefined && (
          <span className="text-sm text-muted-foreground">
            {selectedColor.stockTotal > 0 ? (
              <span className={getStockColor(selectedColor.stockTotal)}>
                {selectedColor.stockTotal} disponibles
              </span>
            ) : (
              <span className="text-red-600">Sin stock</span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((colorGroup) => (
          <div key={colorGroup.hex} className="flex flex-col items-center gap-1">
            <button
              onClick={() => onColorChange(colorGroup.hex)}
              className={`h-10 w-10 rounded-full border-2 transition-all cursor-pointer hover:scale-105 ${
                selectedColor?.hex === colorGroup.hex
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              }`}
              style={{
                backgroundColor: colorGroup.hex
              }}
              title={`${colorGroup.label} - ${colorGroup.hasStock ? 'Disponible' : 'Sin stock'}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
