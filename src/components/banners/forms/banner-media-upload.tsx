"use client";

import { Upload, Video, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BannerMediaUploadProps {
  readonly files: {
    desktop_image?: File;
    desktop_video?: File;
    mobile_image?: File;
    mobile_video?: File;
  };
  readonly existingUrls?: {
    desktop_image_url?: string;
    desktop_video_url?: string;
    mobile_image_url?: string;
    mobile_video_url?: string;
  };
  readonly placement: string;
  readonly onFileChange: (field: string, file: File | undefined) => void;
}

interface MediaFieldProps {
  readonly id: string;
  readonly label: string;
  readonly accept: string;
  readonly file?: File;
  readonly existingUrl?: string;
  readonly isVideo: boolean;
  readonly onFileChange: (file: File | undefined) => void;
  readonly onRemove: () => void;
}

function MediaField({
  id,
  label,
  accept,
  file,
  existingUrl,
  isVideo,
  onFileChange,
  onRemove
}: MediaFieldProps) {
  const hasNewFile = !!file;
  const hasExistingFile = !!existingUrl && !hasNewFile;
  const fileName = existingUrl ? existingUrl.split('/').pop() || 'Archivo actual' : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {/* Mostrar archivo existente con preview */}
      {hasExistingFile && (
        <div className="space-y-2">
          <div className="relative group rounded-lg border overflow-hidden bg-muted/30">
            {/* Preview del archivo */}
            <div className="flex items-center gap-3 p-3">
              {/* Thumbnail/Preview */}
              <div className="relative w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                {isVideo ? (
                  // Preview de video con poster
                  <div className="w-full h-full flex items-center justify-center bg-black/5">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <video
                      src={existingUrl}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                      muted
                    />
                  </div>
                ) : (
                  // Preview de imagen
                  <Image
                    src={existingUrl}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>

              {/* Info del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Archivo actual</p>
                <p className="text-xs text-muted-foreground truncate">{fileName}</p>
              </div>

              {/* Acciones */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  onClick={() => document.getElementById(id)?.click()}
                  title="Cambiar archivo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={onRemove}
                  title="Eliminar archivo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <Input
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Input para nuevo archivo (cuando no hay archivo existente) */}
      {!hasExistingFile && (
        <>
          <div className="flex items-center gap-2">
            <Input
              id={id}
              type="file"
              accept={accept}
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          {hasNewFile && (
            <p className="text-xs text-muted-foreground">{file.name}</p>
          )}
        </>
      )}
    </div>
  );
}

export function BannerMediaUpload({ files, existingUrls, placement, onFileChange }: BannerMediaUploadProps) {
  // Para product-detail y category-top (o placements que empiezan con "banner-"), solo mostrar una opción general
  const isSingleMedia = placement === "product-detail" || placement === "category-top" || placement.startsWith("banner-");

  if (isSingleMedia) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <MediaField
          id="desktop_image"
          label="Imagen del Banner"
          accept="image/*"
          file={files.desktop_image}
          existingUrl={existingUrls?.desktop_image_url}
          isVideo={false}
          onFileChange={(file) => onFileChange("desktop_image", file)}
          onRemove={() => onFileChange("desktop_image", undefined)}
        />

        <MediaField
          id="desktop_video"
          label="Video del Banner"
          accept="video/*"
          file={files.desktop_video}
          existingUrl={existingUrls?.desktop_video_url}
          isVideo={true}
          onFileChange={(file) => onFileChange("desktop_video", file)}
          onRemove={() => onFileChange("desktop_video", undefined)}
        />
      </div>
    );
  }

  // Para otros placements, mostrar desktop y mobile separados
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MediaField
        id="desktop_image"
        label="Imagen Desktop"
        accept="image/*"
        file={files.desktop_image}
        existingUrl={existingUrls?.desktop_image_url}
        isVideo={false}
        onFileChange={(file) => onFileChange("desktop_image", file)}
        onRemove={() => onFileChange("desktop_image", undefined)}
      />

      <MediaField
        id="mobile_image"
        label="Imagen Mobile"
        accept="image/*"
        file={files.mobile_image}
        existingUrl={existingUrls?.mobile_image_url}
        isVideo={false}
        onFileChange={(file) => onFileChange("mobile_image", file)}
        onRemove={() => onFileChange("mobile_image", undefined)}
      />

      <MediaField
        id="desktop_video"
        label="Video Desktop"
        accept="video/*"
        file={files.desktop_video}
        existingUrl={existingUrls?.desktop_video_url}
        isVideo={true}
        onFileChange={(file) => onFileChange("desktop_video", file)}
        onRemove={() => onFileChange("desktop_video", undefined)}
      />

      <MediaField
        id="mobile_video"
        label="Video Mobile"
        accept="video/*"
        file={files.mobile_video}
        existingUrl={existingUrls?.mobile_video_url}
        isVideo={true}
        onFileChange={(file) => onFileChange("mobile_video", file)}
        onRemove={() => onFileChange("mobile_video", undefined)}
      />
    </div>
  );
}
