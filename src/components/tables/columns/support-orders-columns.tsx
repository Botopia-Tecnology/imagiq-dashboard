"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  SupportOrder,
  SupportOrderStatus,
  getSupportStatusLabel,
  getSupportStatusColor,
} from "@/types/support-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  CreditCard,
  Building2,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

const getPaymentMethodIcon = (medio: string) => {
  switch (medio) {
    case "Tarjeta":
      return CreditCard;
    case "PSE":
      return Building2;
    default:
      return CreditCard;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const supportOrdersColumns: ColumnDef<SupportOrder>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orden_numero",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          # Orden
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ordenNumero = row.getValue("orden_numero") as string;
      const fechaCreacion = row.original.fecha_creacion;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{ordenNumero}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(fechaCreacion), "dd MMM yyyy, HH:mm", {
              locale: es,
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cliente",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const cliente = row.getValue("cliente") as string;
      const documento = row.original.numero_documento;

      return (
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{cliente}</span>
          <span className="text-xs text-muted-foreground truncate">
            Doc: {documento}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      return <div className="font-medium">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "estado_pago",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const estado = row.getValue("estado_pago") as SupportOrderStatus | null;
      const label = getSupportStatusLabel(estado);
      const color = getSupportStatusColor(estado);

      return (
        <Badge variant="outline" className={`gap-1 ${color}`}>
          {label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as string | null;
      return value.includes(estado ?? "PENDING");
    },
  },
  {
    accessorKey: "medio_pago",
    header: "Medio de Pago",
    cell: ({ row }) => {
      const medioPago = row.original.medio_pago;
      const infoPago = row.original.info_pago;
      const Icon = getPaymentMethodIcon(medioPago);

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{medioPago}</span>
          </div>
          {infoPago && infoPago !== "N/A" && (
            <span className="text-xs text-muted-foreground">{infoPago}</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "fecha_creacion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fecha = row.getValue("fecha_creacion") as string;

      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(fecha), "dd/MM/yyyy", { locale: es })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(fecha), "HH:mm", { locale: es })}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/servicio-tecnico/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(order.orden_numero)
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar # orden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
