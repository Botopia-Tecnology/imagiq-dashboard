"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  filters?: Array<{
    id: string
    title: string
    options: Array<{
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }>
  }>
  // Paginación del servidor
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  totalItems?: number
  // Filtros del servidor
  onSearchChange?: (search: string) => void
  onFilterChange?: (filterId: string, value: string[]) => void
  // Estado de carga
  loading?: boolean
  // Visibilidad inicial de columnas
  initialColumnVisibility?: VisibilityState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  filters,
  pageCount,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  onPaginationChange,
  totalItems,
  onSearchChange,
  onFilterChange,
  loading = false,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility ?? {})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  // Usar paginación controlada si se proporciona
  const [pagination, setPagination] = useState({
    pageIndex: controlledPageIndex ?? 0,
    pageSize: controlledPageSize ?? 10,
  })

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      onPaginationChange?.(newPagination)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pageCount ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!pageCount,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        filters={filters}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />
      {loading ? (
        <div className="flex items-center justify-center py-8 rounded-md border">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} totalItems={totalItems} />
        </>
      )}
    </div>
  )
}