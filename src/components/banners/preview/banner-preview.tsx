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
  coordinatesMobile?: string;
  placement?: string;
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
  placement?: string;
}

const getMediaUrl = (media: File | string | undefined): string | undefined => {
  if (!media) return undefined;
  return typeof media === "string" ? media : URL.createObjectURL(media);
};

const getContentStyles = (placement: string | undefined, device: "desktop" | "mobile") => {
  const isFlexibleSize = placement === "category-top" || placement === "product-detail" || placement?.startsWith("banner-");
  
  if (isFlexibleSize) {
    return { aspectRatio: "", maxWidth: "max-w-full", isFlexibleSize };
  }
  
  const isDesktop = device === "desktop";
  return {
    aspectRatio: isDesktop ? "aspect-[16/9]" : "aspect-[9/16]",
    maxWidth: isDesktop ? "max-w-2xl" : "max-w-sm",
    isFlexibleSize,
  };
};

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
  placement,
}: Readonly<BannerContentProps>) {
  const [showContent, setShowContent] = useState(!video);
  const [imageUrl, setImageUrl] = useState<string>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = getMediaUrl(image);
    setImageUrl(url);
    if (url && image instanceof File) return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    const url = getMediaUrl(video);
    setVideoUrl(url);
    if (url) {
      setShowContent(false);
      if (video instanceof File) return () => URL.revokeObjectURL(url);
    }
  }, [video]);

  const { aspectRatio, maxWidth, isFlexibleSize } = getContentStyles(placement, device);
  const mediaClass = isFlexibleSize ? "w-full h-auto pointer-events-none" : "absolute inset-0 w-full h-full object-cover pointer-events-none";

  if (!image && !video) {
    return (
      <div className={`relative ${aspectRatio} ${maxWidth} w-full rounded-lg border-2 border-dashed bg-muted flex items-center justify-center ${isFlexibleSize ? "min-h-[200px]" : ""}`}>
        <div className="text-center p-4">
          <p className="text-muted-foreground text-sm">{`Preview ${device === "desktop" ? "Desktop" : "Mobile"}`}</p>
          <p className="text-muted-foreground text-xs mt-1">Sube una imagen o video</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} ${maxWidth} w-full rounded-lg overflow-hidden bg-black`}>
      {video && videoUrl && !showContent && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={mediaClass}
          autoPlay
          muted
          playsInline
          onEnded={() => setShowContent(true)}
        />
      )}

      {(showContent || !video) && imageUrl && (
        <>
          <img src={imageUrl} alt="Banner preview" className={mediaClass} />

          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-9 grid-rows-9">
              {Array.from({ length: 81 }).map((_, i) => (
                <div key={`g-r${Math.floor(i / 9)}-c${i % 9}`} className="border border-dashed border-white/10" />
              ))}
            </div>
          </div>

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

      <div className="absolute top-4 left-4 pointer-events-none">
        <Badge variant="secondary" className="gap-1">
          {device === "desktop" ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
          {device === "desktop" ? "Desktop" : "Mobile"}
        </Badge>
      </div>

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
    placement,
    onCoordinatesChange,
    onCoordinatesMobileChange,
  } = props;
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  const isSingleView = placement === "product-detail" || placement === "category-top" || placement?.startsWith("banner-");
  const isDesktop = viewMode === "desktop";
  const currentCoordinates = isDesktop ? coordinates : coordinatesMobile;
  const currentOnCoordinatesChange = isDesktop ? onCoordinatesChange : onCoordinatesMobileChange;
  const currentImage = isDesktop ? desktop_image : mobile_image;
  const currentVideo = isDesktop ? desktop_video : mobile_video;

  const renderPreviewContent = (mode: "desktop" | "mobile", key: string) => (
    <>
      <div className="flex justify-center">
        <BannerContent
          key={key}
          image={mode === "desktop" ? desktop_image : mobile_image}
          video={mode === "desktop" ? desktop_video : mobile_video}
          title={title}
          description={description}
          cta={cta}
          colorFont={color_font}
          linkUrl={link_url}
          coordinates={mode === "desktop" ? coordinates : currentCoordinates}
          device={mode}
          placement={placement}
        />
      </div>
      <div className="flex justify-center">
        <BannerPositionControls
          coordinates={mode === "desktop" ? coordinates : currentCoordinates}
          onCoordinatesChange={mode === "desktop" ? onCoordinatesChange : currentOnCoordinatesChange}
        />
      </div>
    </>
  );

  if (isSingleView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">Vista General</Badge>
          <Button variant="outline" size="sm" onClick={() => setReloadKey(prev => prev + 1)} title="Recargar preview">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">{renderPreviewContent("desktop", `general-${reloadKey}`)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg flex-1">
          {(["desktop", "mobile"] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="flex-1"
            >
              {mode === "desktop" ? <Monitor className="h-4 w-4 mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
              {mode === "desktop" ? "Desktop" : "Mobile"}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setReloadKey(prev => prev + 1)} title="Recargar preview">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {isDesktop ? (
        <div className="space-y-4">{renderPreviewContent("desktop", `desktop-${reloadKey}`)}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-start">
          <div className="flex justify-center">
            <BannerContent
              key={`mobile-${reloadKey}`}
              image={currentImage}
              video={currentVideo}
              title={title}
              description={description}
              cta={cta}
              colorFont={color_font}
              linkUrl={link_url}
              coordinates={currentCoordinates}
              device="mobile"
              placement={placement}
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
