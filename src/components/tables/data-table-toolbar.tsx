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
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "name",
  filters,
  onSearchChange,
  onFilterChange,
}: DataTableToolbarProps<TData>) {

  const [input, setInput] = useState("");

  const handleSearchChange = (value: string) => {
    setInput(value);
  };

  const handleKey = () => {
    if (onSearchChange) {
      table.getColumn(searchKey)?.setFilterValue(input);
      onSearchChange(input);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Buscar por nombre`}
          value={input}
          onChange={(event) => handleSearchChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleKey()}
          className="h-8 w-[150px] lg:w-[250px]"
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
            />
          ) : null;
        })}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
