"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Monitor,
  Smartphone,
  LayoutGrid,
  Megaphone,
  ShoppingCart,
  Tag,
  Bell,
  Package,
  Sparkles,
  MapPin,
  CheckCircle2
} from "lucide-react"

type BannerPlacement =
  | "hero"
  | "subheader"
  | "category-top"
  | "product-grid"
  | "product-detail"
  | "cart"
  | "checkout"
  | "sticky-bottom"
  | "notification"

type BannerType = {
  id: BannerPlacement
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  placement: string
  bestFor: string[]
  hasSubcategories?: boolean
  subcategories?: Array<{
    id: string
    title: string
    description: string
  }>
  recommended?: boolean
}

const bannerTypes: BannerType[] = [
  {
    id: "hero",
    title: "Hero Banner",
    description: "Banner principal en la parte superior de la homepage. Ideal para promociones principales y mensajes de marca.",
    icon: LayoutGrid,
    placement: "Homepage - Superior",
    bestFor: ["Promociones principales", "Nuevos productos", "Mensaje de marca"],
  },
  {
    id: "subheader",
    title: "Subheader Banner",
    description: "Banner debajo del header principal. Perfecto para anuncios y ofertas secundarias.",
    icon: Megaphone,
    placement: "Todas las páginas - Debajo del header",
    bestFor: ["Envío gratis", "Códigos de descuento", "Anuncios temporales"],
  },
  {
    id: "category-top",
    title: "Banner de Categoría (Superior)",
    description: "Banner en la parte superior de páginas de categoría. Promociona productos específicos de esa categoría.",
    icon: ShoppingCart,
    placement: "Páginas de categoría - Superior",
    bestFor: ["Ofertas de categoría", "Productos destacados", "Filtros visuales"],
    hasSubcategories: true,
    subcategories: [
      { id: "electronics", title: "Electrónicos", description: "Banners para categoría de electrónicos" },
      { id: "clothing", title: "Ropa", description: "Banners para categoría de ropa" },
      { id: "home", title: "Hogar", description: "Banners para categoría de hogar" },
      { id: "beauty", title: "Belleza", description: "Banners para categoría de belleza" },
    ],
  },
  {
    id: "product-grid",
    title: "Banner en Grid de Productos",
    description: "Banners insertados entre productos en el grid. Captura atención mientras el usuario navega.",
    icon: LayoutGrid,
    placement: "Grid de productos",
    bestFor: ["Promociones relacionadas", "Nuevas colecciones", "Destacar categorías"],
    hasSubcategories: true,
    subcategories: [
      { id: "position-3", title: "Posición 3", description: "Después de los primeros 2 productos" },
      { id: "position-6", title: "Posición 6", description: "Después de los primeros 5 productos" },
      { id: "position-9", title: "Posición 9", description: "Después de los primeros 8 productos" },
    ],
  },
  {
    id: "product-detail",
    title: "Banner de Producto",
    description: "Banner en páginas de detalle de producto. Excelente para upselling y garantías.",
    icon: Package,
    placement: "Páginas de producto - Debajo de detalles",
    bestFor: ["Garantías", "Envío gratis", "Productos relacionados"],
  },
  {
    id: "cart",
    title: "Banner de Carrito",
    description: "Banner en la página del carrito de compras. Motiva a completar la compra.",
    icon: Tag,
    placement: "Página de carrito",
    bestFor: ["Envío gratis al alcanzar monto", "Códigos de descuento", "Productos complementarios"],
  },
  {
    id: "checkout",
    title: "Banner de Checkout",
    description: "Banner en el proceso de checkout. Refuerza confianza y seguridad.",
    icon: CheckCircle2,
    placement: "Proceso de checkout",
    bestFor: ["Seguridad", "Garantías", "Métodos de pago"],
  },
  {
    id: "sticky-bottom",
    title: "Banner Sticky Inferior",
    description: "Banner fijo en la parte inferior. Ideal para llamadas a la acción persistentes.",
    icon: Sparkles,
    placement: "Inferior fijo - Todas las páginas",
    bestFor: ["Newsletter", "Descuentos primera compra", "App download"],
  },
  {
    id: "notification",
    title: "Banner de Notificación",
    description: "Banner de anuncio no intrusivo. Para información importante pero no urgente.",
    icon: Bell,
    placement: "Superior - Estilo notificación",
    bestFor: ["Nuevos productos", "Cambios en políticas", "Eventos especiales"],
  },
]

export default function SeleccionarTipoBannerPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<BannerPlacement | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [deviceType, setDeviceType] = useState<"same" | "different">("same")

  const handleContinue = () => {
    if (!selectedType) return

    // Construir query params
    const params = new URLSearchParams({
      type: selectedType,
      device: deviceType,
    })

    if (selectedSubcategory) {
      params.append("subcategory", selectedSubcategory)
    }

    router.push(`/marketing/banners/crear?${params.toString()}`)
  }

  const selectedBannerType = bannerTypes.find(t => t.id === selectedType)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Crear Nuevo Banner</h1>
        <p className="text-sm text-muted-foreground">
          Selecciona el tipo de banner y configuración para tu campaña
        </p>
      </div>

      {/* Paso 1: Configuración de dispositivo */}
      <Card>
        <CardHeader>
          <CardTitle>Paso 1: Configuración de dispositivos</CardTitle>
          <CardDescription>
            ¿Quieres usar el mismo diseño para móvil y escritorio, o crear versiones separadas?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Card
              className={`cursor-pointer transition-all hover:border-primary ${
                deviceType === "same" ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setDeviceType("same")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Monitor className={`h-5 w-5 ${deviceType === "same" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <CardTitle className="text-base">Mismo diseño</CardTitle>
                    <CardDescription className="text-xs">
                      Usar la misma imagen/diseño para todos los dispositivos (responsive)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:border-primary ${
                deviceType === "different" ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setDeviceType("different")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <Monitor className={`h-5 w-5 ${deviceType === "different" ? "text-primary" : "text-muted-foreground"}`} />
                    <Smartphone className={`h-5 w-5 ${deviceType === "different" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Diseños separados</CardTitle>
                    <CardDescription className="text-xs">
                      Crear versiones específicas para móvil y escritorio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">
                  Máximo control sobre la experiencia
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Paso 2: Seleccionar tipo de banner */}
      <Card>
        <CardHeader>
          <CardTitle>Paso 2: Selecciona el tipo de banner</CardTitle>
          <CardDescription>
            Elige dónde se mostrará tu banner en la página web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {bannerTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedType === type.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => {
                  setSelectedType(type.id)
                  setSelectedSubcategory(null)
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <type.icon className={`h-5 w-5 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-base">{type.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{type.placement}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {type.bestFor.slice(0, 2).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paso 3: Subcategorías (si aplica) */}
      {selectedBannerType?.hasSubcategories && selectedBannerType.subcategories && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3: Selecciona la subcategoría</CardTitle>
            <CardDescription>
              Especifica dónde exactamente se mostrará el banner de {selectedBannerType.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {selectedBannerType.subcategories.map((subcat) => (
                <Card
                  key={subcat.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedSubcategory === subcat.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedSubcategory(subcat.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-sm">{subcat.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {subcat.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen y botón de continuar */}
      {selectedType && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Resumen de configuración</h3>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>• Dispositivos: {deviceType === "same" ? "Mismo diseño" : "Diseños separados"}</p>
                  <p>• Tipo: {selectedBannerType?.title}</p>
                  {selectedSubcategory && (
                    <p>• Subcategoría: {selectedBannerType?.subcategories?.find(s => s.id === selectedSubcategory)?.title}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleContinue} size="lg">
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
