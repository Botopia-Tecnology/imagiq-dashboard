import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { BackendBanner } from "@/types/banner";
import { BannerNameCell } from "./cells/banner-name-cell";
import { BannerStatusCell } from "./cells/banner-status-cell";
import { BannerActionsCell } from "./cells/banner-actions-cell";
import {
  BannerDescriptionCell,
  BannerCtaCell,
  BannerColorCell,
  BannerCoordinatesCell,
  BannerLinkCell,
  BannerPlacementCell,
} from "./cells/simple-cells";
import { placementLabels } from "./constants";

export interface BannerColumnActions {
  onEdit?: (banner: BackendBanner) => void;
  onDelete?: (banner: BackendBanner) => void;
  onStatusChange?: (banner: BackendBanner, newStatus: "active" | "inactive") => void;
}

/**
 * Crea las definiciones de columnas para la tabla de banners
 * Centraliza toda la configuración de columnas en un solo lugar
 */
export function createBannerColumns(actions?: BannerColumnActions): ColumnDef<BackendBanner>[] {
  return [
    // Columna de selección
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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

    // Columna de nombre (con avatar)
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Banner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <BannerNameCell banner={row.original} />,
    },

    // Columna de descripción
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => <BannerDescriptionCell value={row.original.description} />,
      enableHiding: true,
    },

    // Columna de CTA
    {
      accessorKey: "cta",
      header: "CTA",
      cell: ({ row }) => <BannerCtaCell value={row.original.cta} />,
      enableHiding: true,
    },

    // Columna de color de fuente
    {
      accessorKey: "color_font",
      header: "Color Fuente",
      cell: ({ row }) => <BannerColorCell value={row.original.color_font} />,
      enableHiding: true,
    },

    // Columna de coordenadas desktop
    {
      accessorKey: "coordinates",
      header: "Posición Desktop",
      cell: ({ row }) => <BannerCoordinatesCell value={row.original.coordinates} />,
      enableHiding: true,
    },

    // Columna de coordenadas mobile
    {
      accessorKey: "coordinates_mobile",
      header: "Posición Mobile",
      cell: ({ row }) => <BannerCoordinatesCell value={row.original.coordinates_mobile} />,
      enableHiding: true,
    },

    // Columna de ubicación
    {
      accessorKey: "placement",
      header: "Ubicación",
      cell: ({ row }) => (
        <BannerPlacementCell value={row.original.placement} labels={placementLabels} />
      ),
    },

    // Columna de estado (con selector)
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <BannerStatusCell banner={row.original} onStatusChange={actions?.onStatusChange} />
      ),
    },

    // Columna de enlace
    {
      accessorKey: "link_url",
      header: "Enlace",
      cell: ({ row }) => <BannerLinkCell value={row.original.link_url} />,
    },

    // Columna de fecha de creación
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },

    // Columna de acciones
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <BannerActionsCell
          banner={row.original}
          onEdit={actions?.onEdit}
          onDelete={actions?.onDelete}
        />
      ),
    },
  ];
}
