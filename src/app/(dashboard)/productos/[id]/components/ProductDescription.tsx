"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

interface ProductDescriptionProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
}

export function ProductDescription({ product, selectedColor }: ProductDescriptionProps) {
  // Si no hay descripción detallada, no renderizar nada
  if (!selectedColor?.description && !product.detailedDescription) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Descripción detallada
          {selectedColor && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({selectedColor.label})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-line">
          {selectedColor?.description || product.detailedDescription}
        </p>
      </CardContent>
    </Card>
  )
}
