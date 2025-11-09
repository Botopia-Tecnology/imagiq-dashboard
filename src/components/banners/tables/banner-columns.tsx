"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackendBanner } from "@/types/banner";

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  draft: "bg-yellow-500",
};

const statusLabels = {
  active: "Activo",
  inactive: "Inactivo",
  draft: "Borrador",
};

const placementLabels: Record<string, string> = {
  home: "Inicio",
  category: "Categoría",
  checkout: "Checkout",
};

export const createBannerColumns = (): ColumnDef<BackendBanner>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Banner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const banner = row.original;
      const imageUrl = banner.desktop_image_url || banner.mobile_image_url;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={imageUrl} alt={banner.name} className="object-cover" />
            <AvatarFallback className="rounded-md">
              {banner.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{banner.name}</div>
            {banner.title && (
              <div className="text-sm text-muted-foreground">{banner.title}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "placement",
    header: "Ubicación",
    cell: ({ row }) => {
      // Use typed access to the original row object to avoid unnecessary type assertions
      const placement = row.original.placement;
      return (
        <Badge variant="outline">
          {placementLabels[placement] || placement}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      // Access the typed property from the original row to avoid 'as' assertions
      const status = row.original.status;
      return (
        <Badge variant="outline" className="gap-1">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          {statusLabels[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "link_url",
    header: "Enlace",
    cell: ({ row }) => {
      // Prefer using the typed original object
      const linkUrl = row.original.link_url;
      if (!linkUrl) {
        return <span className="text-muted-foreground text-sm">Sin enlace</span>;
      }
      return (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          Ver
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Use the original object which is correctly typed in BackendBanner
      const dateString = row.original.created_at;
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const banner = row.original;

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
            <DropdownMenuItem onClick={() => console.log("Ver detalles", banner.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar", banner.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {banner.link_url && (
              <DropdownMenuItem
                onClick={() => window.open(banner.link_url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en sitio
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => console.log("Eliminar", banner.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
