"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

interface ProductInfoProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
  currentPrice?: string
  currentOriginalPrice?: string
  currentStock: number
  onColorSelect: (color: ProductColor) => void
}

export function ProductInfo({
  product,
  selectedColor,
  currentPrice,
  currentOriginalPrice,
  currentStock,
  onColorSelect,
}: ProductInfoProps) {
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        {selectedColor?.description ? (
          <p className="mt-2 text-muted-foreground">{selectedColor.description}</p>
        ) : product.description ? (
          <p className="mt-2 text-muted-foreground">{product.description}</p>
        ) : null}
      </div>

      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{currentPrice}</span>
        {currentOriginalPrice && (
          <span className="text-xl text-muted-foreground line-through">
            {currentOriginalPrice}
          </span>
        )}
      </div>

      {/* Selector de colores */}
      {product.colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Color: {selectedColor?.label}
            </label>
            {selectedColor?.stock !== undefined && (
              <span className="text-sm text-muted-foreground">
                {selectedColor.stock > 0 ? (
                  <span className="text-green-600">
                    {selectedColor.stock} disponibles
                  </span>
                ) : (
                  <span className="text-red-600">Sin stock</span>
                )}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <div key={color.sku} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onColorSelect(color)}
                  disabled={!color.stock || color.stock === 0}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    selectedColor?.sku === color.sku
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  } ${
                    !color.stock || color.stock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.label} - ${color.stock || 0} disponibles`}
                />
                {(!color.stock || color.stock === 0) && (
                  <span className="text-xs text-red-500">Agotado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {product.brand && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marca:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
          )}
          {product.model && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">{product.model}</span>
            </div>
          )}
          {product.category && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categoría:</span>
              <span className="font-medium">{product.category}</span>
            </div>
          )}
          {product.subcategory && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subcategoría:</span>
              <span className="font-medium">{product.subcategory}</span>
            </div>
          )}
          {(selectedColor?.capacity || product.capacity) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Capacidad {selectedColor ? `(${selectedColor.label})` : ''}:
              </span>
              <span className="font-medium">
                {selectedColor?.capacity || product.capacity}
              </span>
            </div>
          )}
          {currentStock !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Stock disponible {selectedColor ? `(${selectedColor.label})` : ''}:
              </span>
              <span className={`font-medium ${getStockColor(currentStock)}`}>
                {currentStock} unidades
              </span>
            </div>
          )}
          {!selectedColor && product.stock !== undefined && product.stock !== currentStock && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stock total:</span>
              <span className="font-medium">{product.stock} unidades</span>
            </div>
          )}
          {selectedColor?.sku && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU del color:</span>
              <span className="font-medium">{selectedColor.sku}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
