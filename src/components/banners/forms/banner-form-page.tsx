"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBannerForm } from "@/hooks/use-banner-form";
import { BannerFormFields } from "./banner-form-fields";
import { BannerMediaUpload } from "./banner-media-upload";
import { BannerPreview } from "../preview/banner-preview";

interface BannerFormPageProps {
  mode: "create" | "edit";
  bannerId?: string;
  initialPlacement: string;
}

/**
 * Componente compartido para crear y editar banners
 * Centraliza toda la UI del formulario y usa el hook useBannerForm para la lógica
 */
export function BannerFormPage({ mode, bannerId, initialPlacement }: BannerFormPageProps) {
  const router = useRouter();

  const {
    formData,
    existingUrls,
    isLoading,
    isFetching,
    handleFieldChange,
    handleFileChange,
    handleCoordinatesChange,
    handleCoordinatesMobileChange,
    handleSubmit,
  } = useBannerForm({ mode, bannerId, initialPlacement });

  // Definir textos según el modo
  const pageTitle = mode === "create" ? "Crear Banner" : "Editar Banner";
  const pageDescription =
    mode === "create" ? "Configura tu nuevo banner" : "Modifica la configuración del banner";
  const backRoute =
    mode === "create" ? "/marketing/banners/crear/seleccionar-tipo" : "/marketing/banners";

  // Estado de carga
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando banner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(backRoute)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <Badge variant="secondary" className="capitalize">
              {formData.placement}
            </Badge>
          </div>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {/* Campos del formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerFormFields formData={formData} onFieldChange={handleFieldChange} />
            </CardContent>
          </Card>

          {/* Upload de archivos */}
          <Card>
            <CardHeader>
              <CardTitle>Archivos Multimedia</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerMediaUpload files={formData} onFileChange={handleFileChange} />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button onClick={() => handleSubmit("active")} disabled={isLoading} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Publicar Banner
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BannerPreview
              desktop_image={formData.desktop_image || existingUrls.desktop_image_url}
              desktop_video={formData.desktop_video || existingUrls.desktop_video_url}
              mobile_image={formData.mobile_image || existingUrls.mobile_image_url}
              mobile_video={formData.mobile_video || existingUrls.mobile_video_url}
              title={formData.title}
              description={formData.description}
              cta={formData.cta}
              color_font={formData.color_font}
              link_url={formData.link_url}
              coordinates={formData.coordinates}
              coordinatesMobile={formData.coordinates_mobile}
              onCoordinatesChange={handleCoordinatesChange}
              onCoordinatesMobileChange={handleCoordinatesMobileChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
