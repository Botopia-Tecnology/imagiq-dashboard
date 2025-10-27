/**
 * API functions para gestión de contenido multimedia premium
 * Maneja videos, imágenes de carrusel e imágenes de dispositivo
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ==================== VIDEOS DE CARRUSEL ====================

/**
 * Subir videos de carrusel para TODOS los SKUs del producto
 * @param skus - Array de SKUs a los que se aplicarán los videos
 * @param files - Archivos de video a subir
 */
export async function uploadCarouselVideos(skus: string[], files: File[]) {
  const formData = new FormData();

  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('skus', JSON.stringify(skus));

  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/carrusel/videos`, {
    method: 'PUT',
    body: formData,
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

/**
 * Eliminar un video de carrusel de TODOS los SKUs especificados
 * @param skus - Array de SKUs de los que se eliminará el video
 * @param videoUrl - URL del video a eliminar
 */
export async function deleteCarouselVideo(skus: string[], videoUrl: string) {
  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/carrusel/video`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skus, videoUrl }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

// ==================== IMÁGENES DE CARRUSEL ====================

/**
 * Subir imágenes de carrusel para TODOS los SKUs del producto
 * Mantiene la última imagen (imagen de dispositivo) intacta
 * @param skus - Array de SKUs a los que se aplicarán las imágenes
 * @param files - Archivos de imagen a subir
 */
export async function uploadCarouselImages(skus: string[], files: File[]) {
  const formData = new FormData();

  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('skus', JSON.stringify(skus));
  formData.append('keepLastImage', 'true');

  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/carrusel/imagenes`, {
    method: 'PUT',
    body: formData,
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

/**
 * Eliminar una imagen de carrusel de TODOS los SKUs especificados
 * Valida que no se elimine la última imagen si hay más de una (imagen dispositivo)
 * @param skus - Array de SKUs de los que se eliminará la imagen
 * @param imageUrl - URL de la imagen a eliminar
 */
export async function deleteCarouselImage(skus: string[], imageUrl: string) {
  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/carrusel/imagen`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skus, imageUrl }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

/**
 * Reordenar imágenes de carrusel para TODOS los SKUs
 * Mantiene la imagen de dispositivo (última posición) intacta
 * @param skus - Array de SKUs en los que se reordenarán las imágenes
 * @param imageUrls - Array de URLs en el nuevo orden deseado
 */
export async function reorderCarouselImages(skus: string[], imageUrls: string[]) {
  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/carrusel/reordenar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skus, imageUrls }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

// ==================== IMAGEN DE DISPOSITIVO ====================

/**
 * Subir imagen de dispositivo para UN SKU específico
 * Se coloca en la última posición del array imagen_premium
 * @param sku - SKU específico al que se aplicará la imagen
 * @param file - Archivo de imagen a subir
 */
export async function uploadDeviceImage(sku: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagen-dispositivo`, {
    method: 'PUT',
    body: formData,
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}

/**
 * Eliminar imagen de dispositivo de UN SKU específico
 * Permite dejar el array vacío o solo con imágenes de carrusel
 * @param sku - SKU del que se eliminará la imagen de dispositivo
 */
export async function deleteDeviceImage(sku: string) {
  const response = await fetch(`${API_BASE_URL}/api/multimedia/producto/${sku}/imagen-dispositivo`, {
    method: 'DELETE',
  });

  const data = await response.json();
  return {
    success: response.ok,
    data,
    message: data.message,
  };
}
