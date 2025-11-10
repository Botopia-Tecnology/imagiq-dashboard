"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bannerEndpoints } from "@/lib/api";
import { BannerFormFields } from "@/components/banners/forms/banner-form-fields";
import { BannerMediaUpload } from "@/components/banners/forms/banner-media-upload";
import { BannerPreview } from "@/components/banners/preview/banner-preview";

interface BannerFormData {
  name: string;
  placement: string;
  link_url: string;
  status: "draft" | "active" | "inactive";
  title: string;
  description: string;
  cta: string;
  color_font: string;
  coordinates: string;
  coordinates_mobile: string;
  desktop_image?: File;
  desktop_video?: File;
  mobile_image?: File;
  mobile_video?: File;
}

export default function CrearBannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placementFromUrl = searchParams.get("type") || "home";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>({
    name: "",
    placement: placementFromUrl,
    link_url: "",
    status: "draft",
    title: "",
    description: "",
    cta: "",
    color_font: "#000000",
    coordinates: "4-4", // Centro por defecto (cuadrícula 9x9)
    coordinates_mobile: "4-4", // Centro por defecto para móvil
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleCoordinatesChange = (newCoordinates: string) => {
    setFormData((prev) => ({ ...prev, coordinates: newCoordinates }));
  };

  const handleCoordinatesMobileChange = (newCoordinates: string) => {
    setFormData((prev) => ({ ...prev, coordinates_mobile: newCoordinates }));
  };

  const buildFormData = (status: "draft" | "active"): FormData => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("placement", formData.placement);
    data.append("status", status);

    if (formData.link_url) data.append("link_url", formData.link_url);
    if (formData.title) data.append("title", formData.title);
    if (formData.description) data.append("description", formData.description);
    if (formData.cta) data.append("cta", formData.cta);
    if (formData.color_font) data.append("color_font", formData.color_font);
    if (formData.coordinates) data.append("coordinates", formData.coordinates);
    if (formData.coordinates_mobile) data.append("coordinates_mobile", formData.coordinates_mobile);

    // Archivos multimedia - todos con la key "files" en orden específico
    // Orden: desktop_image_url, mobile_image_url, desktop_video_url, mobile_video_url
    if (formData.desktop_image) {
      data.append("files", formData.desktop_image, formData.desktop_image.name);
    }
    if (formData.mobile_image) {
      data.append("files", formData.mobile_image, formData.mobile_image.name);
    }
    if (formData.desktop_video) {
      data.append("files", formData.desktop_video, formData.desktop_video.name);
    }
    if (formData.mobile_video) {
      data.append("files", formData.mobile_video, formData.mobile_video.name);
    }

    return data;
  };

  const handleSubmit = async (status: "draft" | "active") => {
    if (!formData.name) {
      alert("El nombre del banner es obligatorio");
      return;
    }

    setIsLoading(true);
    try {
      const data = buildFormData(status);
      const response = await bannerEndpoints.create(data);

      if (response.success) {
        router.push("/marketing/banners");
      } else {
        alert(response.message || `Error al ${status === "draft" ? "guardar" : "publicar"} el banner`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
      console.error("Error submitting banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/marketing/banners/crear/seleccionar-tipo")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Crear Banner</h1>
            <Badge variant="secondary" className="capitalize">
              {formData.placement}
            </Badge>
          </div>
          <p className="text-muted-foreground">Configura tu nuevo banner</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerFormFields formData={formData} onFieldChange={handleFieldChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Archivos Multimedia</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerMediaUpload files={formData} onFileChange={handleFileChange} />
            </CardContent>
          </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BannerPreview
              desktop_image={formData.desktop_image}
              desktop_video={formData.desktop_video}
              mobile_image={formData.mobile_image}
              mobile_video={formData.mobile_video}
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
