"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/features/products/useProducts"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { product, loading, error } = useProduct(productId)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Establecer el primer color como seleccionado por defecto
  useEffect(() => {
    if (product && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0])
    }
  }, [product, selectedColor])

  // Reiniciar el índice de imagen cuando cambie el color
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

  console.log(product)

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
  const currentStock = selectedColor?.stock ?? product.stock ?? 0
  const currentImage = selectedColor?.imageUrl || product.image

  // Determinar el color del stock
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

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
        {/* Imagen del producto */}
        <Card className="h-fit">
          <CardContent className="p-6">
            {/* Imagen de Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Imagen preview</h3>
              <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted group">
                {typeof currentImage === 'string' ? (
                  <Image
                    key={selectedColor?.sku || 'default'}
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor?.label || ''}`}
                    fill
                    
                    priority
                    className="object-contain"
                  />
                ) : (
                  <Image
                    key={selectedColor?.sku || 'default'}
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor?.label || ''}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Imágenes detalladas - Carrusel */}
            {selectedColor?.imageDetailsUrls && selectedColor.imageDetailsUrls.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Imágenes de detalle</h3>
                <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted group">
                  <Image
                    src={selectedColor.imageDetailsUrls[currentImageIndex]}
                    alt={`${product.name} - ${selectedColor.label} - Detalle ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />

                  {/* Botones de navegación */}
                  {selectedColor.imageDetailsUrls.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) =>
                          prev === 0 ? selectedColor.imageDetailsUrls!.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) =>
                          prev === selectedColor.imageDetailsUrls!.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Indicadores de página */}
                  {selectedColor.imageDetailsUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selectedColor.imageDetailsUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 pl-2">
                  {selectedColor.imageDetailsUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} - Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="mt-4 flex gap-2">
              {product.isNew && (
                <Badge variant="default">Nuevo</Badge>
              )}
              {currentDiscount && (
                <Badge variant="destructive">{currentDiscount}</Badge>
              )}
              {currentStock > 0 ? (
                <Badge variant="default">En stock ({currentStock})</Badge>
              ) : (
                <Badge variant="secondary">Agotado</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información del producto */}
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
                      onClick={() => setSelectedColor(color)}
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

          {/* Descripción detallada */}
          {(selectedColor?.description || product.detailedDescription) && (
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
          )}
        </div>
      </div>
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
