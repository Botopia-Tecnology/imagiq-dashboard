/**
 * Utilidades para construir FormData de banners
 * Centraliza la lógica de construcción de formularios para crear y editar banners
 */

export interface BannerFormFields {
  name: string;
  placement: string;
  link_url: string;
  title: string;
  description: string;
  cta: string;
  color_font: string;
  coordinates: string;
  coordinates_mobile: string;
}

export interface BannerMediaFiles {
  desktop_image?: File;
  desktop_video?: File;
  mobile_image?: File;
  mobile_video?: File;
}

export interface ExistingMediaUrls {
  desktop_image_url?: string;
  desktop_video_url?: string;
  mobile_image_url?: string;
  mobile_video_url?: string;
}

/**
 * Agrega los campos de texto al FormData
 */
function appendTextFields(
  formData: FormData,
  fields: BannerFormFields,
  status: "draft" | "active",
  bannerId?: string
): void {
  // Si es edición, agregar ID
  if (bannerId) {
    formData.append("id", bannerId);
  }

  // Campos requeridos
  formData.append("name", fields.name);
  formData.append("placement", fields.placement);
  formData.append("status", status);

  // Campos opcionales
  if (fields.link_url) formData.append("link_url", fields.link_url);
  if (fields.title) formData.append("title", fields.title);
  if (fields.description) formData.append("description", fields.description);
  if (fields.cta) formData.append("cta", fields.cta);
  if (fields.color_font) formData.append("color_font", fields.color_font);
  if (fields.coordinates) formData.append("coordinates", fields.coordinates);
  if (fields.coordinates_mobile) formData.append("coordinates_mobile", fields.coordinates_mobile);
}

/**
 * Agrega archivos nuevos al FormData
 * Los archivos se renombran según la convención del backend: "desktop_image", "mobile_image", etc.
 */
function appendNewFiles(formData: FormData, files: BannerMediaFiles): void {
  if (files.desktop_image) {
    const file = new File([files.desktop_image], "desktop_image", {
      type: files.desktop_image.type,
    });
    formData.append("files", file);
  }

  if (files.mobile_image) {
    const file = new File([files.mobile_image], "mobile_image", {
      type: files.mobile_image.type,
    });
    formData.append("files", file);
  }

  if (files.desktop_video) {
    const file = new File([files.desktop_video], "desktop_video", {
      type: files.desktop_video.type,
    });
    formData.append("files", file);
  }

  if (files.mobile_video) {
    const file = new File([files.mobile_video], "mobile_video", {
      type: files.mobile_video.type,
    });
    formData.append("files", file);
  }
}

/**
 * Agrega URLs de medios existentes al FormData (solo para edición)
 * Solo se agregan si NO hay un archivo nuevo para reemplazarlas
 */
function appendExistingUrls(
  formData: FormData,
  files: BannerMediaFiles,
  existingUrls: ExistingMediaUrls
): void {
  // Solo agregar URLs si no hay archivos nuevos que las reemplacen
  if (!files.desktop_image && existingUrls.desktop_image_url) {
    formData.append("desktop_image_url", existingUrls.desktop_image_url);
  }

  if (!files.mobile_image && existingUrls.mobile_image_url) {
    formData.append("mobile_image_url", existingUrls.mobile_image_url);
  }

  if (!files.desktop_video && existingUrls.desktop_video_url) {
    formData.append("desktop_video_url", existingUrls.desktop_video_url);
  }

  if (!files.mobile_video && existingUrls.mobile_video_url) {
    formData.append("mobile_video_url", existingUrls.mobile_video_url);
  }
}

/**
 * Construye el FormData completo para crear un banner
 */
export function buildCreateBannerFormData(
  fields: BannerFormFields,
  files: BannerMediaFiles,
  status: "draft" | "active"
): FormData {
  const formData = new FormData();
  appendTextFields(formData, fields, status);
  appendNewFiles(formData, files);
  return formData;
}

/**
 * Construye el FormData completo para editar un banner
 */
export function buildUpdateBannerFormData(
  bannerId: string,
  fields: BannerFormFields,
  files: BannerMediaFiles,
  existingUrls: ExistingMediaUrls,
  status: "draft" | "active"
): FormData {
  const formData = new FormData();
  appendTextFields(formData, fields, status, bannerId);
  appendExistingUrls(formData, files, existingUrls);
  appendNewFiles(formData, files);
  return formData;
}
