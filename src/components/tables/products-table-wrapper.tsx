"use client"

import { useMemo, useCallback, useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import { productColumns } from "@/components/tables/columns/products-columns"
import { useProducts } from "@/features/products/useProducts"

const categories = [
  { label: "Smartphones", value: "Celulares" },
  { label: "Tablets", value: "Tablets" },
  { label: "Relojes", value: "Wearables" },
  { label: "Aire acondicionado", value: "Aire Acondicionado" },
  { label: "Aspiradoras", value: "Aspiradoras" },
  { label: "Hornos", value: "Hornos" },
  { label: "Microondas", value: "Microondas" },
  { label: "Lavadora", value: "Lavadora" },
  { label: "Secadora", value: "Secadora" },
  { label: "Lavavajillas", value: "Lavavajillas" },
  { label: "Accesorios", value: "Accesorios" },
  { label: "Refrigeradores-Neveras", value: "Neveras" },
  { label: "Refrigeradores-Nevecon", value: "Nevecon" },
]

const statuses = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Borrador", value: "draft" },
]

export function ProductsTableWrapper() {
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
    filterProducts
  } = useProducts(initialFilters)

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
    console.log(newFilters)
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
    // {
    //   id: "status",
    //   title: "Estado",
    //   options: statuses,
    // },
  ], [])

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
      loading={loading}
    />
  )
}
