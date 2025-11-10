"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, RotateCcw } from "lucide-react";
import { BannerContentOverlay } from "./banner-content-overlay";
import { BannerPositionControls } from "./banner-position-controls";

interface BannerPreviewProps {
  desktop_image?: File | string;
  desktop_video?: File | string;
  mobile_image?: File | string;
  mobile_video?: File | string;
  title?: string;
  description?: string;
  cta?: string;
  color_font?: string;
  link_url?: string;
  coordinates?: string;
  coordinatesMobile?: string; // Mantener camelCase en el prop para compatibilidad
  onCoordinatesChange?: (coordinates: string) => void;
  onCoordinatesMobileChange?: (coordinates: string) => void;
}

interface BannerContentProps {
  image?: File | string;
  video?: File | string;
  title?: string;
  description?: string;
  cta?: string;
  colorFont?: string;
  linkUrl?: string;
  coordinates?: string;
  device: "desktop" | "mobile";
}

function BannerContent({
  image,
  video,
  title,
  description,
  cta,
  colorFont = "#FFFFFF",
  coordinates,
  linkUrl,
  device,
}: Readonly<BannerContentProps>) {
  const [showContent, setShowContent] = useState(!video);
  const [imageUrl, setImageUrl] = useState<string>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (image) {
      // Si es string (URL del backend), usar directamente
      if (typeof image === "string") {
        setImageUrl(image);
      } else {
        // Si es File (nuevo upload), crear objeto URL
        const url = URL.createObjectURL(image);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setImageUrl(undefined);
    }
  }, [image]);

  useEffect(() => {
    if (video) {
      // Si es string (URL del backend), usar directamente
      if (typeof video === "string") {
        setVideoUrl(video);
        setShowContent(false);
      } else {
        // Si es File (nuevo upload), crear objeto URL
        const url = URL.createObjectURL(video);
        setVideoUrl(url);
        setShowContent(false);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setVideoUrl(undefined);
    }
  }, [video]);

  const handleVideoEnd = () => {
    setShowContent(true);
  };

  const aspectRatio = device === "desktop" ? "aspect-[16/9]" : "aspect-[9/16]";
  const maxWidth = device === "desktop" ? "max-w-2xl" : "max-w-sm";

  if (!image && !video) {
    return (
      <div className={`relative ${aspectRatio} ${maxWidth} w-full rounded-lg border-2 border-dashed bg-muted flex items-center justify-center`}>
        <div className="text-center p-4">
          <p className="text-muted-foreground text-sm">
            {device === "desktop" ? "Preview Desktop" : "Preview Mobile"}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Sube una imagen o video
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${aspectRatio} ${maxWidth} w-full rounded-lg overflow-hidden bg-black`}
    >
      {/* Video (se reproduce primero si existe) */}
      {video && videoUrl && !showContent && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        />
      )}

      {/* Imagen con contenido (se muestra después del video o inmediatamente si no hay video) */}
      {showContent && imageUrl && (
        <>
          <img
            src={imageUrl}
            alt="Banner preview"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Visible 9x9 helper grid */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-9 grid-rows-9">
              {Array.from({ length: 81 }).map((_, i) => {
                const r = Math.floor(i / 9);
                const c = i % 9;
                return <div key={`g-r${r}-c${c}`} className="border border-dashed border-white/10" />;
              })}
            </div>
          </div>

          {/* Overlay con contenido */}
          {(title || description || cta || linkUrl) && (
            <BannerContentOverlay
              title={title}
              description={description}
              cta={cta}
              colorFont={colorFont}
              coordinates={coordinates}
              linkUrl={linkUrl}
              device={device}
            />
          )}
        </>
      )}

      {/* Badge indicador */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <Badge variant="secondary" className="gap-1">
          {device === "desktop" ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
          {device === "desktop" ? "Desktop" : "Mobile"}
        </Badge>
      </div>

      {/* Badge de video si hay video */}
      {video && !showContent && (
        <div className="absolute top-4 right-4 pointer-events-none">
          <Badge variant="destructive">Video reproduciendo</Badge>
        </div>
      )}
    </div>
  );
}

export function BannerPreview(props: Readonly<BannerPreviewProps>) {
  const {
    desktop_image,
    desktop_video,
    mobile_image,
    mobile_video,
    title,
    description,
    cta,
    color_font = "#FFFFFF",
    link_url,
    coordinates,
    coordinatesMobile,
    onCoordinatesChange,
    onCoordinatesMobileChange,
  } = props;
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  // Usar las coordenadas correctas según el modo
  const currentCoordinates = viewMode === "desktop" ? coordinates : coordinatesMobile;
  const currentOnCoordinatesChange = viewMode === "desktop" ? onCoordinatesChange : onCoordinatesMobileChange;
  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Toggle buttons y controles */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg flex-1">
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("desktop")}
            className="flex-1"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("mobile")}
            className="flex-1"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          title="Recargar preview"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Layout condicional basado en el viewMode */}
      {viewMode === "desktop" ? (
        // Desktop: Preview arriba, controles abajo
        <div className="space-y-4">
          <div className="flex justify-center">
            <BannerContent
              key={`desktop-${reloadKey}`}
              image={desktop_image}
              video={desktop_video}
              title={title}
              description={description}
              cta={cta}
              colorFont={color_font}
              linkUrl={link_url}
              coordinates={currentCoordinates}
              device="desktop"
            />
          </div>
          <div className="flex justify-center">
            <BannerPositionControls
              coordinates={currentCoordinates}
              onCoordinatesChange={currentOnCoordinatesChange}
            />
          </div>
        </div>
      ) : (
        // Mobile: Preview al lado izquierdo, controles al lado derecho
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-start">
          <div className="flex justify-center">
            <BannerContent
              key={`mobile-${reloadKey}`}
              image={mobile_image}
              video={mobile_video}
              title={title}
              description={description}
              cta={cta}
              colorFont={color_font}
              linkUrl={link_url}
              coordinates={currentCoordinates}
              device="mobile"
            />
          </div>
          <BannerPositionControls
            coordinates={currentCoordinates}
            onCoordinatesChange={currentOnCoordinatesChange}
          />
        </div>
      )}
    </div>
  );
}
