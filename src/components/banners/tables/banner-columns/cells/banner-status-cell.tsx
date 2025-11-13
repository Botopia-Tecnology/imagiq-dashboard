import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BackendBanner } from "@/types/banner";
import { statusColors, statusLabels } from "../constants";

interface BannerStatusCellProps {
  readonly banner: BackendBanner;
  readonly onStatusChange?: (banner: BackendBanner, newStatus: "active" | "inactive") => void;
}

/**
 * Celda con selector de estado del banner
 * Permite cambiar el estado directamente desde la tabla
 */
export function BannerStatusCell({ banner, onStatusChange }: Readonly<BannerStatusCellProps>) {
  const status = banner.status;

  return (
    <Select
      value={status}
      onValueChange={(value: "active" | "inactive") => {
        onStatusChange?.(banner, value);
      }}
    >
      <SelectTrigger className="w-[130px] h-8">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            <span className="text-sm">{statusLabels[status]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Activo
          </div>
        </SelectItem>
        <SelectItem value="inactive">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            Inactivo
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
