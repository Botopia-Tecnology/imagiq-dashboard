import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BackendBanner } from "@/types/banner";

interface BannerTablePaginationProps {
  table: Table<BackendBanner>;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isLoading?: boolean;
}

/**
 * Componente de paginación para la tabla de banners
 * Incluye:
 * - Selector de items por página
 * - Información de selección
 * - Información de paginación
 * - Botones de navegación
 */
export function BannerTablePagination({
  table,
  pagination,
  itemsPerPage,
  onItemsPerPageChange,
  onNextPage,
  onPreviousPage,
  isLoading = false,
}: BannerTablePaginationProps) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      {/* Lado izquierdo: selector de items y contador de selección */}
      <div className="flex items-center gap-4">
        {/* Selector de items por página */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Filas por página:</p>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contador de selección */}
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0 && (
            <span>
              {selectedCount} de {pagination.total} fila(s) seleccionadas.
            </span>
          )}
        </div>
      </div>

      {/* Lado derecho: info de página y botones */}
      <div className="flex items-center gap-2">
        {/* Información de página */}
        <div className="text-sm text-muted-foreground">
          Página {pagination.currentPage} de {pagination.totalPages}
        </div>

        {/* Botones de navegación */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={pagination.currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={pagination.currentPage === pagination.totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
