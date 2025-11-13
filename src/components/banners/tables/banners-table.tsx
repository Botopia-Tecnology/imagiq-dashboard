"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBanners } from "@/hooks/use-banners";
import { createBannerColumns } from "./banner-columns";
import { useBannerTableActions } from "./hooks/use-banner-table-actions";
import { BannerTableToolbar } from "./components/banner-table-toolbar";
import { BannerTablePagination } from "./components/banner-table-pagination";
import { BannerDeleteDialogs } from "./components/banner-delete-dialogs";

/**
 * Componente principal de la tabla de banners
 * Orquesta todos los subcomponentes y hooks
 */
export function BannersTable() {
  const router = useRouter();

  // Estado de la tabla
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    color_font: false,
    coordinates: false,
    coordinates_mobile: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);

  // Datos de la tabla
  const { banners, isLoading, error, pagination, nextPage, previousPage, refetch } = useBanners({
    limit: itemsPerPage,
  });

  // Acciones de la tabla (delete, status change, etc.)
  const {
    bannerToDelete,
    bannersToDelete,
    isDeleting,
    handleStatusChange,
    handleDelete,
    handleBulkDelete,
    confirmDelete,
    confirmBulkDelete,
    cancelDelete,
    cancelBulkDelete,
  } = useBannerTableActions({
    onSuccess: () => {
      refetch();
      setRowSelection({});
    },
  });

  // Navegación a editar
  const handleEdit = (banner: any) => {
    router.push(`/marketing/banners/${banner.id}/editar`);
  };

  // Definición de columnas
  const columns = React.useMemo(
    () =>
      createBannerColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onStatusChange: (banner, status) => void handleStatusChange(banner, status),
      }),
    [handleDelete, handleStatusChange]
  );

  // Configuración de la tabla
  const table = useReactTable({
    data: banners,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  // Handler para eliminación masiva
  const handleBulkDeleteClick = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedBanners = selectedRows.map((row) => row.original);
    handleBulkDelete(selectedBanners);
  };

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border border-destructive p-8 text-center">
          <p className="text-destructive font-medium">Error al cargar los banners</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Contenido del body de la tabla
  let bodyContent: React.ReactNode;
  if (isLoading) {
    bodyContent = (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Cargando banners...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  } else if (table.getRowModel().rows?.length) {
    bodyContent = table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  } else {
    bodyContent = (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No se encontraron banners.
        </TableCell>
      </TableRow>
    );
  }

  return (
    // `min-w-0` permite que este contenedor pueda encogerse cuando un hijo (la tabla)
    // es más ancho; de este modo solo el wrapper de la tabla hará scroll horizontal
    // y el resto del layout (toolbar, paginación) se mantiene en el ancho visible.
    <div className="w-full min-w-0">
      {/* Toolbar: filtros y acciones */}
      <BannerTableToolbar table={table} onBulkDelete={handleBulkDeleteClick} />

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        {/* Forzamos que la tabla pueda tener un ancho mínimo mayor al contenedor
            y se muestre un scroll horizontal solo en este wrapper. */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{bodyContent}</TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <BannerTablePagination
        table={table}
        pagination={pagination}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        onNextPage={nextPage}
        onPreviousPage={previousPage}
        isLoading={isLoading}
      />

      {/* Diálogos de confirmación */}
      <BannerDeleteDialogs
        bannerToDelete={bannerToDelete}
        onCancelDelete={cancelDelete}
        onConfirmDelete={confirmDelete}
        bannersToDelete={bannersToDelete}
        onCancelBulkDelete={cancelBulkDelete}
        onConfirmBulkDelete={confirmBulkDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
