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

  // Estado para imagen premium del dispositivo (última imagen)
  const [deviceImage, setDeviceImage] = useState<string | null>(null)
  const [deviceImageFile, setDeviceImageFile] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Cargar contenido premium existente cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !selectedColor) return

    // Cargar videos premium
    if (selectedColor.premiumVideos && selectedColor.premiumVideos.length > 0) {
      setCarouselVideos(selectedColor.premiumVideos)
    } else {
      setCarouselVideos([])
    }

    // Cargar imágenes premium
    if (selectedColor.premiumImages && selectedColor.premiumImages.length > 0) {
      // Todas las imágenes excepto la última van al carrusel
      const imagesForCarousel = selectedColor.premiumImages.slice(0, -1)
      setCarouselImages(imagesForCarousel)

      // La última imagen es la imagen del dispositivo
      const lastImage = selectedColor.premiumImages[selectedColor.premiumImages.length - 1]
      setDeviceImage(lastImage)
    } else {
      setCarouselImages([])
      setDeviceImage(null)
    }

    setDeviceImageFile(null)
    setCarouselVideoFiles([])
    setDeletedCarouselImages([])
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

  const removeCarouselVideo = async (index: number) => {
    const videoUrl = carouselVideos[index]

    // Si es una URL existente (no un archivo nuevo), eliminar del backend
    if (typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
      const skus = getAllSkus()

      try {
        const result = await multimediaApi.deleteCarouselVideo(skus, videoUrl)

        // El backend permite eliminar videos, dejando el array vacío si es necesario
        if (!result.success) {
          toast.error(result.message || 'Error al eliminar video')
          return
        }

        toast.success('Video eliminado de todos los SKUs')
      } catch (error) {
        console.error('Error deleting video:', error)
        toast.error(error instanceof Error ? error.message : 'Error al eliminar video')
        return
      }
    }

    // Eliminar del estado local
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

  const removeCarouselImage = async (index: number) => {
    const imageItem = carouselImages[index]

    // Si es una URL existente (no un archivo nuevo), agregar a la lista de eliminadas
    if (typeof imageItem === 'string' && imageItem.startsWith('http')) {
      setDeletedCarouselImages((prev) => [...prev, imageItem])
    }

    // Eliminar del estado local (el DELETE real se hará al guardar)
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

  const handleDeleteDeviceImage = async () => {
    if (!selectedColor) return

    // Si es una URL existente, eliminar del backend
    if (deviceImage && deviceImage.startsWith('http')) {
      try {
        const result = await multimediaApi.deleteDeviceImage(selectedColor.sku)

        // El backend permite eliminar la imagen del dispositivo dejando el array vacío o con solo imágenes de carrusel
        if (!result.success) {
          toast.error(result.message || 'Error al eliminar imagen del dispositivo')
          return
        }

        toast.success('Imagen del dispositivo eliminada')
      } catch (error) {
        console.error('Error deleting device image:', error)
        toast.error(error instanceof Error ? error.message : 'Error al eliminar imagen')
        return
      }
    }

    // Eliminar del estado local
    setDeviceImage(null)
    setDeviceImageFile(null)
  }

  // Obtener todos los SKUs del producto
  const getAllSkus = (): string[] => {
    return product.colors.map(color => color.sku).filter(Boolean)
  }

  // Función para subir videos de carrusel (aplica a todos los SKUs)
  const uploadCarouselVideos = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) return true

    const skus = getAllSkus()

    try {
      const result = await multimediaApi.uploadCarouselVideos(skus, files)

      // El backend maneja videos para arrays vacíos o con contenido existente
      if (!result.success) {
        toast.error(result.message || 'Error al subir videos')
        return false
      }

      toast.success(`${files.length} video(s) de carrusel subido(s) a todos los SKUs`)
      return true
    } catch (error) {
      console.error('Error uploading carousel videos:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir videos')
      return false
    }
  }

  // Función para subir imágenes de carrusel (aplica a todos los SKUs, mantiene última imagen)
  const uploadCarouselImages = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) return true

    const skus = getAllSkus()

    try {
      const result = await multimediaApi.uploadCarouselImages(skus, files)

      // El backend maneja keepLastImage: true para arrays con 0, 1, o N elementos
      // - Si array está vacío: agrega las nuevas imágenes
      // - Si array tiene 1 elemento (solo imagen dispositivo): mantiene esa última, agrega las nuevas antes
      // - Si array tiene N elementos: mantiene la última, reemplaza/agrega las demás
      if (!result.success) {
        toast.error(result.message || 'Error al subir imágenes')
        return false
      }

      toast.success(`${files.length} imagen(es) de carrusel subida(s) a todos los SKUs`)
      return true
    } catch (error) {
      console.error('Error uploading carousel images:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes')
      return false
    }
  }

  // Función para subir imagen del dispositivo (específica para el SKU seleccionado)
  const uploadDeviceImage = async (file: File): Promise<boolean> => {
    if (!selectedColor) return false

    try {
      const result = await multimediaApi.uploadDeviceImage(selectedColor.sku, file)

      // La imagen del dispositivo es específica para cada SKU/color
      // Se agrega/actualiza en la última posición del array imagen_premium
      if (!result.success) {
        toast.error(result.message || 'Error al subir imagen del dispositivo')
        return false
      }

      toast.success('Imagen del dispositivo actualizada para este color')
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

      // PASO 1: Eliminar imágenes de carrusel que el usuario borró
      if (deletedCarouselImages.length > 0) {
        for (const imageUrl of deletedCarouselImages) {
          try {
            const result = await multimediaApi.deleteCarouselImage(skus, imageUrl)
            if (!result.success) {
              toast.error(`Error al eliminar imagen: ${result.message}`)
              hasErrors = true
            }
          } catch (error) {
            console.error('Error deleting image:', error)
            toast.error('Error al eliminar imagen')
            hasErrors = true
          }
        }
      }

      // PASO 2: Subir videos de carrusel (nuevos)
      const newVideoFiles = carouselVideoFiles.filter(file => file instanceof File)
      if (newVideoFiles.length > 0) {
        const success = await uploadCarouselVideos(newVideoFiles)
        if (!success) hasErrors = true
      }

      // PASO 3: Subir imágenes de carrusel (nuevas)
      const newImageFiles = carouselImages.filter(img => img instanceof File) as File[]
      if (newImageFiles.length > 0) {
        const success = await uploadCarouselImages(newImageFiles)
        if (!success) hasErrors = true
      }

      // PASO 4: Subir imagen del dispositivo (si es nueva)
      if (deviceImageFile) {
        const success = await uploadDeviceImage(deviceImageFile)
        if (!success) hasErrors = true
      }

      // PASO 5: Reordenar imágenes de carrusel si cambió el orden
      // Nota: Solo enviar URLs existentes (no archivos nuevos que ya se subieron)
      const existingImageUrls = carouselImages.filter(img => typeof img === 'string') as string[]
      const originalImageUrls = selectedColor.premiumImages?.slice(0, -1) || []

      // Verificar si el orden cambió
      const orderChanged = JSON.stringify(existingImageUrls) !== JSON.stringify(originalImageUrls)
      if (orderChanged && existingImageUrls.length > 0) {
        const success = await reorderCarouselImages(existingImageUrls)
        if (!success) hasErrors = true
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
                  Estas imágenes se mostrarán en el carrusel premium junto con los videos. Puedes reordenarlas arrastrándolas.
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
                  Los videos siempre aparecen primero en el carrusel premium, antes que las imágenes.
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
                    Esta es la imagen destacada del dispositivo que se muestra separada del carrusel.
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
