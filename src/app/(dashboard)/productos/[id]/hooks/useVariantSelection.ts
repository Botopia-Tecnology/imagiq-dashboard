import { useState } from "react"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"

export function useVariantSelection(
  product: ProductCardProps,
  selectedColor: ProductColor | null,
  onColorSelect: (color: ProductColor) => void
) {
  // Estados para rastrear qué filtros están activos
  const [activeCapacityFilter, setActiveCapacityFilter] = useState<string | undefined>()
  const [activeRamFilter, setActiveRamFilter] = useState<string | undefined>()

  // Obtener colores únicos filtrados por capacidad y RAM seleccionados
  const getUniqueColors = () => {
    const colorMap = new Map<string, { hex: string; label: string; hasStock: boolean }>()

    product.colors.forEach((variant) => {
      const matchesCapacity = !activeCapacityFilter || variant.capacity === activeCapacityFilter
      const matchesRam = !activeRamFilter || variant.ram === activeRamFilter

      if (matchesCapacity && matchesRam) {
        if (!colorMap.has(variant.hex)) {
          colorMap.set(variant.hex, {
            hex: variant.hex,
            label: variant.label,
            hasStock: false
          })
        }

        if (variant.stockTotal && variant.stockTotal > 0) {
          const colorData = colorMap.get(variant.hex)!
          colorData.hasStock = true
        }
      }
    })

    return Array.from(colorMap.values())
  }

  // Obtener opciones de capacidad disponibles según el color y RAM seleccionados
  const getCapacityOptions = () => {
    const capacities = new Set<string>()

    product.colors.forEach((variant) => {
      if (!variant.capacity) return

      const matchesColor = !selectedColor?.hex || variant.hex === selectedColor.hex
      const matchesRam = !activeRamFilter || variant.ram === activeRamFilter

      if (matchesColor && matchesRam) {
        capacities.add(variant.capacity)
      }
    })

    return Array.from(capacities).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      return aNum - bNum
    })
  }

  // Obtener opciones de RAM disponibles según el color y capacidad seleccionados
  const getRamOptions = () => {
    const rams = new Set<string>()

    product.colors.forEach((variant) => {
      if (!variant.ram) return

      const matchesColor = !selectedColor?.hex || variant.hex === selectedColor.hex
      const matchesCapacity = !activeCapacityFilter || variant.capacity === activeCapacityFilter

      if (matchesColor && matchesCapacity) {
        rams.add(variant.ram)
      }
    })

    return Array.from(rams).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      return aNum - bNum
    })
  }

  // Encontrar la variante exacta que coincida con los parámetros
  const findVariant = (hex: string, capacity?: string, ram?: string) => {
    return product.colors.find((variant) => {
      const matchesHex = variant.hex === hex
      const matchesCapacity = !capacity || variant.capacity === capacity
      const matchesRam = !ram || variant.ram === ram

      return matchesHex && matchesCapacity && matchesRam
    })
  }

  // Manejar cambio de color
  const handleColorChange = (hex: string) => {
    setActiveCapacityFilter(undefined)
    setActiveRamFilter(undefined)

    const anyVariant = product.colors.find((v) => v.hex === hex)
    if (anyVariant) {
      onColorSelect(anyVariant)
    }
  }

  // Manejar cambio de capacidad
  const handleCapacityChange = (capacity: string) => {
    setActiveCapacityFilter(capacity)

    if (!selectedColor) return

    const variant = findVariant(selectedColor.hex, capacity, activeRamFilter)
    if (variant) {
      onColorSelect(variant)
    } else {
      setActiveRamFilter(undefined)
      const variantWithoutRam = findVariant(selectedColor.hex, capacity, undefined)
      if (variantWithoutRam) {
        onColorSelect(variantWithoutRam)
      }
    }
  }

  // Manejar cambio de RAM
  const handleRamChange = (ram: string) => {
    setActiveRamFilter(ram)

    if (!selectedColor) return

    const variant = findVariant(selectedColor.hex, activeCapacityFilter, ram)
    if (variant) {
      onColorSelect(variant)
    } else {
      setActiveCapacityFilter(undefined)
      const variantWithoutCapacity = findVariant(selectedColor.hex, undefined, ram)
      if (variantWithoutCapacity) {
        onColorSelect(variantWithoutCapacity)
      }
    }
  }

  return {
    getUniqueColors,
    getCapacityOptions,
    getRamOptions,
    handleColorChange,
    handleCapacityChange,
    handleRamChange,
  }
}
