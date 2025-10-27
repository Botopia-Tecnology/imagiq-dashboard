"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, DollarSign, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { productEndpoints, ProductSummary, categoryEndpoints } from "@/lib/api"

const ProductsTableWrapper = lazy(() =>
  import("@/components/tables/products-table-wrapper").then(mod => ({
    default: mod.ProductsTableWrapper
  }))
)

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[180px]" />
        <Skeleton className="h-8 w-[200px]" />
      </div>
    </div>
  )
}

export default function ProductosPage() {
  const [summary, setSummary] = useState<ProductSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [menusCount, setMenusCount] = useState(0)

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true)
      const response = await productEndpoints.getSummary()
      if (response.success) {
        setSummary(response.data)
      }
      setIsLoading(false)
    }

    const fetchMenusCount = async () => {
      try {
        const response = await categoryEndpoints.getVisibleCompletas()
        const totalMenus = response.data.reduce((total, category) => {
          return total + category.menus.filter(menu => menu.nombre).length
        }, 0)
        setMenusCount(totalMenus)
      } catch (error) {
        console.error("Error fetching menus count:", error)
      }
    }

    fetchSummary()
    fetchMenusCount()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
      </div>

      {/* Métricas de productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.productsTotal ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.productsTotal ?? 0} únicos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${(summary?.totalValue ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor del inventario
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-36" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.lowStock ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Productos con stock ≤ 10
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menús</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{menusCount}</div>
                <p className="text-xs text-muted-foreground">
                  Menús disponibles
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <ProductsTableWrapper />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}