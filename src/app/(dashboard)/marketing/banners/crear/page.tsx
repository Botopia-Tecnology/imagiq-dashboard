"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Eye, Save, Send, Image, Play, Component } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { HeroBannerPreview } from "@/components/banners/preview/hero-banner-preview";
import { HeroBanner } from "@/types/banner";

export default function CrearBannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type') as 'image' | 'video' | 'component' | null;

  // Parámetros de configuración del banner
  const bannerPlacement = searchParams.get('type'); // hero, subheader, category-top, etc.
  const deviceType = searchParams.get('device'); // same, different
  const subcategory = searchParams.get('subcategory');

  const [bannerData, setBannerData] = useState<Partial<HeroBanner> & { hasEndDate: boolean }>({
    name: "",
    type: typeFromUrl || "image",
    order: 1,
    startDate: new Date(),
    endDate: undefined,
    hasEndDate: false,
    // Campos para banner de imagen/video
    mediaUrl: "",
    // Campos para banner de componente
    title: "",
    subtitle: "",
    description: "",
    price: "",
    originalPrice: "",
    offerText: "",
    buttonText: "",
    gifSrc: "",
    bgColor: "#24538F"
  });

  const handleGoBack = () => {
    router.push('/marketing/banners/crear/seleccionar-tipo');
  };

  const handleSave = () => {
    console.log("Guardando banner:", bannerData);
  };

  const handlePublish = () => {
    console.log("Publicando banner:", bannerData);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Crear Banner</h1>
            {bannerPlacement && (
              <Badge variant="secondary" className="capitalize">
                {bannerPlacement.replace('-', ' ')}
              </Badge>
            )}
            {deviceType === 'different' && (
              <Badge variant="outline">Diseños separados</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Configura tu nuevo banner {subcategory && `para ${subcategory}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Banner</Label>
                <Input
                  id="name"
                  placeholder="Ej: Galaxy Buds Core Promo"
                  value={bannerData.name || ""}
                  onChange={(e) => setBannerData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Banner</Label>
                  <Select
                    value={bannerData.type}
                    onValueChange={(value) => setBannerData(prev => ({ ...prev, type: value as 'image' | 'video' | 'component' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Imagen
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="component">
                        <div className="flex items-center gap-2">
                          <Component className="h-4 w-4" />
                          Componente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Orden de Visualización</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={bannerData.order || ""}
                    onChange={(e) => setBannerData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos específicos según el tipo */}
          {(bannerData.type === "image" || bannerData.type === "video") && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {bannerData.type === "image" ? "Imagen del Banner" : "Video del Banner"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mediaUrl">
                    URL {bannerData.type === "image" ? "de la Imagen" : "del Video"}
                  </Label>
                  <Input
                    id="mediaUrl"
                    placeholder={bannerData.type === "image" ? "https://ejemplo.com/imagen.jpg" : "https://ejemplo.com/video.mp4"}
                    value={bannerData.mediaUrl || ""}
                    onChange={(e) => setBannerData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        Subir {bannerData.type === "image" ? "Imagen" : "Video"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {bannerData.type === "image" ? "PNG, JPG, GIF hasta 10MB" : "MP4, MOV hasta 50MB"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campos específicos para componente */}
          {bannerData.type === "component" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Contenido del Componente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título Principal</Label>
                      <Input
                        id="title"
                        placeholder="Nuevos Galaxy Buds Core"
                        value={bannerData.title || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        placeholder="Resistentes al agua"
                        value={bannerData.subtitle || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, subtitle: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción detallada del producto..."
                      value={bannerData.description || ""}
                      onChange={(e) => setBannerData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <Input
                        id="price"
                        placeholder="$219.900"
                        value={bannerData.price || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Precio Original</Label>
                      <Input
                        id="originalPrice"
                        placeholder="$259.900"
                        value={bannerData.originalPrice || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, originalPrice: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bgColor">Color de Fondo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bgColor"
                          type="color"
                          value={bannerData.bgColor || "#24538F"}
                          onChange={(e) => setBannerData(prev => ({ ...prev, bgColor: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={bannerData.bgColor || "#24538F"}
                          onChange={(e) => setBannerData(prev => ({ ...prev, bgColor: e.target.value }))}
                          placeholder="#24538F"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="offerText">Texto de Oferta</Label>
                      <Input
                        id="offerText"
                        placeholder="Oferta especial de lanzamiento"
                        value={bannerData.offerText || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, offerText: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Texto del Botón</Label>
                      <Input
                        id="buttonText"
                        placeholder="¡Compra aquí!"
                        value={bannerData.buttonText || ""}
                        onChange={(e) => setBannerData(prev => ({ ...prev, buttonText: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gifSrc">URL de Imagen del Producto</Label>
                    <Input
                      id="gifSrc"
                      placeholder="https://ejemplo.com/producto.png"
                      value={bannerData.gifSrc || ""}
                      onChange={(e) => setBannerData(prev => ({ ...prev, gifSrc: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Programación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {bannerData.startDate ? format(bannerData.startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bannerData.startDate}
                      onSelect={(date) => date && setBannerData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasEndDate"
                  checked={(bannerData as any).hasEndDate}
                  onCheckedChange={(checked) => setBannerData(prev => ({
                    ...prev,
                    hasEndDate: checked,
                    endDate: checked ? new Date() : null
                  } as any))}
                />
                <Label htmlFor="hasEndDate">Establecer fecha de finalización</Label>
              </div>

              {(bannerData as any).hasEndDate && (
                <div className="space-y-2">
                  <Label>Fecha de Finalización</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {bannerData.endDate ? format(bannerData.endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bannerData.endDate || undefined}
                        onSelect={(date) => setBannerData(prev => ({ ...prev, endDate: date || undefined }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Publicar Banner
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HeroBannerPreview banner={bannerData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{bannerData.name || "Nombre del Banner"}</h3>
                  <p className="text-sm text-muted-foreground">Orden: #{bannerData.order || 1}</p>
                </div>

                <div className="flex gap-2">
                  {bannerData.type && (
                    <Badge variant="secondary">
                      {bannerData.type === "image" ? "Imagen" :
                       bannerData.type === "video" ? "Video" :
                       bannerData.type === "component" ? "Componente" : bannerData.type}
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Inicio: </span>
                    {bannerData.startDate && format(bannerData.startDate, "PPP", { locale: es })}
                  </div>
                  {bannerData.hasEndDate && bannerData.endDate && (
                    <div>
                      <span className="text-muted-foreground">Fin: </span>
                      {format(bannerData.endDate, "PPP", { locale: es })}
                    </div>
                  )}
                </div>

                {bannerData.type === "component" && (
                  <>
                    <Separator />
                    <div className="text-sm space-y-1">
                      {bannerData.price && (
                        <div>
                          <span className="text-muted-foreground">Precio: </span>
                          <span className="font-medium">{bannerData.price}</span>
                          {bannerData.originalPrice && bannerData.originalPrice !== bannerData.price && (
                            <span className="text-muted-foreground line-through ml-2">{bannerData.originalPrice}</span>
                          )}
                        </div>
                      )}
                      {bannerData.offerText && (
                        <div>
                          <span className="text-muted-foreground">Oferta: </span>
                          {bannerData.offerText}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}