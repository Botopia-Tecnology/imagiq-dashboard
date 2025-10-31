"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/features/products/useProducts"
import { ProductColor } from "@/features/products/useProducts"
import { ProductMultimedia } from "./components/ProductMultimedia"
import { ProductInfo } from "./components/ProductInfo"
import { ProductDescription } from "./components/ProductDescription"
import { StoreStockDisplay } from "./components/StoreStockDisplay"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { product, loading, error } = useProduct(productId)
  console.log("ProductDetailPage render", { product})
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)

  // Establecer el primer color como seleccionado por defecto
  useEffect(() => {
    if (product && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0])
      console.log("Setting default selected color", { selectedColor})
    }
  }, [product, selectedColor])


  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        <p className="text-muted-foreground">{error || "No se pudo cargar el producto"}</p>
        <Button onClick={() => router.push("/productos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Button>
      </div>
    )
  }

  const currentPrice = selectedColor?.price || product.price
  const currentOriginalPrice = selectedColor?.originalPrice || product.originalPrice
  const currentDiscount = selectedColor?.discount || product.discount
  const currentStock = selectedColor?.stockTotal ?? product.stock ?? 0
  const currentStockEcommerce = selectedColor?.stock ?? 0
  const currentStockTiendas = selectedColor?.stockTiendas || {}
  const currentImage = selectedColor?.imageUrl || product.image

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <Button
        variant="ghost"
        onClick={() => router.push("/productos")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a productos
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Componente Multimedia */}
        <ProductMultimedia
          product={product}
          selectedColor={selectedColor}
          currentImage={currentImage}
          currentDiscount={currentDiscount}
          currentStock={currentStock}
        />

        {/* Componente de Información */}
        <div className="space-y-6">
          <ProductInfo
            product={product}
            selectedColor={selectedColor}
            currentPrice={currentPrice}
            currentStockEcommerce={currentStockEcommerce}
            currentOriginalPrice={currentOriginalPrice}
            currentStock={currentStock}
            currentStockTiendas={currentStockTiendas}
            onColorSelect={setSelectedColor}
          />

          {/* Componente de Descripción */}
          <ProductDescription
            product={product}
            selectedColor={selectedColor}
          />
        </div>
      </div>

      {/* Componente de Stock por Tienda */}
      <StoreStockDisplay stockTiendas={currentStockTiendas} />
    </div>
  )
}

// Skeleton de carga
function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>

          <Skeleton className="h-12 w-40" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
