"use client";

import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BannerMediaUploadProps {
  readonly files: {
    desktop_image?: File;
    desktop_video?: File;
    mobile_image?: File;
    mobile_video?: File;
  };
  readonly placement: string;
  readonly onFileChange: (field: string, file: File | undefined) => void;
}

export function BannerMediaUpload({ files, placement, onFileChange }: BannerMediaUploadProps) {
  // Para product-detail y category-top (o placements que empiezan con "banner-"), solo mostrar una opción general
  const isSingleMedia = placement === "product-detail" || placement === "category-top" || placement.startsWith("banner-");

  if (isSingleMedia) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="desktop_image">Imagen del Banner</Label>
          <div className="flex items-center gap-2">
            <Input
              id="desktop_image"
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange("desktop_image", e.target.files?.[0])}
            />
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          {files.desktop_image && (
            <p className="text-xs text-muted-foreground">{files.desktop_image.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="desktop_video">Video del Banner</Label>
          <div className="flex items-center gap-2">
            <Input
              id="desktop_video"
              type="file"
              accept="video/*"
              onChange={(e) => onFileChange("desktop_video", e.target.files?.[0])}
            />
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          {files.desktop_video && (
            <p className="text-xs text-muted-foreground">{files.desktop_video.name}</p>
          )}
        </div>
      </div>
    );
  }

  // Para otros placements, mostrar desktop y mobile separados
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="desktop_image">Imagen Desktop</Label>
        <div className="flex items-center gap-2">
          <Input
            id="desktop_image"
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange("desktop_image", e.target.files?.[0])}
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {files.desktop_image && (
          <p className="text-xs text-muted-foreground">{files.desktop_image.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_image">Imagen Mobile</Label>
        <div className="flex items-center gap-2">
          <Input
            id="mobile_image"
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange("mobile_image", e.target.files?.[0])}
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {files.mobile_image && (
          <p className="text-xs text-muted-foreground">{files.mobile_image.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="desktop_video">Video Desktop</Label>
        <div className="flex items-center gap-2">
          <Input
            id="desktop_video"
            type="file"
            accept="video/*"
            onChange={(e) => onFileChange("desktop_video", e.target.files?.[0])}
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {files.desktop_video && (
          <p className="text-xs text-muted-foreground">{files.desktop_video.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_video">Video Mobile</Label>
        <div className="flex items-center gap-2">
          <Input
            id="mobile_video"
            type="file"
            accept="video/*"
            onChange={(e) => onFileChange("mobile_video", e.target.files?.[0])}
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {files.mobile_video && (
          <p className="text-xs text-muted-foreground">{files.mobile_video.name}</p>
        )}
      </div>
    </div>
  );
}
