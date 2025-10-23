/**
 * Utilidades para manejo de imágenes
 */

const MOCK_IMAGE_URL = "https://example.com/mock-image.jpg";

/**
 * Verifica si una imagen es válida (no es la URL de ejemplo)
 */
export const isValidImage = (imageUrl: string | null | undefined): boolean => {
  return !!(imageUrl && imageUrl !== MOCK_IMAGE_URL && imageUrl.trim() !== "");
};

/**
 * Obtiene la URL de imagen por defecto (cadena vacía en lugar de URL de ejemplo)
 */
export const getDefaultImageUrl = (): string => {
  return "";
};

/**
 * Verifica si una imagen es la URL de ejemplo
 */
export const isMockImage = (imageUrl: string | null | undefined): boolean => {
  return imageUrl === MOCK_IMAGE_URL;
};
