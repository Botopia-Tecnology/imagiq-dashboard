import { useState } from "react";
import { bannerEndpoints } from "@/lib/api";
import type { BackendBanner } from "@/types/banner";

interface UseBannerTableActionsOptions {
  onSuccess?: () => void;
}

/**
 * Hook personalizado para manejar las acciones de la tabla de banners
 * - Eliminación individual
 * - Eliminación masiva
 * - Cambio de estado
 */
export function useBannerTableActions({ onSuccess }: UseBannerTableActionsOptions = {}) {
  const [bannerToDelete, setBannerToDelete] = useState<BackendBanner | null>(null);
  const [bannersToDelete, setBannersToDelete] = useState<BackendBanner[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Construye FormData para actualizar el estado de un banner
   * Mantiene todos los campos existentes
   */
  const buildStatusUpdateFormData = (
    banner: BackendBanner,
    newStatus: "active" | "inactive"
  ): FormData => {
    const formData = new FormData();
    formData.append("id", banner.id);
    formData.append("name", banner.name);
    formData.append("placement", banner.placement);
    formData.append("status", newStatus);

    // Agregar campos opcionales
    if (banner.link_url) formData.append("link_url", banner.link_url);
    if (banner.title) formData.append("title", banner.title);
    if (banner.description) formData.append("description", banner.description);
    if (banner.cta) formData.append("cta", banner.cta);
    if (banner.color_font) formData.append("color_font", banner.color_font);
    if (banner.coordinates) formData.append("coordinates", banner.coordinates);
    if (banner.coordinates_mobile)
      formData.append("coordinates_mobile", banner.coordinates_mobile);

    // Mantener las URLs de archivos existentes
    if (banner.desktop_image_url)
      formData.append("desktop_image_url", banner.desktop_image_url);
    if (banner.mobile_image_url) formData.append("mobile_image_url", banner.mobile_image_url);
    if (banner.desktop_video_url)
      formData.append("desktop_video_url", banner.desktop_video_url);
    if (banner.mobile_video_url)
      formData.append("mobile_video_url", banner.mobile_video_url);

    return formData;
  };

  /**
   * Cambia el estado de un banner (active/inactive)
   */
  const handleStatusChange = async (banner: BackendBanner, newStatus: "active" | "inactive") => {
    try {
      const formData = buildStatusUpdateFormData(banner, newStatus);
      const response = await bannerEndpoints.update(formData);

      if (response.success) {
        onSuccess?.();
      } else {
        alert(response.message || "Error al actualizar el estado del banner");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
      console.error("Error updating banner status:", error);
    }
  };

  /**
   * Abre el diálogo para confirmar eliminación individual
   */
  const handleDelete = (banner: BackendBanner) => {
    setBannerToDelete(banner);
  };

  /**
   * Confirma y ejecuta la eliminación individual
   */
  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await bannerEndpoints.delete(bannerToDelete.id);
      if (response.success) {
        onSuccess?.();
        setBannerToDelete(null);
      } else {
        alert(response.message || "Error al eliminar el banner");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
      console.error("Error deleting banner:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Abre el diálogo para confirmar eliminación masiva
   */
  const handleBulkDelete = (banners: BackendBanner[]) => {
    setBannersToDelete(banners);
  };

  /**
   * Confirma y ejecuta la eliminación masiva
   */
  const confirmBulkDelete = async () => {
    if (bannersToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const deletePromises = bannersToDelete.map((banner) => bannerEndpoints.delete(banner.id));

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        onSuccess?.();
        setBannersToDelete([]);
      } else {
        const failedCount = results.filter((r) => !r.success).length;
        alert(`Se eliminaron ${results.length - failedCount} de ${results.length} banners`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
      console.error("Error deleting banners:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancela la eliminación individual
   */
  const cancelDelete = () => {
    setBannerToDelete(null);
  };

  /**
   * Cancela la eliminación masiva
   */
  const cancelBulkDelete = () => {
    setBannersToDelete([]);
  };

  return {
    // Estado
    bannerToDelete,
    bannersToDelete,
    isDeleting,

    // Acciones
    handleStatusChange,
    handleDelete,
    handleBulkDelete,
    confirmDelete,
    confirmBulkDelete,
    cancelDelete,
    cancelBulkDelete,
  };
}
