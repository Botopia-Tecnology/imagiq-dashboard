"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"

interface StoreStockDisplayProps {
  stockTiendas: Record<string, number>
}

export function StoreStockDisplay({ stockTiendas }: StoreStockDisplayProps) {
  // Función para determinar el color del badge según la cantidad
  const getStockBadgeVariant = (quantity: number): "default" | "secondary" | "destructive" => {
    if (quantity === 0) return "destructive"
    if (quantity >= 3) return "default"
    return "secondary"
  }

  // Función para obtener el color de fondo según la cantidad
  const getStockColor = (quantity: number): string => {
    if (quantity === 0) return "bg-red-50 border-red-200"
    if (quantity >= 3) return "bg-green-50 border-green-200"
    return "bg-yellow-50 border-yellow-200"
  }

  // Convertir el objeto a un array y ordenarlo por nombre de tienda
  const storeEntries = Object.entries(stockTiendas).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  // Calcular el total de stock en tiendas
  const totalStock = Object.values(stockTiendas).reduce((sum, qty) => sum + qty, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Stock por Tienda
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            Total: {totalStock} unidades
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {storeEntries.map(([storeCode, quantity]) => (
            <div
              key={storeCode}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:shadow-md ${getStockColor(quantity)}`}
            >
              <span className="text-xs font-semibold text-gray-700 mb-1">
                {storeCode}
              </span>
              <Badge
                variant={getStockBadgeVariant(quantity)}
                className="text-xs font-bold min-w-[40px] justify-center"
              >
                {quantity}
              </Badge>
            </div>
          ))}
        </div>

        {storeEntries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay información de stock por tienda</p>
          </div>
        )}

        {/* Leyenda de colores */}
        {storeEntries.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-700 mb-2">Leyenda:</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
                <span className="text-gray-600">Stock alto (3+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
                <span className="text-gray-600">Stock bajo (1-2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
                <span className="text-gray-600">Sin stock (0)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
