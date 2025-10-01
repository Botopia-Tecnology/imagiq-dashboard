"use client"

import { useMemo, useCallback, useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import { productColumns } from "@/components/tables/columns/products-columns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, DollarSign, AlertTriangle } from "lucide-react"
import { useProducts } from "@/features/products/useProducts"

const categories = [
  { label: "Smartphones", value: "Celulares" },
  { label: "Tablets", value: "Tablets" },
  { label: "Relojes", value: "Wearables" },
  { label: "Aire acondicionado", value: "Aire Acondicionado" },
  { label: "Aspiradoras", value: "Aspiradoras" },
  { label: "Hornos-Microondas", value: "Hornos Microondas" },
  { label: "Lavadora", value: "Lavadora" },
  { label: "Secadora", value: "Secadora" },
  { label: "Lavavajillas", value: "Lavavajillas" },
   { label: "Accesorios", value: "Accesorios" },
  { label: "Refrigeradores-Neveras", value: "Neveras" },//Nevecon
   { label: "Refrigeradores-Nevecon", value: "Nevecon" },//Nevecon

]

const statuses = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Borrador", value: "draft" },
]

export default function ProductosPage() {
  const [pageSize, setPageSize] = useState(10)
  const [currentFilters, setCurrentFilters] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const initialFilters = useMemo(() => ({ limit: 10 }), [])

  const {
    products,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    goToPage,
    filterProducts
  } = useProducts(initialFilters)
  console.log("Productos cargados:", products)

  // Calcular métricas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.stock && p.stock > 0).length
  const lowStockProducts = products.filter(p => p.stock && p.stock <= 10).length
  const totalValue = products.reduce((sum, p) => {
    const price = parseFloat(p.price?.replace(/[^0-9.-]+/g, "") || "0")
    const stock = p.stock || 0
    return sum + (price * stock)
  }, 0)

  const handlePaginationChange = useCallback((pagination: { pageIndex: number; pageSize: number }) => {
    const newPage = pagination.pageIndex + 1
    setPageSize(pagination.pageSize)

    const filters: Record<string, any> = {
      limit: pagination.pageSize,
      page: newPage,
    }

    // Aplicar filtros de categoría/subcategoría (separados por comas)
    if (currentFilters.subcategory && currentFilters.subcategory.length > 0) {
      filters.subcategory = currentFilters.subcategory.join(", ")
    }

    // Aplicar búsqueda
    if (searchQuery) {
      filters.name = searchQuery
    }

    filterProducts(filters)
  }, [filterProducts, currentFilters, searchQuery])

  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search)
    filterProducts({
      name: search,
      limit: pageSize,
      page: 1,
      ...currentFilters.subcategory && currentFilters.subcategory.length > 0
        ? { subcategory: currentFilters.subcategory.join(", ") }
        : {}
    })
  }, [filterProducts, pageSize, currentFilters])

  const handleFilterChange = useCallback((filterId: string, value: string[]) => {
    const newFilters = { ...currentFilters, [filterId]: value }
    setCurrentFilters(newFilters)

    const filters: Record<string, any> = {
      limit: pageSize,
      page: 1,
    }

    // Enviar múltiples valores separados por comas
    if (value.length > 0) {
      filters[filterId] = value.join(", ")
    }

    if (searchQuery) {
      filters.name = searchQuery
    }

    filterProducts(filters)
  }, [filterProducts, pageSize, searchQuery, currentFilters])

  const tableFilters = useMemo(() => [
    {
      id: "subcategory",
      title: "Categoría",
      options: categories,
    },
    {
      id: "status",
      title: "Estado",
      options: statuses,
    },
  ], [])

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      )
    }

    return (
      <DataTable
        columns={productColumns}
        data={products}
        searchKey="name"
        filters={tableFilters}
        pageCount={totalPages}
        pageIndex={currentPage - 1}
        pageSize={pageSize}
        totalItems={totalItems}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Métricas de productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos con stock ≤ 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categorías disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTableContent()}
        </CardContent>
      </Card>
    </div>
  )
}