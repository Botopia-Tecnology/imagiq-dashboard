"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Globe,
  Save,
  Send,
  Eye,
  Clock,
  Target,
  Settings,
  AlertCircle,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { InWebPreview } from "@/components/campaigns/inweb/inweb-preview";
import {
  AudienceSegmentation,
  AudienceSegmentationData,
} from "@/components/campaigns/audience-segmentation";

export default function CrearCampaignInWebPage() {
  const router = useRouter();

  const [inWebData, setInWebData] = useState<{
    campaignName: string;
    campaignType: string;
    targetAudience: string;
    title: string;
    message: string;
    icon: string;
    image: string;
    url: string;
    companyName: string;
    actionButton1: string;
    actionButton1Url: string;
    actionButton2: string;
    actionButton2Url: string;
    displayStyle: "popup" | "slider";
    requireInteraction: boolean;
    silent: boolean;
    badge: string;
    tag: string;
    renotify: boolean;
    platforms: string[];
    geoLocation: string;
    deviceType: string;
    browserLanguage: string;
    selectedCities: string[];
    purchaseOperator: string;
    purchaseCount: number;
    minAge: number;
    maxAge: number;
    sendImmediately: boolean;
    scheduledDate: Date | null;
    timeZone: string;
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
    enableFrequencyCap: boolean;
    maxPerDay: number;
    maxPerWeek: number;
    enableABTest: boolean;
    abTestPercentage: number;
    ttl: number;
    urgency: string;
    enableFallback: boolean;
    fallbackMessage: string;
    contentType: "image" | "html";
    htmlContent: string;
  }>({
    // Campaign Info
    campaignName: "",
    campaignType: "promotional",
    targetAudience: "all",

    // Notification Content
    title: "",
    message: "",
    icon: "",
    image: "",
    url: "",
    companyName: "Tu Empresa",

    // Action Buttons
    actionButton1: "",
    actionButton1Url: "",
    actionButton2: "",
    actionButton2Url: "",

    // Behavior Settings
    displayStyle: "popup", // "popup" (bloqueante) o "slider" (tipo toast)
    requireInteraction: false,
    silent: false,
    badge: "",
    tag: "",
    renotify: false,

    // Targeting
    platforms: ["chrome", "firefox", "safari", "edge"],
    geoLocation: "",
    deviceType: "all",
    browserLanguage: "all",

    // Audience Segmentation
    selectedCities: [] as string[],
    purchaseOperator: "equal",
    purchaseCount: 0,
    minAge: 18,
    maxAge: 65,

    // Timing
    sendImmediately: true,
    scheduledDate: null as Date | null,
    timeZone: "user-local",
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00",

    // Frequency Capping
    enableFrequencyCap: false,
    maxPerDay: 3,
    maxPerWeek: 10,

    // A/B Testing
    enableABTest: false,
    abTestPercentage: 50,

    // Advanced
    ttl: 86400, // 24 hours in seconds
    urgency: "normal",
    enableFallback: true,
    fallbackMessage: "",

    // Content Type
    contentType: "image",
    htmlContent: "",
  });

  const titleLength = inWebData.title.length;
  const messageLength = inWebData.message.length;
  const isTitleValid = titleLength <= 50;
  const isMessageValid = messageLength <= 120;

  const handleGoBack = () => {
    router.push("/marketing/campaigns");
  };

  const handleSave = () => {
    console.log("Guardando campaña InWeb:", inWebData);
  };

  const handleSend = () => {
    console.log("Enviando campaña InWeb:", inWebData);
  };

  const handlePlatformToggle = (platform: string) => {
    setInWebData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSegmentationChange = (
    segmentationData: AudienceSegmentationData
  ) => {
    setInWebData((prev) => ({
      ...prev,
      ...segmentationData,
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Crear Campaña InWeb
          </h1>
          <p className="text-muted-foreground">
            Configura tu campaña de notificaciones web push
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-3">
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Información de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Nombre de la Campaña</Label>
                <Input
                  id="campaignName"
                  placeholder="Ej: Push Black Friday 2024"
                  value={inWebData.campaignName}
                  onChange={(e) =>
                    setInWebData((prev) => ({
                      ...prev,
                      campaignName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignType">Tipo de Campaña</Label>
                <Select
                  value={inWebData.campaignType}
                  onValueChange={(value) =>
                    setInWebData((prev) => ({ ...prev, campaignType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promocional</SelectItem>
                    <SelectItem value="transactional">Transaccional</SelectItem>
                    <SelectItem value="news">Noticias</SelectItem>
                    <SelectItem value="reminder">Recordatorio</SelectItem>
                    <SelectItem value="abandoned-cart">
                      Carrito Abandonado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audience Segmentation */}
          <AudienceSegmentation
            data={{
              targetAudience: inWebData.targetAudience,
              selectedCities: inWebData.selectedCities,
              purchaseOperator: inWebData.purchaseOperator,
              purchaseCount: inWebData.purchaseCount,
              minAge: inWebData.minAge,
              maxAge: inWebData.maxAge,
            }}
            onChange={handleSegmentationChange}
          />

          {/* Behavior Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Comportamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="displayStyle">Estilo de Presentación</Label>
                <Select
                  value={inWebData.displayStyle}
                  onValueChange={(value: "popup" | "slider") =>
                    setInWebData((prev) => ({ ...prev, displayStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popup">Pop-up (Bloqueante)</SelectItem>
                    <SelectItem value="slider">Slider (Tipo Toast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableFrequencyCap"
                    checked={inWebData.enableFrequencyCap}
                    onCheckedChange={(checked) =>
                      setInWebData((prev) => ({
                        ...prev,
                        enableFrequencyCap: checked,
                      }))
                    }
                  />
                  <Label htmlFor="enableFrequencyCap">
                    Límite de frecuencia
                  </Label>
                </div>
              </div>

              {inWebData.enableFrequencyCap && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Máximo por día: {inWebData.maxPerDay}</Label>
                    <Slider
                      value={[inWebData.maxPerDay]}
                      onValueChange={(value) =>
                        setInWebData((prev) => ({
                          ...prev,
                          maxPerDay: value[0],
                        }))
                      }
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo por semana: {inWebData.maxPerWeek}</Label>
                    <Slider
                      value={[inWebData.maxPerWeek]}
                      onValueChange={(value) =>
                        setInWebData((prev) => ({
                          ...prev,
                          maxPerWeek: value[0],
                        }))
                      }
                      max={50}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ttl">TTL (segundos)</Label>
                  <Select
                    value={inWebData.ttl.toString()}
                    onValueChange={(value) =>
                      setInWebData((prev) => ({
                        ...prev,
                        ttl: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3600">10</SelectItem>
                      <SelectItem value="86400">60</SelectItem>
                      <SelectItem value="604800">120</SelectItem>
                      <SelectItem value="2592000">180</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgencia</Label>
                  <Select
                    value={inWebData.urgency}
                    onValueChange={(value) =>
                      setInWebData((prev) => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-low">Muy Baja</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Contenido de la Notificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="contentType">Tipo de Contenido</Label>
                <Select
                  value={inWebData.contentType}
                  onValueChange={(value: "image" | "html") =>
                    setInWebData((prev) => ({ ...prev, contentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagen con URL</SelectItem>
                    <SelectItem value="html">HTML Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inWebData.contentType === "image" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageUpload">Subir Imagen</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setInWebData((prev) => ({
                                ...prev,
                                image: reader.result as string,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL de Destino</Label>
                    <Input
                      id="url"
                      placeholder="https://tuempresa.com/ofertas"
                      value={inWebData.url}
                      onChange={(e) =>
                        setInWebData((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="htmlContent">Contenido HTML</Label>
                  <Textarea
                    id="htmlContent"
                    placeholder="<div style='padding: 20px; background: linear-gradient(to right, #667eea, #764ba2); color: white;'>
  <h2>¡Oferta Especial!</h2>
  <p>50% de descuento en todos los productos</p>
</div>"
                    value={inWebData.htmlContent}
                    onChange={(e) =>
                      setInWebData((prev) => ({
                        ...prev,
                        htmlContent: e.target.value,
                      }))
                    }
                    rows={8}
                    className="font-mono text-sm max-h-96 overflow-y-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes usar HTML y CSS inline para personalizar el contenido
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendImmediately"
                  checked={inWebData.sendImmediately}
                  onCheckedChange={(checked) =>
                    setInWebData((prev) => ({
                      ...prev,
                      sendImmediately: checked,
                    }))
                  }
                />
                <Label htmlFor="sendImmediately">Enviar inmediatamente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableABTest"
                  checked={inWebData.enableABTest}
                  onCheckedChange={(checked) =>
                    setInWebData((prev) => ({ ...prev, enableABTest: checked }))
                  }
                />
                <Label htmlFor="enableABTest">Habilitar prueba A/B</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button onClick={handleSend} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Enviar Push
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InWebPreview
                title={inWebData.title}
                message={inWebData.message}
                icon={inWebData.icon}
                image={inWebData.image}
                actionButton1={inWebData.actionButton1}
                actionButton2={inWebData.actionButton2}
                url={inWebData.url}
                companyName={inWebData.companyName}
                displayStyle={inWebData.displayStyle}
                contentType={inWebData.contentType}
                htmlContent={inWebData.htmlContent}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
