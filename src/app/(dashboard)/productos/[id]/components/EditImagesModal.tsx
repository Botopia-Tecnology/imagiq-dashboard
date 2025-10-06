"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, Trash2, Image as ImageIcon, Video, Box } from "lucide-react"
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
  const [detailImages, setDetailImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [glbFile, setGlbFile] = useState<File | null>(null)
  const [usdzFile, setUsdzFile] = useState<File | null>(null)

  const handlePreviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDetailImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setDetailImages((prev) => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeDetailImage = (index: number) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newVideos: string[] = []
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file)
        newVideos.push(url)
      })
      setVideos((prev) => [...prev, ...newVideos])
    }
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
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

  const handleSave = () => {
    // Aquí implementarías la lógica para guardar las imágenes, videos y archivos AR
    console.log("Preview Image:", previewImage)
    console.log("Detail Images:", detailImages)
    console.log("Videos:", videos)
    console.log("GLB File:", glbFile)
    console.log("USDZ File:", usdzFile)
    onClose()
  }

  const currentPreview = previewImage
  const currentDetails = detailImages

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <Label>Imagen Preview</Label>
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
                  onClick={() => setPreviewImage(null)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar imagen preview
                </Button>
              </div>
            ) : (
              <div>
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
              </div>
            )}
          </div>

          {/* Imágenes de Detalle */}
          <div className="space-y-3">
            <Label>Imágenes de Detalle</Label>

            {/* Grid de imágenes */}
            {currentDetails.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {currentDetails.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-muted">
                      <Image
                        src={url}
                        alt={`Detalle ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeDetailImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para agregar más imágenes */}
            <div>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
