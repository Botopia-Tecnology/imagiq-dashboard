"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBannerForm } from "@/hooks/use-banner-form";
import { BannerFormFields } from "./banner-form-fields";
import { BannerMediaUpload } from "./banner-media-upload";
import { BannerCategoryFields } from "./banner-category-fields";
import { BannerPreview } from "../preview/banner-preview";
import { BannerSizeGuide } from "./banner-size-guide";

interface BannerFormPageProps {
  readonly mode: "create" | "edit";
  readonly bannerId?: string;
  readonly initialPlacement: string;
}

/**
 * Componente compartido para crear y editar banners
 * Centraliza toda la UI del formulario y usa el hook useBannerForm para la lógica
 */
export function BannerFormPage({ mode, bannerId, initialPlacement }: BannerFormPageProps) {
  const router = useRouter();

  // Estado local para guardar los nombres de categoría y subcategoría
  const [categoryName, setCategoryName] = useState("");

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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(backRoute)}
          className="self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{pageTitle}</h1>
            <Badge variant="secondary" className="capitalize self-start">
              {formData.placement}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{pageDescription}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-3 sm:space-y-4">
          {/* Campos del formulario */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Información del Banner</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <BannerFormFields formData={formData} onFieldChange={handleFieldChange} />
            </CardContent>
          </Card>

          {/* Campos de categoría (solo para category-top o banners de categoría) */}
          {(formData.placement === "category-top" || formData.placement.startsWith("banner-")) && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Ubicación en Categoría</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <BannerCategoryFields
                  categoryId={formData.category_id}
                  subcategoryId={formData.subcategory_id}
                  onCategoryChange={(categoryId, newCategoryName) => {
                    handleFieldChange("category_id", categoryId);
                    setCategoryName(newCategoryName);
                    // Actualizar placement solo con la categoría
                    handleFieldChange("placement", `banner-${newCategoryName}`);
                  }}
                  onSubcategoryChange={(subcategoryId, newSubcategoryName) => {
                    handleFieldChange("subcategory_id", subcategoryId);
                    // Actualizar placement con categoría y subcategoría
                    const newPlacement = subcategoryId === "none" || !subcategoryId
                      ? `banner-${categoryName}`
                      : `banner-${categoryName}-${newSubcategoryName}`;
                    handleFieldChange("placement", newPlacement);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Guía de dimensiones */}
          <BannerSizeGuide placement={formData.placement} />

          {/* Upload de archivos */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Archivos Multimedia</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <BannerMediaUpload
                files={formData}
                existingUrls={existingUrls}
                placement={formData.placement}
                onFileChange={handleFileChange}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Guardando...</span>
                  <span className="sm:hidden">Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Guardar Borrador</span>
                  <span className="sm:hidden">Borrador</span>
                </>
              )}
            </Button>
            <Button onClick={() => handleSubmit("active")} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Publicando...</span>
                  <span className="sm:hidden">Publicando...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Publicar Banner</span>
                  <span className="sm:hidden">Publicar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card className="lg:sticky lg:top-4">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
              placement={formData.placement}
              onCoordinatesChange={handleCoordinatesChange}
              onCoordinatesMobileChange={handleCoordinatesMobileChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
