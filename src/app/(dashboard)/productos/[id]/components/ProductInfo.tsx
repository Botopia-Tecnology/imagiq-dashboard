"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

interface ProductInfoProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
  currentPrice?: string
  currentOriginalPrice?: string
  currentStock: number
  currentStockEcommerce: number
  currentStockTiendas: Record<string, number>
  onColorSelect: (color: ProductColor) => void
}

export function ProductInfo({
  product,
  selectedColor,
  currentPrice,
  currentOriginalPrice,
  currentStock,
  currentStockEcommerce,
  currentStockTiendas,
  onColorSelect,
}: ProductInfoProps) {
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Estados para rastrear qué filtros están activos (seleccionados por el usuario)
  // Al inicio, aunque selectedColor tenga valores, estos filtros están inactivos
  const [activeCapacityFilter, setActiveCapacityFilter] = useState<string | undefined>();
  const [activeRamFilter, setActiveRamFilter] = useState<string | undefined>();

  // Obtener el estado actual de selección de capacidad y RAM
  // Solo usar como filtro si fue seleccionado explícitamente
  const currentCapacity = activeCapacityFilter;
  const currentRam = activeRamFilter;

  // Obtener colores únicos filtrados por capacidad y RAM seleccionados
  const getUniqueColors = () => {
    const colorMap = new Map<string, { hex: string; label: string; hasStock: boolean }>();

    product.colors.forEach((variant) => {
      // Filtrado cruzado: solo mostrar colores que tengan la capacidad y RAM seleccionados
      const matchesCapacity = !currentCapacity || variant.capacity === currentCapacity;
      const matchesRam = !currentRam || variant.ram === currentRam;

      if (matchesCapacity && matchesRam) {
        if (!colorMap.has(variant.hex)) {
          colorMap.set(variant.hex, {
            hex: variant.hex,
            label: variant.label,
            hasStock: false
          });
        }

        // Si alguna variante de este color tiene stock, marcarlo como disponible
        if (variant.stockTotal && variant.stockTotal > 0) {
          const colorData = colorMap.get(variant.hex)!;
          colorData.hasStock = true;
        }
      }
    });

    return Array.from(colorMap.values());
  };

  // Obtener opciones de capacidad disponibles según el color y RAM seleccionados
  const getCapacityOptions = () => {
    const capacities = new Set<string>();

    product.colors.forEach((variant) => {
      if (!variant.capacity) return;

      // Filtrado cruzado: solo mostrar capacidades que tengan el color y RAM seleccionados
      const matchesColor = !selectedColor?.hex || variant.hex === selectedColor.hex;
      const matchesRam = !currentRam || variant.ram === currentRam;

      if (matchesColor && matchesRam) {
        capacities.add(variant.capacity);
      }
    });

    return Array.from(capacities).sort((a, b) => {
      // Ordenar capacidades numéricamente
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    });
  };

  // Obtener opciones de RAM disponibles según el color y capacidad seleccionados
  const getRamOptions = () => {
    const rams = new Set<string>();

    product.colors.forEach((variant) => {
      if (!variant.ram) return;

      // Filtrado cruzado: solo mostrar RAM que tengan el color y capacidad seleccionados
      const matchesColor = !selectedColor?.hex || variant.hex === selectedColor.hex;
      const matchesCapacity = !currentCapacity || variant.capacity === currentCapacity;

      if (matchesColor && matchesCapacity) {
        rams.add(variant.ram);
      }
    });

    return Array.from(rams).sort((a, b) => {
      // Ordenar RAM numéricamente
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    });
  };

  // Encontrar la variante exacta que coincida con los parámetros
  const findVariant = (hex: string, capacity?: string, ram?: string) => {
    return product.colors.find((variant) => {
      const matchesHex = variant.hex === hex;
      const matchesCapacity = !capacity || variant.capacity === capacity;
      const matchesRam = !ram || variant.ram === ram;

      return matchesHex && matchesCapacity && matchesRam;
    });
  };

  // Manejar cambio de color
  const handleColorChange = (hex: string) => {
    // Resetear los filtros activos para que todas las opciones del nuevo color estén disponibles
    setActiveCapacityFilter(undefined);
    setActiveRamFilter(undefined);

    // Buscar la primera variante de ese color (sin ningún filtro aplicado)
    const anyVariant = product.colors.find((v) => v.hex === hex);
    if (anyVariant) {
      onColorSelect(anyVariant);
    }
  };

  // Manejar cambio de capacidad
  const handleCapacityChange = (capacity: string) => {
    // Activar filtro de capacidad
    setActiveCapacityFilter(capacity);

    if (!selectedColor) return;

    // Buscar la primera variante con este color y capacidad (manteniendo RAM si es compatible)
    const variant = findVariant(selectedColor.hex, capacity, activeRamFilter);
    if (variant) {
      onColorSelect(variant);
    } else {
      // Si no hay coincidencia con el filtro de RAM, resetear RAM y buscar solo con capacidad
      setActiveRamFilter(undefined);
      const variantWithoutRam = findVariant(selectedColor.hex, capacity, undefined);
      if (variantWithoutRam) {
        onColorSelect(variantWithoutRam);
      }
    }
  };

  // Manejar cambio de RAM
  const handleRamChange = (ram: string) => {
    // Activar filtro de RAM
    setActiveRamFilter(ram);

    if (!selectedColor) return;

    // Buscar la primera variante con este color y RAM (manteniendo capacidad si es compatible)
    const variant = findVariant(selectedColor.hex, activeCapacityFilter, ram);
    if (variant) {
      onColorSelect(variant);
    } else {
      // Si no hay coincidencia con el filtro de capacidad, resetear capacidad y buscar solo con RAM
      setActiveCapacityFilter(undefined);
      const variantWithoutCapacity = findVariant(selectedColor.hex, undefined, ram);
      if (variantWithoutCapacity) {
        onColorSelect(variantWithoutCapacity);
      }
    }
  };

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

      {/* Selectores de variantes */}
      {product.colors.length > 0 && (
        <div className="space-y-4">
          {/* Selector de Color */}
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
              {getUniqueColors().map((colorGroup) => (
                <div key={colorGroup.hex} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleColorChange(colorGroup.hex)}
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

          {/* Selector de Capacidad (si aplica) */}
          {getCapacityOptions().length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Capacidad: {selectedColor?.capacity || 'Selecciona una capacidad'}
              </label>
              <div className="flex flex-wrap gap-2">
                {getCapacityOptions().map((capacity) => (
                  <button
                    key={capacity}
                    onClick={() => handleCapacityChange(capacity)}
                    className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
                      selectedColor?.capacity === capacity
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {capacity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de RAM (si aplica) */}
          {getRamOptions().length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                RAM: {selectedColor?.ram || 'Selecciona la RAM'}
              </label>
              <div className="flex flex-wrap gap-2">
                {getRamOptions().map((ram) => (
                  <button
                    key={ram}
                    onClick={() => handleRamChange(ram)}
                    className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
                      selectedColor?.ram === ram
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          {/* {currentStockEcommerce!== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Stock e commerce {selectedColor ? `(${selectedColor.label})` : ''}:
              </span>
              <span className={`font-medium ${getStockColor(currentStockEcommerce)}`}>
                {currentStockEcommerce} unidades
              </span>
            </div>
          )}
          {currentStockTiendas!== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Stock total en tiendas {selectedColor ? `(${selectedColor.label})` : ''}:
              </span>
              <span className={`font-medium ${getStockColor(Object.values(currentStockTiendas).reduce((sum, qty) => sum + qty, 0))}`}>
                {Object.values(currentStockTiendas).reduce((sum, qty) => sum + qty, 0)} unidades
              </span>
            </div>
          )} */}
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
    </div>
  )
}
