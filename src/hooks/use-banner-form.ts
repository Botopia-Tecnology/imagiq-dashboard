import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bannerEndpoints } from "@/lib/api";
import {
  buildCreateBannerFormData,
  buildUpdateBannerFormData,
  type BannerFormFields,
  type BannerMediaFiles,
  type ExistingMediaUrls,
} from "@/components/banners/utils/banner-form-builder";

export interface BannerFormData extends BannerFormFields, BannerMediaFiles {}

interface UseBannerFormOptions {
  mode: "create" | "edit";
  bannerId?: string;
  initialPlacement: string;
}

/**
 * Hook personalizado para manejar la lógica de formularios de banner (crear y editar)
 * Centraliza:
 * - Estado del formulario
 * - Carga de datos (para edición)
 * - Handlers de cambio
 * - Envío del formulario
 */
export function useBannerForm({ mode, bannerId, initialPlacement }: UseBannerFormOptions) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  const [formData, setFormData] = useState<BannerFormData>({
    name: "",
    placement: initialPlacement,
    link_url: "",
    title: "",
    description: "",
    cta: "",
    color_font: "#000000",
    coordinates: "4-4",
    coordinates_mobile: "4-4",
    category_id: "",
    subcategory_id: "none",
  });

  const [existingUrls, setExistingUrls] = useState<ExistingMediaUrls>({});

  // Cargar banner existente si estamos en modo edición
  useEffect(() => {
    if (mode === "edit" && bannerId) {
      const fetchBanner = async () => {
        try {
          const formData = new FormData();
          formData.append("id", bannerId);

          const response = await bannerEndpoints.update(formData);

          if (response.success && response.data) {
            const banner = response.data;

            // Guardar URLs existentes
            setExistingUrls({
              desktop_image_url: banner.desktop_image_url,
              desktop_video_url: banner.desktop_video_url,
              mobile_image_url: banner.mobile_image_url,
              mobile_video_url: banner.mobile_video_url,
            });

            // Parsear placement para extraer category_id y subcategory_id
            // Formato: "banner-{categoria}" o "banner-{categoria}-{subcategoria}"
            let parsedCategoryId = "";
            let parsedSubcategoryId = "none";

            if (banner.placement?.startsWith("banner-")) {
              // Usar optional chaining para evitar warnings y manejar undefined de forma segura
              const parts = banner.placement?.replace("banner-", "")?.split("-") ?? [];
              // El primer elemento es el nombre de la categoría
              if (parts.length > 0) parsedCategoryId = parts[0];
              // Si hay más elementos, los demás son la subcategoría (unidos por -)
              if (parts.length > 1) parsedSubcategoryId = parts.slice(1).join("-");
            }

            console.log("Banner cargado del backend:", {
              placement: banner.placement,
              parsedCategoryName: parsedCategoryId,
              parsedSubcategoryName: parsedSubcategoryId,
            });

            // Cargar datos del formulario
            setFormData({
              name: banner.name || "",
              placement: banner.placement || "home",
              link_url: banner.link_url || "",
              title: banner.title || "",
              description: banner.description || "",
              cta: banner.cta || "",
              color_font: banner.color_font || "#000000",
              coordinates: banner.coordinates || "4-4",
              coordinates_mobile: banner.coordinates_mobile || "4-4",
              category_id: parsedCategoryId,
              subcategory_id: parsedSubcategoryId,
            });
          } else {
            alert("No se pudo cargar el banner");
            router.push("/marketing/banners");
          }
        } catch (error) {
          console.error("Error loading banner:", error);
          alert("Error al cargar el banner");
          router.push("/marketing/banners");
        } finally {
          setIsFetching(false);
        }
      };

      fetchBanner();
    }
  }, [mode, bannerId, router]);

  // Handlers
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

  // Validación
  const validate = (): boolean => {
    if (!formData.name) {
      alert("El nombre del banner es obligatorio");
      return false;
    }
    return true;
  };

  // Envío del formulario
  const handleSubmit = async (status: "draft" | "active") => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const fields: BannerFormFields = {
        name: formData.name,
        placement: formData.placement,
        link_url: formData.link_url,
        title: formData.title,
        description: formData.description,
        cta: formData.cta,
        color_font: formData.color_font,
        coordinates: formData.coordinates,
        coordinates_mobile: formData.coordinates_mobile,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id === "none" ? "" : formData.subcategory_id,
      };

      const files: BannerMediaFiles = {
        desktop_image: formData.desktop_image,
        desktop_video: formData.desktop_video,
        mobile_image: formData.mobile_image,
        mobile_video: formData.mobile_video,
      };

      let response;

      if (mode === "create") {
        const data = buildCreateBannerFormData(fields, files, status);
        response = await bannerEndpoints.create(data);
      } else {
        if (!bannerId) throw new Error("Banner ID is required for edit mode");
        const data = buildUpdateBannerFormData(bannerId, fields, files, existingUrls, status);
        response = await bannerEndpoints.update(data);
      }

      if (response.success) {
        router.push("/marketing/banners");
      } else {
        const action = status === "draft" ? "guardar" : "publicar";
        alert(response.message || `Error al ${action} el banner`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
      console.error("Error submitting banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    existingUrls,
    isLoading,
    isFetching,
    handleFieldChange,
    handleFileChange,
    handleCoordinatesChange,
    handleCoordinatesMobileChange,
    handleSubmit,
  };
}
