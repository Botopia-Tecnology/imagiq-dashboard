import { HeroBanner } from "@/types/banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

interface HeroBannerPreviewProps {
  banner: Partial<HeroBanner>;
  className?: string;
}

export function HeroBannerPreview({ banner, className = "" }: HeroBannerPreviewProps) {
  if (banner.type === "image") {
    return (
      <div className={`relative w-full h-96 rounded-lg overflow-hidden ${className}`}>
        {banner.mediaUrl ? (
          <img
            src={banner.mediaUrl}
            alt={banner.name || "Banner preview"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Vista previa de imagen</p>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Imagen</Badge>
        </div>
      </div>
    );
  }

  if (banner.type === "video") {
    return (
      <div className={`relative w-full h-96 rounded-lg overflow-hidden ${className}`}>
        {banner.mediaUrl ? (
          <video
            src={banner.mediaUrl}
            className="w-full h-full object-cover"
            controls
            poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Vista previa de video</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Video</Badge>
        </div>
      </div>
    );
  }

  if (banner.type === "component") {
    const bgColor = banner.bgColor || "#24538F";
    const hasGradient = true;

    return (
      <div
        className={`relative w-full h-96 rounded-lg overflow-hidden ${className}`}
        style={{
          background: hasGradient
            ? `radial-gradient(circle at 30% 50%, ${bgColor}40 0%, ${bgColor} 100%)`
            : bgColor
        }}
      >
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Componente</Badge>
        </div>

        <div className="h-full flex items-center justify-between px-8 text-white">
          {/* Contenido del texto */}
          <div className="flex-1 max-w-lg">
            {banner.subtitle && (
              <p className="text-sm font-medium opacity-90 mb-2">
                {banner.subtitle}
              </p>
            )}

            {banner.title && (
              <h1 className="text-4xl font-bold mb-4">
                {banner.title}
              </h1>
            )}

            {banner.description && (
              <p className="text-lg opacity-90 mb-6 line-clamp-3">
                {banner.description}
              </p>
            )}

            {/* Precios */}
            {(banner.price || banner.originalPrice) && (
              <div className="flex items-center gap-3 mb-4">
                {banner.price && (
                  <span className="text-3xl font-bold">{banner.price}</span>
                )}
                {banner.originalPrice && banner.originalPrice !== banner.price && (
                  <span className="text-lg opacity-70 line-through">
                    {banner.originalPrice}
                  </span>
                )}
              </div>
            )}

            {banner.offerText && (
              <p className="text-sm font-medium opacity-90 mb-6">
                {banner.offerText}
              </p>
            )}

            {banner.buttonText && (
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                {banner.buttonText}
              </Button>
            )}
          </div>

          {/* Imagen/GIF del producto */}
          {banner.gifSrc && (
            <div className="flex-1 flex justify-center items-center">
              <div className="relative">
                <img
                  src={banner.gifSrc}
                  alt={banner.title || "Product"}
                  className="max-w-xs max-h-80 object-contain"
                />
                {/* Efecto de spotlight */}
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: `radial-gradient(circle, white 0%, transparent 70%)`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback para banners sin tipo o vacíos
  return (
    <div className={`w-full h-96 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <p className="text-muted-foreground text-lg mb-2">Vista previa del banner</p>
        <p className="text-muted-foreground/60 text-sm">
          Selecciona un tipo de banner para ver la vista previa
        </p>
      </div>
    </div>
  );
}