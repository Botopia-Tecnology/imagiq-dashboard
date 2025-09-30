"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Settings, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PhysicalStore, StoreStats } from "@/types/physical-stores";

interface StoresDataTableProps {
  stores: PhysicalStore[];
  storeStats: Record<string, StoreStats>;
  onViewStore: (store: PhysicalStore) => void;
  onManageOrders: (store: PhysicalStore) => void;
  onStoreSettings: (store: PhysicalStore) => void;
}

export function StoresDataTable({
  stores,
  storeStats,
  onViewStore,
  onManageOrders,
  onStoreSettings,
}: StoresDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'temporarily_closed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Activa',
      inactive: 'Inactiva',
      maintenance: 'Mantenimiento',
      temporarily_closed: 'Cerrada Temporalmente'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const columns: ColumnDef<PhysicalStore>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.getValue("code")}</div>
      ),
    },
    {
      id: "location",
      accessorFn: (row) => row.location.name,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tienda
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const store = row.original;
        return (
          <div>
            <div className="font-medium">{store.location.name}</div>
            <div className="text-sm text-muted-foreground">
              {store.location.city}, {store.location.state}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: "orders",
      header: "Órdenes",
      cell: ({ row }) => {
        const store = row.original;
        const stats = storeStats[store.id];

        if (!stats) {
          return <div className="text-muted-foreground">Sin datos</div>;
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {stats.readyOrders} listas
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.pendingOrders} pendientes
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.completedToday} completadas hoy
            </div>
          </div>
        );
      },
    },
    {
      id: "performance",
      header: "Rendimiento",
      cell: ({ row }) => {
        const store = row.original;
        const stats = storeStats[store.id];

        if (!stats) {
          return <div className="text-muted-foreground">Sin datos</div>;
        }

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {stats.customerSatisfaction.toFixed(1)}⭐
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.averagePickupTime.toFixed(1)}m promedio
            </div>
          </div>
        );
      },
    },
    {
      id: "pickupMethods",
      accessorFn: (row) => row.capabilities.pickupMethods,
      header: "Métodos",
      cell: ({ row }) => {
        const methods = row.original.capabilities.pickupMethods;
        const methodLabels = {
          in_store: "Tienda",
          curbside: "Bordillo",
          locker: "Locker",
          drive_thru: "Auto"
        };

        return (
          <div className="flex flex-wrap gap-1">
            {methods.map((method) => (
              <Badge key={method} variant="outline" className="text-xs">
                {methodLabels[method as keyof typeof methodLabels] || method}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "manager",
      accessorFn: (row) => row.contact.managerName,
      header: "Manager",
      cell: ({ row }) => {
        const store = row.original;
        return (
          <div>
            <div className="font-medium">{store.contact.managerName}</div>
            <div className="text-sm text-muted-foreground">
              {store.contact.phone}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const store = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewStore(store)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageOrders(store)}>
                <Package className="mr-2 h-4 w-4" />
                Gestionar Órdenes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStoreSettings(store)}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: stores,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar tiendas..."
          value={(table.getColumn("location")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("location")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
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
                  );
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
                  No se encontraron tiendas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}