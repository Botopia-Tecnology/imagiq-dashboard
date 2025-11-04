"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  filters?: Array<{
    id: string;
    title: string;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
    singleSelect?: boolean;
  }>;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (filterId: string, value: string[]) => void;
  initialFilterValues?: Record<string, string[]>;
  initialSearchValue?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "name",
  filters,
  onSearchChange,
  onFilterChange,
  initialFilterValues,
  initialSearchValue,
}: DataTableToolbarProps<TData>) {

  const [input, setInput] = useState(initialSearchValue || "");

  const handleSearchChange = (value: string) => {
    setInput(value);
  };

  const handleKey = () => {
    if (onSearchChange) {
      // Filtrado del servidor
      onSearchChange(input);
    } else {
      // Filtrado local
      table.getColumn(searchKey)?.setFilterValue(input);
    }
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex flex-1 items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
        <Input
          placeholder={`Buscar por nombre`}
          value={input}
          onChange={(event) => handleSearchChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleKey()}
          className="h-8 w-full min-w-[120px] sm:w-[150px] lg:w-[250px]"
        />
        {filters?.map((filter) => {
          const column = table.getColumn(filter.id);
          return column ? (
            <DataTableFacetedFilter
              key={filter.id}
              column={column}
              title={filter.title}
              options={filter.options}
              singleSelect={filter.singleSelect}
              onValueChange={
                onFilterChange
                  ? (value) => onFilterChange(filter.id, value)
                  : undefined
              }
              initialValues={initialFilterValues?.[filter.id]}
            />
          ) : null;
        })}
      </div>
      <div className="flex-shrink-0">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
