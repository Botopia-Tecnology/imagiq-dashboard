"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  Target,
  GitBranch,
  Brain,
  Zap,
  BarChart3,
  MousePointer2,
  Eye,
  Clock,
  DollarSign,
  ShoppingCart,
  Mail,
  MessageCircle,
  Filter,
  Layers,
  Map,
  Activity,
  Tv,
  Facebook,
  Chrome,
  Search,
  ArrowRight,
} from "lucide-react"

export default function ClientesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Métricas generales
  const generalMetrics = [
    {
      title: "Total Clientes",
      value: "24,589",
      subtitle: "+12.5% vs mes anterior",
      icon: Users,
      trend: { value: "+3,072", isPositive: true },
    },
    {
      title: "Clientes Activos",
      value: "18,234",
      subtitle: "Última actividad 30 días",
      icon: Activity,
      trend: { value: "74%", isPositive: true },
    },
    {
      title: "Valor Promedio Cliente",
      value: "$2,450",
      subtitle: "Lifetime value",
      icon: DollarSign,
      trend: { value: "+8.2%", isPositive: true },
    },
    {
      title: "Tasa de Retención",
      value: "68%",
      subtitle: "Clientes que regresan",
      icon: TrendingUp,
      trend: { value: "+5.1%", isPositive: true },
    },
  ]

  // Secciones de análisis disponibles
  const analysisSections = [
    {
      id: "segmentation",
      title: "Segmentación de Clientes",
      description: "Crea segmentos personalizados basados en comportamiento, demografía y compras",
      icon: Target,
      path: "/clientes/segmentacion",
      available: true,
      features: ["Segmentos RFM", "Clusters automáticos", "7 segmentos predefinidos"],
      source: "PostHog + Internal Data",
    },
    {
      id: "cohorts",
      title: "Análisis de Cohortes",
      description: "Agrupa clientes por características comunes y analiza su comportamiento a lo largo del tiempo",
      icon: Layers,
      path: "/clientes/cohortes",
      available: true,
      features: ["Retención por cohorte", "Análisis temporal", "Comparación de grupos"],
      source: "PostHog",
    },
    {
      id: "journey",
      title: "Customer Journey",
      description: "Visualiza el recorrido completo de tus clientes desde el primer contacto hasta la compra",
      icon: Map,
      path: "/clientes/journey",
      available: true,
      features: ["Mapeo de rutas", "Puntos de fricción", "Tiempo entre eventos"],
      source: "PostHog + GTM",
    },
    {
      id: "funnel",
      title: "Análisis de Embudo",
      description: "Identifica dónde abandonan los clientes en el proceso de compra",
      icon: GitBranch,
      path: "/clientes/embudo",
      available: true,
      features: ["Tasa de conversión", "Drop-off points", "Comparación temporal"],
      source: "PostHog + GA4",
    },
    {
      id: "behavior",
      title: "Análisis de Comportamiento",
      description: "Entiende cómo interactúan los usuarios con tu sitio usando heatmaps y sesiones grabadas",
      icon: MousePointer2,
      path: "/clientes/comportamiento",
      available: true,
      features: ["Heatmaps", "Session recordings", "Click maps"],
      source: "Microsoft Clarity",
    },
    {
      id: "retention",
      title: "Retención y Churn",
      description: "Mide la lealtad de clientes e identifica riesgos de abandono",
      icon: TrendingUp,
      path: "/clientes/retencion",
      available: true,
      features: ["Tasa de retención", "Predicción de churn", "Win-back campaigns"],
      source: "PostHog",
    },
    {
      id: "attribution",
      title: "Atribución de Marketing",
      description: "Descubre qué canales y campañas traen los mejores clientes",
      icon: BarChart3,
      path: "/clientes/atribucion",
      available: true,
      features: ["Multi-touch attribution", "ROI por canal", "Conversión asistida"],
      source: "Meta Pixel + GTM + GA4",
    },
    {
      id: "lookalike",
      title: "Audiencias Similares",
      description: "Crea audiencias lookalike para tus campañas de Facebook y Google Ads",
      icon: Users,
      path: "/clientes/audiencias",
      available: true,
      features: ["Meta lookalike", "Google similar audiences", "Exportación automática"],
      source: "Meta Pixel",
    },
    {
      id: "custom-audiences",
      title: "Audiencias Personalizadas",
      description: "Crea listas de retargeting basadas en comportamiento específico",
      icon: Target,
      path: "/clientes/audiencias-personalizadas",
      available: true,
      features: ["Retargeting dinámico", "Exclusión de convertidos", "Sincronización con ads"],
      source: "Meta Pixel + GTM",
    },
    {
      id: "lifetime-value",
      title: "Valor de Vida del Cliente (LTV)",
      description: "Calcula y predice el valor total que generará cada cliente",
      icon: DollarSign,
      path: "/clientes/ltv",
      available: true,
      features: ["LTV por segmento", "Predicción ML", "CAC/LTV ratio"],
      source: "Internal Data + PostHog",
    },
    {
      id: "engagement",
      title: "Métricas de Engagement",
      description: "Mide qué tan comprometidos están tus clientes con tu marca",
      icon: Activity,
      path: "/clientes/engagement",
      available: true,
      features: ["Session frequency", "Feature adoption", "Stickiness score"],
      source: "PostHog",
    },
    {
      id: "ab-testing",
      title: "A/B Testing y Experimentación",
      description: "Crea experimentos para optimizar la experiencia del cliente",
      icon: Zap,
      path: "/clientes/experimentos",
      available: false,
      features: ["Tests multivariados", "Feature flags", "Análisis estadístico"],
      source: "PostHog",
    },
  ]

  // Métricas de fuentes de datos
  const dataSourceMetrics = [
    {
      source: "PostHog",
      icon: Brain,
      events: "1.2M eventos/mes",
      coverage: "100%",
      status: "Conectado",
    },
    {
      source: "Meta Pixel",
      icon: Facebook,
      events: "450K eventos/mes",
      coverage: "85%",
      status: "Conectado",
    },
    {
      source: "Google Tag Manager",
      icon: Chrome,
      events: "890K eventos/mes",
      coverage: "95%",
      status: "Conectado",
    },
    {
      source: "Microsoft Clarity",
      icon: Tv,
      events: "650K sesiones/mes",
      coverage: "100%",
      status: "Conectado",
    },
  ]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis de Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Dashboard completo con datos de PostHog, Meta Pixel, Google Analytics y Microsoft Clarity
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3">
          {/* General Metrics */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {generalMetrics.map((metric) => (
              <Card key={metric.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                    {metric.trend && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          metric.trend.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {metric.trend.value}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data Sources Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Fuentes de Datos</CardTitle>
              <CardDescription>
                Conexión en tiempo real con tus herramientas de análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {dataSourceMetrics.map((source) => (
                  <div key={source.source} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <source.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{source.source}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {source.events}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {source.coverage} cobertura
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-xs text-muted-foreground">{source.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Herramientas de Análisis Disponibles</CardTitle>
              <CardDescription>
                Selecciona la herramienta que necesitas para analizar a tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {analysisSections.map((section) => (
                  <Card
                    key={section.id}
                    className={`${
                      section.available
                        ? "cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                        : "opacity-60"
                    }`}
                    onClick={() => {
                      if (section.available) {
                        router.push(section.path)
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <section.icon className="h-5 w-5 text-primary" />
                        </div>
                        {!section.available && (
                          <Badge variant="secondary" className="text-xs">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-2">{section.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <strong>Fuente:</strong> {section.source}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {section.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        {section.available && (
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            Abrir <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Base de Datos de Clientes</CardTitle>
                  <CardDescription>
                    Lista completa de todos tus clientes con información detallada
                  </CardDescription>
                </div>
                <Button onClick={() => router.push("/clientes/lista")}>
                  Ver Lista Completa <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accede a la tabla completa de clientes con filtros avanzados, exportación y acciones en masa.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
