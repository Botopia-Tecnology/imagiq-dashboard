"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ProductCardProps, ProductColor } from "@/features/products/useProducts"
import { EditImagesModal } from "./EditImagesModal"
import { EditPremiumModal } from "./EditPremiumModal"
import { productEndpoints } from "@/lib/api"
import { toast } from "sonner"

interface ProductMultimediaProps {
  product: ProductCardProps
  selectedColor: ProductColor | null
  currentImage: string | any
  currentDiscount: string | undefined
  currentStock: number
}

export function ProductMultimedia({
  product,
  selectedColor,
  currentImage,
  currentDiscount,
  currentStock,
}: ProductMultimediaProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isPremiumMode, setIsPremiumMode] = useState(() => {
    // Cargar el estado desde localStorage al inicializar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isPremiumMode')
      return saved === 'true'
    }
    return false
  })
  const [premiumVideos, setPremiumVideos] = useState<string[]>([])
  const [premiumImages, setPremiumImages] = useState<string[]>([])
  const [isLoadingPremium, setIsLoadingPremium] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [currentPremiumImageIndex, setCurrentPremiumImageIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)

  // Función helper para verificar si el producto es premium (insensible a mayúsculas)
  const isPremiumProduct = (() => {
    if (!product.segmento || !Array.isArray(product.segmento)) return false
    return product.segmento.some(seg => 
      typeof seg === 'string' && seg.toLowerCase() === 'premium'
    )
  })()

  // Guardar el estado de isPremiumMode en localStorage (solo para productos premium)
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Evitar que el modo premium "se pegue" a productos no premium
    if (!isPremiumProduct) {
      localStorage.setItem('isPremiumMode', 'false')
      return
    }
    localStorage.setItem('isPremiumMode', String(isPremiumMode))
  }, [isPremiumMode, isPremiumProduct])

  // Crear array de items del carrusel (videos + imágenes excepto la última)
  const carouselItems = (() => {
    const items: Array<{ type: 'video' | 'image', url: string }> = [];
    // Agregar todos los videos primero
    premiumVideos.forEach(url => {
      items.push({ type: 'video', url });
    });
    // Agregar todas las imágenes excepto la última
    const imagesForCarousel = premiumImages.slice(0, -1);
    imagesForCarousel.forEach(url => {
      items.push({ type: 'image', url });
    });
    return items;
  })()

  // Reiniciar el índice de imagen cuando cambie el color
  useEffect(() => {
    setCurrentImageIndex(0)
    setCurrentVideoIndex(0)
  }, [selectedColor])

  // Manejar carga y errores del video cuando cambia la URL
  useEffect(() => {
    const video = videoRef.current
    if (!video || carouselItems[currentVideoIndex]?.type !== 'video') {
      setVideoLoading(false)
      setVideoError(null)
      return
    }

    setVideoError(null)
    setVideoLoading(true)

    const handleCanPlay = () => {
      setVideoLoading(false)
      setVideoError(null)
    }
    
    const handleError = () => {
      setVideoLoading(false)
      const error = video.error
      if (error) {
        let errorMessage = 'Error al cargar el video'
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'La reproducción del video fue cancelada'
            break
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Error de red al cargar el video. Verifica tu conexión.'
            break
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Error al decodificar el video'
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'El formato del video no es compatible'
            break
        }
        setVideoError(errorMessage)
        console.error('Error de video:', {
          message: errorMessage,
          code: error.code,
          src: video.src,
          networkState: video.networkState,
          readyState: video.readyState
        })
      }
    }
    
    const handleLoadStart = () => {
      setVideoLoading(true)
      setVideoError(null)
    }
    
    const handleLoadedData = () => {
      setVideoLoading(false)
    }

    const handleLoadedMetadata = () => {
      setVideoLoading(false)
    }

    // Agregar event listeners
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Si el video ya tiene metadata cargada, no mostrar loading
    if (video.readyState >= 2) {
      setVideoLoading(false)
    }
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [currentVideoIndex, carouselItems])

  // Cargar contenido premium cuando se activa el switch (solo si el producto es premium)
  useEffect(() => {
    if (!isPremiumMode || !selectedColor || !isPremiumProduct) return

    setIsLoadingPremium(true)
    console.log("Selected Color Premium Data:", {
      premiumVideos: selectedColor.premiumVideos,
      premiumImages: selectedColor.premiumImages
    })

    // Los datos premium ya vienen en selectedColor desde el mapper
    setPremiumVideos(selectedColor.premiumVideos || [])
    setPremiumImages(selectedColor.premiumImages || [])

    setIsLoadingPremium(false)
  }, [isPremiumMode, selectedColor, isPremiumProduct])

  // Si no es premium, forzamos el modo premium a apagado para evitar render incorrecto
  useEffect(() => {
    if (!isPremiumProduct && isPremiumMode) {
      setIsPremiumMode(false)
    }
  }, [isPremiumProduct, isPremiumMode])

  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        {/* Botón de editar y switch premium */}
        <div className="flex justify-between items-center mb-4">
          {isPremiumProduct ? (
            <>
              <div className="flex items-center gap-3">
                <Switch
                  id="premium-mode"
                  checked={isPremiumMode}
                  onCheckedChange={setIsPremiumMode}
                />
                <Label htmlFor="premium-mode" className="text-sm font-medium cursor-pointer">
                  Contenido Premium
                </Label>
              </div>
              <div className="flex gap-2">
                {isPremiumMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar Premium
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar imágenes
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar imágenes
              </Button>
            </div>
          )}
        </div>
        {isLoadingPremium ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando contenido premium...</p>
            </div>
          </div>
        ) : (isPremiumMode && isPremiumProduct) ? (
          /* Contenido Premium */
          <>
            {/* Carrusel Premium (Videos + Imágenes excepto la última) */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Carrusel Premium</h3>
              {carouselItems.length > 0 ? (
                  <>
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black group">
                      {carouselItems[currentVideoIndex]?.type === 'video' ? (
                        <>
                          {videoLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <p className="text-sm text-white">Cargando video...</p>
                              </div>
                            </div>
                          )}
                          {videoError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                              <div className="text-center p-4">
                                <p className="text-sm text-red-400 mb-2">{videoError}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (videoRef.current) {
                                      videoRef.current.load()
                                    }
                                  }}
                                >
                                  Reintentar
                                </Button>
                              </div>
                            </div>
                          )}
                          <video
                            ref={videoRef}
                            src={carouselItems[currentVideoIndex].url}
                            className="w-full h-full object-contain"
                            controls
                            preload="auto"
                            playsInline
                            key={`${carouselItems[currentVideoIndex].url}-${currentVideoIndex}`}
                            style={{ maxHeight: '100%' }}
                          >
                            Tu navegador no soporta la reproducción de video.
                          </video>
                        </>
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={carouselItems[currentVideoIndex]?.url || ''}
                            alt={`Carrusel ${currentVideoIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      )}

                      {/* Botones de navegación - Solo mostrar cuando no es video o cuando no se está hover sobre controles */}
                      {carouselItems.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentVideoIndex((prev) =>
                                prev === 0 ? carouselItems.length - 1 : prev - 1
                              )
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            aria-label="Anterior"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentVideoIndex((prev) =>
                                prev === carouselItems.length - 1 ? 0 : prev + 1
                              )
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            aria-label="Siguiente"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Indicadores de página - Posicionados para no interferir con controles de video */}
                      {carouselItems.length > 1 && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                          {carouselItems.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentVideoIndex(index)
                              }}
                              className={`h-2 rounded-full transition-all pointer-events-auto ${
                                index === currentVideoIndex
                                  ? 'w-8 bg-white'
                                  : 'w-2 bg-white/50 hover:bg-white/75'
                              }`}
                              aria-label={`Ir a item ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">No hay contenido premium disponible</p>
                  </div>
                )}
            </div>

            {/* Imagen Premium del Dispositivo (última imagen) */}
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Imagen Premium</h3>
              {premiumImages.length > 0 ? (
                <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
                  <Image
                    src={premiumImages[premiumImages.length - 1]}
                    alt="Imagen Premium del Dispositivo"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">No hay imagen premium disponible</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Contenido Normal */
          <>
            {/* Imagen de Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Imagen preview</h3>
              <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted group">
                {typeof currentImage === 'string' ? (
                  <Image
                    key={selectedColor?.sku || 'default'}
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor?.label || ''}`}
                    fill
                    priority
                    className="object-contain"
                  />
                ) : (
                  <Image
                    key={selectedColor?.sku || 'default'}
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor?.label || ''}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Imágenes detalladas - Carrusel */}
            {selectedColor?.imageDetailsUrls && selectedColor.imageDetailsUrls.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Imágenes de detalle</h3>
                <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted group">
                  <Image
                    src={selectedColor.imageDetailsUrls[currentImageIndex]}
                    alt={`${product.name} - ${selectedColor.label} - Detalle ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />

                  {/* Botones de navegación */}
                  {selectedColor.imageDetailsUrls.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) =>
                          prev === 0 ? selectedColor.imageDetailsUrls!.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) =>
                          prev === selectedColor.imageDetailsUrls!.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Indicadores de página */}
                  {selectedColor.imageDetailsUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selectedColor.imageDetailsUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 pl-2">
                  {selectedColor.imageDetailsUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} - Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Badges */}
        <div className="mt-4 flex gap-2">
          {product.isNew && (
            <Badge variant="default">Nuevo</Badge>
          )}
          {currentDiscount && (
            <Badge variant="destructive">{currentDiscount}</Badge>
          )}
          {currentStock > 0 ? (
            <Badge variant="default">En stock ({currentStock})</Badge>
          ) : (
            <Badge variant="secondary">Agotado</Badge>
          )}
        </div>

        {/* Modal de edición de imágenes normales */}
        <EditImagesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          selectedColor={selectedColor}
          isPremiumMode={isPremiumMode}
        />

        {/* Modal de edición de contenido premium */}
        <EditPremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          product={product}
          selectedColor={selectedColor}
        />
      </CardContent>
    </Card>
  )
}
