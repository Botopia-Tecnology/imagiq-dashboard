"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
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
  onSearchChange?: (search: string) => void
  onFilterChange?: (filterId: string, value: string[]) => void
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "name",
  filters,
  onSearchChange,
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value)
    } else {
      table.getColumn(searchKey)?.setFilterValue(value)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Buscar por ${searchKey}...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filters?.map((filter) => {
          const column = table.getColumn(filter.id)
          return column ? (
            <DataTableFacetedFilter
              key={filter.id}
              column={column}
              title={filter.title}
              options={filter.options}
              onValueChange={onFilterChange ? (value) => onFilterChange(filter.id, value) : undefined}
            />
          ) : null
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}