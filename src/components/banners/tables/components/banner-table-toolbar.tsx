import { Table } from "@tanstack/react-table";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { BackendBanner } from "@/types/banner";

interface BannerTableToolbarProps {
  readonly table: Table<BackendBanner>;
  readonly onBulkDelete: () => void;
}

/**
 * Toolbar de la tabla de banners
 * Incluye:
 * - Filtro de búsqueda por nombre
 * - Botón de eliminación masiva
 * - Selector de columnas visibles
 */
export function BannerTableToolbar({ table, onBulkDelete }: Readonly<BannerTableToolbarProps>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center py-4 gap-2">
      {/* Filtro de búsqueda */}
      <Input
        placeholder="Filtrar banners..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />

      {/* Botón de eliminación masiva (solo visible si hay selección) */}
      {selectedCount > 0 && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar ({selectedCount})
        </Button>
      )}

      {/* Selector de columnas */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columnas <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
