import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BackendBanner } from "@/types/banner";

interface BannerNameCellProps {
  banner: BackendBanner;
}

/**
 * Celda que muestra el nombre del banner con avatar (imagen o iniciales)
 */
export function BannerNameCell({ banner }: BannerNameCellProps) {
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
        {banner.title && <div className="text-sm text-muted-foreground">{banner.title}</div>}
      </div>
    </div>
  );
}
