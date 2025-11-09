import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

interface ProductSpecificationsProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
  currentStock: number
  getStockColor: (stock: number) => string
}

export function ProductSpecifications({
  product,
  selectedColor,
  currentStock,
  getStockColor,
}: ProductSpecificationsProps) {
  return (
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
        {product.menu && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Menú:</span>
            <span className="font-medium">{product.menu}</span>
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
        {selectedColor?.ram && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Memoria RAM {selectedColor ? `(${selectedColor.label})` : ''}:
            </span>
            <span className="font-medium">
              {selectedColor.ram}
            </span>
          </div>
        )}
        {currentStock !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Stock total {selectedColor ? `(${selectedColor.label})` : ''}:
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
  )
}
