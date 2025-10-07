"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"
import { EditImagesModal } from "./EditImagesModal"

interface ProductMultimediaProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
  currentImage: string | any
  currentDiscount: string | undefined
  currentStock: number
}

export function ProductMultimedia({
  product,
  selectedColor,
  currentImage,
  currentDiscount,
  currentStock,
}: ProductMultimediaProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Reiniciar el índice de imagen cuando cambie el color
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        {/* Botón de editar */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar imágenes
          </Button>
        </div>
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

        {/* Modal de edición */}
        <EditImagesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          selectedColor={selectedColor}
        />
      </CardContent>
    </Card>
  )
}
