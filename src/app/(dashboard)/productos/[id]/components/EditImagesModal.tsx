"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, Trash2, Image as ImageIcon, Video, Box, GripVertical } from "lucide-react"
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
import { productEndpoints } from "@/lib/api"
import { toast } from "sonner"

interface EditImagesModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductCardProps
  selectedColor: ProductColor | null
}

export function EditImagesModal({
  isOpen,
  onClose,
  product,
  selectedColor,
}: EditImagesModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null)
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null)

  // Imágenes de detalle: pueden ser URLs (existentes) o archivos (nuevos)
  const [detailImages, setDetailImages] = useState<(string | File)[]>([])
  const [originalDetailUrls, setOriginalDetailUrls] = useState<string[]>([])

  const [videos, setVideos] = useState<string[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [glbFile, setGlbFile] = useState<File | null>(null)
  const [usdzFile, setUsdzFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Estado para drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Cargar multimedia existente cuando se abre el modal
  useEffect(() => {
    const loadExistingMultimedia = async () => {
      if (!isOpen || !selectedColor?.sku) return

      setIsLoadingData(true)
      try {
        const response = await productEndpoints.getMultimedia(selectedColor.sku)

        if (response.success && response.data) {
          // Cargar imagen preview
          if (response.data.image_preview_url) {
            setPreviewImage(response.data.image_preview_url)
            setOriginalPreviewUrl(response.data.image_preview_url)
          }

          // Cargar imágenes de detalle
          if (response.data.image_details_urls && response.data.image_details_urls.length > 0) {
            setDetailImages(response.data.image_details_urls)
            setOriginalDetailUrls(response.data.image_details_urls)
          }

          // Cargar videos
          if (response.data.video_urls && response.data.video_urls.length > 0) {
            setVideos(response.data.video_urls)
          }
        } else {
          // No hay multimedia, resetear estados
          setPreviewImage(null)
          setOriginalPreviewUrl(null)
          setDetailImages([])
          setOriginalDetailUrls([])
        }
      } catch (error) {
        console.error("Error al cargar multimedia:", error)
        toast.error("Error al cargar multimedia existente")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadExistingMultimedia()
  }, [isOpen, selectedColor?.sku])

  const handlePreviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error("Solo se permiten archivos de imagen para la preview")
        return
      }

      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error("La imagen preview no puede ser mayor a 10MB")
        return
      }

      setPreviewImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePreview = () => {
    // Solo eliminar del estado local, no del backend todavía
    setPreviewImage(null)
    setPreviewImageFile(null)
    toast.info("La imagen preview se eliminará al guardar los cambios")
  }

  const handleDetailImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files)
      
      // Validar que todos sean imágenes
      const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        toast.error("Solo se permiten archivos de imagen para las imágenes de detalle")
        return
      }

      // Validar tamaño máximo (10MB por imagen)
      const maxSize = 10 * 1024 * 1024 // 10MB
      const oversizedFiles = filesArray.filter(file => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        toast.error(`Algunas imágenes exceden el tamaño máximo de 10MB`)
        return
      }

      // Agregar archivos directamente al array de imágenes de detalle
      setDetailImages((prev) => [...prev, ...filesArray])
    }
  }

  const removeDetailImage = (index: number) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Funciones de drag and drop para reordenar imágenes
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...detailImages]
    const draggedItem = newImages[draggedIndex]

    // Remover el item de su posición original
    newImages.splice(draggedIndex, 1)
    // Insertarlo en la nueva posición
    newImages.splice(index, 0, draggedItem)

    setDetailImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files)
      setVideoFiles((prev) => [...prev, ...filesArray])

      const newVideos: string[] = []
      filesArray.forEach((file) => {
        const url = URL.createObjectURL(file)
        newVideos.push(url)
      })
      setVideos((prev) => [...prev, ...newVideos])
    }
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
    setVideoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGlbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGlbFile(file)
    }
  }

  const handleUsdzUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUsdzFile(file)
    }
  }

  const handleSave = async () => {
    if (!selectedColor) {
      toast.error("No se ha seleccionado un color")
      return
    }

    setIsLoading(true)

    try {
      let uploadErrors = false

      // 1. Manejar imagen preview
      // Si había una imagen preview original pero ahora está null, eliminarla del backend
      if (originalPreviewUrl && !previewImage && !previewImageFile) {
        toast.info("Eliminando imagen preview...")
        const deleteResponse = await fetch(`/api/products/${product.id}/media/preview`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sku: selectedColor.sku }),
        })

        const deleteData = await deleteResponse.json()

        if (!deleteResponse.ok || !deleteData.success) {
          toast.error(deleteData.message || "Error al eliminar imagen preview")
          uploadErrors = true
        } else {
          toast.success("Imagen preview eliminada")
        }
      }

      // Si hay una nueva imagen preview, subirla
      if (previewImageFile) {
        toast.info("Actualizando imagen preview...")
        const response = await productEndpoints.updateImageAtPosition(
          selectedColor.sku,
          1, // Posición 1 = preview
          previewImageFile
        )

        if (!response.success) {
          toast.error(response.message || "Error al actualizar imagen preview")
          uploadErrors = true
        } else {
          toast.success("Imagen preview actualizada")
        }
      }

      // 2. Eliminar imágenes de detalle que fueron removidas
      const imagenesEliminadas: number[] = []
      
      // Identificar qué imágenes de detalle fueron eliminadas
      originalDetailUrls.forEach((originalUrl, index) => {
        // Verificar si esta URL original todavía existe en detailImages
        const stillExists = detailImages.some(img => 
          typeof img === 'string' && img === originalUrl
        )
        
        if (!stillExists) {
          // Esta imagen fue eliminada, agregar su número de posición
          imagenesEliminadas.push(index + 2) // +2 porque posición 1 es preview
        }
      })

      // Eliminar las imágenes de detalle del backend si hay alguna
      if (imagenesEliminadas.length > 0) {
        toast.info(`Eliminando ${imagenesEliminadas.length} imagen(es) de detalle...`)
        const deleteResponse = await productEndpoints.deleteDetailImages(
          selectedColor.sku,
          imagenesEliminadas
        )

        if (!deleteResponse.success) {
          toast.error(deleteResponse.message || "Error al eliminar imágenes de detalle")
          uploadErrors = true
        } else {
          toast.success(`${imagenesEliminadas.length} imagen(es) de detalle eliminada(s)`)
        }
      }

      // 3. Procesar imágenes de detalle manteniendo el orden
      // Primero, subir TODAS las imágenes nuevas (Files)
      const uploadedUrlsMap = new Map<number, string>() // índice -> URL subida

      for (let i = 0; i < detailImages.length; i++) {
        const image = detailImages[i]

        if (image instanceof File) {
          const isReplacement = i < originalDetailUrls.length

          if (isReplacement) {
            // Reemplazar imagen existente
            const position = i + 2 // +2 porque posición 1 es preview
            toast.info(`Actualizando imagen en posición ${i + 1}...`)

            const response = await productEndpoints.updateImageAtPosition(
              selectedColor.sku,
              position,
              image
            )

            if (!response.success) {
              toast.error(response.message || `Error al actualizar imagen ${i + 1}`)
              uploadErrors = true
            } else if (response.data?.url) {
              uploadedUrlsMap.set(i, response.data.url)
            }
          }
        }
      }

      // Ahora subir todas las imágenes NUEVAS (que no reemplazan)
      const newFilesWithIndex: { file: File; index: number }[] = []
      for (let i = 0; i < detailImages.length; i++) {
        const image = detailImages[i]
        const isReplacement = i < originalDetailUrls.length

        if (image instanceof File && !isReplacement) {
          newFilesWithIndex.push({ file: image, index: i })
        }
      }

      if (newFilesWithIndex.length > 0) {
        const newFiles = newFilesWithIndex.map(item => item.file)

        if (newFiles.length === 1) {
          // Solo una imagen nueva
          toast.info("Agregando nueva imagen...")
          const response = await productEndpoints.addImage(selectedColor.sku, newFiles[0])

          if (!response.success) {
            toast.error(response.message || "Error al agregar imagen")
            uploadErrors = true
          } else if (response.data?.url) {
            uploadedUrlsMap.set(newFilesWithIndex[0].index, response.data.url)
          }
        } else {
          // Varias imágenes nuevas
          toast.info(`Agregando ${newFiles.length} imágenes nuevas...`)
          const response = await productEndpoints.addMultipleImages(selectedColor.sku, newFiles)

          if (!response.success) {
            toast.error(response.message || "Error al agregar imágenes")
            uploadErrors = true
          } else if (response.data?.urls && Array.isArray(response.data.urls)) {
            // Mapear cada URL subida a su índice original
            response.data.urls.forEach((url: string, idx: number) => {
              uploadedUrlsMap.set(newFilesWithIndex[idx].index, url)
            })
          }
        }
      }

      // Construir el array final en el orden correcto
      const finalImageUrls: string[] = []

      // Primero la preview
      if (previewImage && typeof previewImage === 'string') {
        finalImageUrls.push(previewImage)
      }

      // Luego las imágenes de detalle en el orden actual
      for (let i = 0; i < detailImages.length; i++) {
        const image = detailImages[i]

        if (uploadedUrlsMap.has(i)) {
          // Usar la URL que se subió
          finalImageUrls.push(uploadedUrlsMap.get(i)!)
        } else if (typeof image === 'string') {
          // Es una URL existente
          finalImageUrls.push(image)
        }
      }

      // 4. SIEMPRE reordenar si hay imágenes nuevas o cambió el orden
      const hasNewImages = newFilesWithIndex.length > 0
      const orderChanged = JSON.stringify(finalImageUrls.slice(1)) !== JSON.stringify(originalDetailUrls)

      if ((orderChanged || hasNewImages) && finalImageUrls.length > 1) {
        toast.info("Reordenando imágenes...")
        const response = await productEndpoints.reorderImages(selectedColor.sku, finalImageUrls)

        if (!response.success) {
          toast.error(response.message || "Error al reordenar imágenes")
          uploadErrors = true
        } else {
          toast.success("Imágenes organizadas correctamente")
        }
      }

      // 5. Resultado final
      if (!uploadErrors) {
        toast.success("Multimedia actualizada correctamente")
        onClose()
        // Recargar la página para ver los cambios
        window.location.reload()
      } else {
        toast.warning("Algunos cambios no se guardaron correctamente")
      }
    } catch (error) {
      console.error("Error al actualizar multimedia:", error)
      toast.error("Error inesperado al actualizar multimedia")
    } finally {
      setIsLoading(false)
    }
  }

  const currentPreview = previewImage
  const currentDetails = detailImages

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar multimedia</DialogTitle>
          <DialogDescription>
            Actualiza imágenes, videos y archivos AR para {product.name}
            {selectedColor && ` - ${selectedColor.label}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imágenes
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="ar" className="gap-2">
              <Box className="h-4 w-4" />
              AR
            </TabsTrigger>
          </TabsList>

          {/* Tab de Imágenes */}
          <TabsContent value="images" className="space-y-6 py-4">
          {/* Imagen Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Imagen Preview</Label>
              <span className="text-xs text-muted-foreground">Solo una imagen</span>
            </div>
            {currentPreview ? (
              <div className="space-y-3">
                <div className="relative w-full h-64 rounded-lg border overflow-hidden bg-muted">
                  <Image
                    src={currentPreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleDeletePreview}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar imagen preview
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  id="preview-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePreviewImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("preview-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir imagen preview
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  La imagen preview es la imagen principal del producto que se muestra en listados y vistas generales
                </p>
              </div>
            )}
          </div>

          {/* Imágenes de Detalle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Imágenes de Detalle</Label>
              <span className="text-xs text-muted-foreground">Múltiples imágenes</span>
            </div>

            {/* Grid de imágenes */}
            {currentDetails.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {currentDetails.map((imageItem, index) => {
                  // Determinar la URL a mostrar (File o string)
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
                      className={`relative group cursor-move ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-muted">
                        <Image
                          src={displayUrl}
                          alt={`Detalle ${index + 1}`}
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
                        onClick={() => removeDetailImage(index)}
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
                id="details-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleDetailImagesUpload}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("details-upload")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Agregar imágenes de detalle
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Las imágenes de detalle se muestran en la vista completa del producto. Puedes agregar múltiples imágenes y reordenarlas arrastrándolas.
              </p>
            </div>
          </div>
          </TabsContent>

          {/* Tab de Videos */}
          <TabsContent value="videos" className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Videos del Producto</Label>

              {/* Grid de videos */}
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {videos.map((url, index) => (
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
                        onClick={() => removeVideo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para agregar videos */}
              <div>
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("video-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Agregar videos
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab de AR */}
          <TabsContent value="ar" className="space-y-6 py-4">
            <div className="space-y-6">
              {/* Archivo GLB */}
              <div className="space-y-3">
                <Label>Archivo GLB (Android/Web)</Label>
                <div className="space-y-3">
                  {glbFile && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Box className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{glbFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(glbFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setGlbFile(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <input
                    type="file"
                    id="glb-upload"
                    accept=".glb"
                    className="hidden"
                    onChange={handleGlbUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("glb-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {glbFile ? "Cambiar" : "Subir"} archivo GLB
                  </Button>
                </div>
              </div>

              {/* Archivo USDZ */}
              <div className="space-y-3">
                <Label>Archivo USDZ (iOS)</Label>
                <div className="space-y-3">
                  {usdzFile && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Box className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{usdzFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(usdzFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUsdzFile(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <input
                    type="file"
                    id="usdz-upload"
                    accept=".usdz"
                    className="hidden"
                    onChange={handleUsdzUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("usdz-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {usdzFile ? "Cambiar" : "Subir"} archivo USDZ
                  </Button>
                </div>
              </div>

              {/* Información */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Los archivos GLB se usan para Android y navegadores web,
                  mientras que los archivos USDZ son específicos para dispositivos iOS.
                </p>
              </div>
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
