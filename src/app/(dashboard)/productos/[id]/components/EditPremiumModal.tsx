"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, Trash2, Image as ImageIcon, Video, GripVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"
import { toast } from "sonner"
import * as multimediaApi from "@/lib/api/multimedia-premium"

interface EditPremiumModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductCardProps
  selectedColor: ProductColor | null
}

export function EditPremiumModal({
  isOpen,
  onClose,
  product,
  selectedColor,
}: EditPremiumModalProps) {
  // Estados para videos de carrusel
  const [carouselVideos, setCarouselVideos] = useState<string[]>([])
  const [carouselVideoFiles, setCarouselVideoFiles] = useState<File[]>([])

  // Estados para imágenes de carrusel (todas excepto la última)
  const [carouselImages, setCarouselImages] = useState<(string | File)[]>([])
  const [deletedCarouselImages, setDeletedCarouselImages] = useState<string[]>([])
  const [deletedCarouselVideos, setDeletedCarouselVideos] = useState<string[]>([])

  // Estado para imagen premium del dispositivo (última imagen)
  const [deviceImage, setDeviceImage] = useState<string | null>(null)
  const [deviceImageFile, setDeviceImageFile] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Cargar contenido premium existente cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !selectedColor) return

    // ✅ NUEVA ARQUITECTURA SIMPLIFICADA
    // 1. Videos del CARRUSEL (array simple)
    if (selectedColor.premiumVideos && selectedColor.premiumVideos.length > 0) {
      setCarouselVideos(selectedColor.premiumVideos)
    } else {
      setCarouselVideos([])
    }

    // 2. Imágenes del CARRUSEL (array simple, sin marcadores especiales)
    if (selectedColor.premiumImages && selectedColor.premiumImages.length > 0) {
      setCarouselImages(selectedColor.premiumImages)
    } else {
      setCarouselImages([])
    }

    // 3. Imagen premium del DISPOSITIVO (string | null)
    if (selectedColor.devicePremiumImage) {
      setDeviceImage(selectedColor.devicePremiumImage)
    } else {
      setDeviceImage(null)
    }

    // Resetear archivos nuevos y eliminaciones pendientes
    setDeviceImageFile(null)
    setCarouselVideoFiles([])
    setDeletedCarouselImages([])
    setDeletedCarouselVideos([])
  }, [isOpen, selectedColor])

  // Manejadores para videos de carrusel
  const handleCarouselVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files)

      // Validar que todos sean videos
      const invalidFiles = filesArray.filter(file => !file.type.startsWith('video/'))
      if (invalidFiles.length > 0) {
        toast.error("Solo se permiten archivos de video")
        return
      }

      setCarouselVideoFiles((prev) => [...prev, ...filesArray])

      const newVideos: string[] = []
      filesArray.forEach((file) => {
        const url = URL.createObjectURL(file)
        newVideos.push(url)
      })
      setCarouselVideos((prev) => [...prev, ...newVideos])
    }
  }

  const removeCarouselVideo = (index: number) => {
    const videoUrl = carouselVideos[index]

    // Si es una URL existente (no un archivo nuevo), agregar a la lista de eliminados
    // La eliminación real se hará al guardar cambios
    if (typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
      setDeletedCarouselVideos((prev) => {
        if (!prev.includes(videoUrl)) {
          return [...prev, videoUrl]
        }
        return prev
      })
    }

    // Eliminar del estado local (la eliminación del backend se hará al guardar)
    setCarouselVideos((prev) => prev.filter((_, i) => i !== index))
    setCarouselVideoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Manejadores para imágenes de carrusel
  const handleCarouselImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files)

      // Validar que todos sean imágenes
      const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        toast.error("Solo se permiten archivos de imagen")
        return
      }

      // Validar tamaño máximo (10MB por imagen)
      const maxSize = 10 * 1024 * 1024 // 10MB
      const oversizedFiles = filesArray.filter(file => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        toast.error(`Algunas imágenes exceden el tamaño máximo de 10MB`)
        return
      }

      setCarouselImages((prev) => [...prev, ...filesArray])
    }
  }

  const removeCarouselImage = (index: number) => {
    const imageItem = carouselImages[index]

    // Si es una URL existente (no un archivo nuevo), agregar a la lista de eliminadas
    // La eliminación real se hará al guardar cambios
    if (typeof imageItem === 'string' && imageItem.startsWith('http')) {
      setDeletedCarouselImages((prev) => {
        if (!prev.includes(imageItem)) {
          return [...prev, imageItem]
        }
        return prev
      })
    }

    // Eliminar del estado local (la eliminación del backend se hará al guardar)
    setCarouselImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag and drop para reordenar imágenes de carrusel
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...carouselImages]
    const draggedItem = newImages[draggedIndex]

    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)

    setCarouselImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Manejadores para imagen premium del dispositivo
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error("Solo se permiten archivos de imagen")
        return
      }

      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error("La imagen no puede ser mayor a 10MB")
        return
      }

      setDeviceImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDeviceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteDeviceImage = () => {
    if (!selectedColor) return

    // Marcar la imagen premium para eliminación
    // La eliminación real se hará al guardar cambios
    // Si es una URL existente, se marcará para eliminación en handleSave
    if (deviceImage && deviceImage.startsWith('http')) {
      // Simplemente eliminar del estado local, la eliminación del backend se hará al guardar
      setDeviceImage(null)
      setDeviceImageFile(null)
      // No mostrar toast aquí, se mostrará después de guardar
    } else if (deviceImageFile) {
      // Si es un archivo nuevo que no se ha subido, simplemente eliminarlo del estado
    setDeviceImage(null)
    setDeviceImageFile(null)
    }
  }

  // Obtener todos los SKUs del producto (para carrusel - videos e imágenes)
  const getAllSkus = (): string[] => {
    return product.colors.map(color => color.sku).filter(Boolean)
  }

  // Obtener todos los SKUs del mismo color (para imagen premium del dispositivo)
  const getSkusByColor = (): string[] => {
    if (!selectedColor) return []
    // Filtrar todos los colores que tengan el mismo hex (mismo color)
    return product.colors
      .filter(color => color.hex === selectedColor.hex)
      .map(color => color.sku)
      .filter(Boolean)
  }

  // Función para subir videos de carrusel (aplica a todos los SKUs)
  // NOTA: Esta función se llama desde handleSave, no inmediatamente
  const uploadCarouselVideos = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) return true

    const skus = getAllSkus()

    try {
      const result = await multimediaApi.uploadCarouselVideos(skus, files)

      if (!result.success) {
        toast.error(result.message || 'Error al subir videos')
        return false
      }

      // NOTA: No mostrar toast aquí, se mostrará al final si todo fue exitoso
      return true
    } catch (error) {
      console.error('Error uploading carousel videos:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir videos')
      return false
    }
  }

  // Función para subir imágenes de carrusel (aplica a todos los SKUs, mantiene última imagen)
  // NOTA: Esta función se llama desde handleSave, no inmediatamente
  const uploadCarouselImages = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) return true

    const skus = getAllSkus()

    try {
      const result = await multimediaApi.uploadCarouselImages(skus, files)

      if (!result.success) {
        toast.error(result.message || 'Error al subir imágenes')
        return false
      }

      // NOTA: El backend debería devolver el array actualizado con las nuevas URLs
      // Por ahora, confiamos en que el backend agregue las imágenes correctamente
      // No mostrar toast aquí, se mostrará al final si todo fue exitoso
      return true
    } catch (error) {
      console.error('Error uploading carousel images:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes')
      return false
    }
  }

  // Función para subir imagen del dispositivo (aplica a todos los SKUs del mismo color)
  // NOTA: Esta función se llama desde handleSave, no inmediatamente
  const uploadDeviceImage = async (file: File): Promise<boolean> => {
    if (!selectedColor) return false

    const skusByColor = getSkusByColor()
    if (skusByColor.length === 0) {
      toast.error('No se encontraron SKUs para este color')
      return false
    }

    try {
      const result = await multimediaApi.uploadDeviceImageForColor(skusByColor, file)

      if (!result.success) {
        toast.error(result.message || 'Error al subir imagen del dispositivo')
        return false
      }

      // NOTA: El backend debería devolver la nueva URL de la imagen premium
      // Por ahora, confiamos en que el backend la agregue correctamente al final del array
      // No mostrar toast aquí, se mostrará al final si todo fue exitoso
      return true
    } catch (error) {
      console.error('Error uploading device image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen del dispositivo')
      return false
    }
  }

  // Función para reordenar imágenes de carrusel (aplica a todos los SKUs)
  const reorderCarouselImages = async (imageUrls: string[]): Promise<boolean> => {
    const skus = getAllSkus()

    try {
      const result = await multimediaApi.reorderCarouselImages(skus, imageUrls)

      // El backend valida que el reorden mantenga la imagen del dispositivo en la última posición
      if (!result.success) {
        toast.error(result.message || 'Error al reordenar imágenes')
        return false
      }

      return true
    } catch (error) {
      console.error('Error reordering carousel images:', error)
      toast.error(error instanceof Error ? error.message : 'Error al reordenar imágenes')
      return false
    }
  }

  const handleSave = async () => {
    if (!selectedColor) {
      toast.error("No se ha seleccionado un color")
      return
    }

    setIsLoading(true)

    try {
      let hasErrors = false
      const skus = getAllSkus()
      const skusByColor = getSkusByColor()

      // ========================================================================
      // ORDEN DE OPERACIONES AL GUARDAR (CRÍTICO):
      // 1. PRIMERO: CREAR/SUBIR todo (nuevos archivos)
      // 2. SEGUNDO: REORDENAR (actualizar orden)
      // 3. TERCERO: ELIMINAR (eliminar lo que el usuario borró)
      // ========================================================================

      // ==================== PASO 1: CREAR/SUBIR TODO ====================
      // Subir nuevos archivos primero para tener las URLs disponibles
      // NOTA: Las nuevas URLs se obtendrán después de subir, pero por ahora
      // construimos el array final basándonos en el estado local

      // 1.1. Subir videos de carrusel (nuevos)
      const newVideoFiles = carouselVideoFiles.filter(file => file instanceof File)
      if (newVideoFiles.length > 0) {
        const result = await uploadCarouselVideos(newVideoFiles)
        if (!result) hasErrors = true
        // NOTA: El backend debería devolver las nuevas URLs de videos, pero por ahora
        // confiamos en que el backend las agregue correctamente
      }

      // 1.2. Subir imágenes de carrusel (nuevas)
      // ✅ NUEVA ARQUITECTURA: imagen_premium contiene SOLO imágenes del carrusel
      // - NO incluye la imagen del dispositivo (se maneja en imagen_final_premium)
      // - Array simple de strings (sin marcadores especiales)
      const newImageFiles = carouselImages.filter(img => img instanceof File) as File[]
      if (newImageFiles.length > 0) {
        const result = await uploadCarouselImages(newImageFiles)
        if (!result) hasErrors = true
      }

      // 1.3. Subir/actualizar imagen premium del dispositivo (si es nueva o cambiada)
      // ✅ NUEVA ARQUITECTURA: Se guarda en imagen_final_premium (campo separado)
      // - NO afecta imagen_premium (carrusel)
      // - Se aplica a todos los SKUs del mismo color
      if (deviceImageFile) {
        const result = await uploadDeviceImage(deviceImageFile)
        if (!result) hasErrors = true
      }

      // ==================== PASO 2: REORDENAR ====================
      // ✅ NUEVA ARQUITECTURA SIMPLIFICADA:
      // - imagen_premium: SOLO imágenes del carrusel (array simple)
      // - imagen_final_premium: imagen del dispositivo (string | null, se maneja separado)
      // - video_premium: videos del carrusel (array simple)
      
      // Construir el array final SOLO con imágenes del carrusel
      // NO incluye la imagen del dispositivo (se maneja en imagen_final_premium)
      const currentCarouselImageUrls = carouselImages
        .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
        .filter(img => !deletedCarouselImages.includes(img))
      
      // Verificar si el orden cambió comparado con el original
      const originalCarouselImages = selectedColor.premiumImages || []
      const orderChanged = JSON.stringify(currentCarouselImageUrls) !== JSON.stringify(originalCarouselImages)
      
      // Solo reordenar si hay cambios
      if (orderChanged) {
        const success = await reorderCarouselImages(currentCarouselImageUrls)
        if (!success) hasErrors = true
      }

      // ==================== PASO 3: ELIMINAR ====================
      // Por último, eliminar lo que el usuario borró
      // IMPORTANTE: Las eliminaciones se hacen DESPUÉS de crear y reordenar
      
      // 3.1. Eliminar imagen premium del dispositivo SI el usuario la eliminó
      // ✅ NUEVA ARQUITECTURA: imagen_final_premium es un campo separado
      const hadDeviceImage = selectedColor.devicePremiumImage !== null && selectedColor.devicePremiumImage !== undefined
      const hasDeviceImageNow = deviceImage !== null && deviceImage !== undefined
      const isUploadingNewDevice = deviceImageFile !== null
      
      // Si había imagen del dispositivo y ahora no hay (y no se está subiendo una nueva), eliminarla
      if (hadDeviceImage && !hasDeviceImageNow && !isUploadingNewDevice) {
        try {
          // ✅ Elimina SOLO imagen_final_premium (la pone en null)
          // NO afecta imagen_premium (carrusel)
          const result = await multimediaApi.deleteDeviceImageForColor(skusByColor, [])
          
          if (!result.success) {
            toast.error(`Error al eliminar imagen del dispositivo: ${result.message}`)
            hasErrors = true
          }
        } catch (error) {
          console.error('Error deleting device image:', error)
          toast.error('Error al eliminar imagen del dispositivo')
          hasErrors = true
        }
      }

      // 3.2. Eliminar imágenes de carrusel que el usuario borró
      // ✅ NUEVA ARQUITECTURA: imagen_premium contiene SOLO imágenes del carrusel
      if (deletedCarouselImages.length > 0) {
        // Construir el array final SOLO con imágenes del carrusel (sin imagen del dispositivo)
        const finalArray = carouselImages
          .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
          .filter(img => !deletedCarouselImages.includes(img))

        // Eliminar cada imagen del carrusel
        for (const imageUrl of deletedCarouselImages) {
          try {
            // Enviar el array actualizado (SOLO carrusel) al backend
            const result = await multimediaApi.deleteCarouselImage(skus, imageUrl, finalArray)
            if (!result.success) {
              toast.error(`Error al eliminar imagen de carrusel: ${result.message}`)
              hasErrors = true
            }
          } catch (error) {
            console.error('Error deleting carousel image:', error)
            toast.error('Error al eliminar imagen de carrusel')
            hasErrors = true
          }
        }
      }

      // 3.3. Eliminar videos de carrusel que el usuario borró
      if (deletedCarouselVideos.length > 0) {
        for (const videoUrl of deletedCarouselVideos) {
          try {
            const result = await multimediaApi.deleteCarouselVideo(skus, videoUrl)
            if (!result.success) {
              toast.error(`Error al eliminar video: ${result.message}`)
              hasErrors = true
            }
            // NOTA: No mostrar toast de éxito individual, se mostrará al final si todo fue exitoso
          } catch (error) {
            console.error('Error deleting video:', error)
            toast.error('Error al eliminar video')
            hasErrors = true
          }
        }
      }

      if (!hasErrors) {
        toast.success("Contenido premium guardado exitosamente")

        // Asegurar que el modo premium esté activado en localStorage antes de recargar
        if (typeof window !== 'undefined') {
          localStorage.setItem('isPremiumMode', 'true')
        }

        onClose()
        // Recargar la página para ver los cambios
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        toast.warning("Algunos cambios no se guardaron correctamente")
      }
    } catch (error) {
      console.error("Error al guardar contenido premium:", error)
      toast.error("Error inesperado al guardar contenido premium")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contenido Premium</DialogTitle>
          <DialogDescription>
            Gestiona videos, imágenes del carrusel y la imagen premium de {product.name}
            {selectedColor && ` - ${selectedColor.label}`}
            <br />
            <span className="text-xs">
              <strong>Carrusel:</strong> Se aplica a todos los SKUs del producto ({getAllSkus().length} SKU(s)).{' '}
              <strong>Imagen Premium:</strong> Se aplica a todos los SKUs del mismo color ({getSkusByColor().length} SKU(s)).
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="carousel-images" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="carousel-images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imágenes Carrusel
            </TabsTrigger>
            <TabsTrigger value="carousel-videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos Carrusel
            </TabsTrigger>
            <TabsTrigger value="device-image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagen Premium
            </TabsTrigger>
          </TabsList>

          {/* Tab de Imágenes de Carrusel */}
          <TabsContent value="carousel-images" className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Imágenes del Carrusel Premium</Label>
                <span className="text-xs text-muted-foreground">{carouselImages.length} imagen(es)</span>
              </div>

              {/* Grid de imágenes */}
              {carouselImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {carouselImages.map((imageItem, index) => {
                    const displayUrl = imageItem instanceof File
                      ? URL.createObjectURL(imageItem)
                      : imageItem

                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                      >
                        <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-muted">
                          <Image
                            src={displayUrl}
                            alt={`Carrusel ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Icono de arrastrar */}
                        <div className="absolute top-2 left-2 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-white" />
                        </div>

                        {/* Botón eliminar */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeCarouselImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Número de posición */}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Botón para agregar más imágenes */}
              <div className="space-y-3">
                <input
                  type="file"
                  id="carousel-images-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleCarouselImagesUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("carousel-images-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Agregar imágenes al carrusel
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Estas imágenes se mostrarán en el carrusel premium junto con los videos para todos los SKUs del producto ({getAllSkus().length} SKU(s)). Puedes reordenarlas arrastrándolas.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab de Videos de Carrusel */}
          <TabsContent value="carousel-videos" className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Videos del Carrusel Premium</Label>
                <span className="text-xs text-muted-foreground">{carouselVideos.length} video(s)</span>
              </div>

              {/* Grid de videos */}
              {carouselVideos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {carouselVideos.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-muted">
                        <video
                          src={url}
                          className="w-full h-full object-contain"
                          controls
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeCarouselVideo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para agregar videos */}
              <div className="space-y-3">
                <input
                  type="file"
                  id="carousel-video-upload"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleCarouselVideoUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("carousel-video-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Agregar videos al carrusel
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Los videos siempre aparecen primero en el carrusel premium, antes que las imágenes. Se aplican a todos los SKUs del producto ({getAllSkus().length} SKU(s)).
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab de Imagen Premium del Dispositivo */}
          <TabsContent value="device-image" className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Imagen Premium del Dispositivo</Label>
                <span className="text-xs text-muted-foreground">Una sola imagen</span>
              </div>

              {deviceImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-64 rounded-lg border overflow-hidden bg-muted">
                    <Image
                      src={deviceImage}
                      alt="Imagen Premium del Dispositivo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDeleteDeviceImage}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar imagen premium
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    id="device-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDeviceImageUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("device-image-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir imagen premium
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Esta es la imagen destacada del dispositivo que se muestra separada del carrusel. Se aplica a todos los SKUs del mismo color ({getSkusByColor().length} SKU(s)).
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
