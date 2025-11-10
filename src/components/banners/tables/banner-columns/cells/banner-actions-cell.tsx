import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import type { BackendBanner } from "@/types/banner";

interface BannerActionsCellProps {
  banner: BackendBanner;
  onEdit?: (banner: BackendBanner) => void;
  onDelete?: (banner: BackendBanner) => void;
}

/**
 * Celda con menú de acciones del banner
 * Incluye: Ver detalles, Editar, Ver en sitio, Eliminar
 */
export function BannerActionsCell({ banner, onEdit, onDelete }: BannerActionsCellProps) {
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
        <DropdownMenuItem onClick={() => onEdit?.(banner)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {banner.link_url && (
          <DropdownMenuItem onClick={() => window.open(banner.link_url, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver en sitio
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(banner)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
