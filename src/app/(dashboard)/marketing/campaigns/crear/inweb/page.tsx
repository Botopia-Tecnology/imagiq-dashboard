"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Globe, Save, Send, Eye, Clock, Target, Users, Settings, Zap, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { InWebPreview } from "@/components/campaigns/inweb/inweb-preview";

export default function CrearCampaignInWebPage() {
  const router = useRouter();

  const [inWebData, setInWebData] = useState({
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
    fallbackMessage: ""
  });

  const titleLength = inWebData.title.length;
  const messageLength = inWebData.message.length;
  const isTitleValid = titleLength <= 50;
  const isMessageValid = messageLength <= 120;

  const handleGoBack = () => {
    router.push('/marketing/campaigns');
  };

  const handleSave = () => {
    console.log("Guardando campaña InWeb:", inWebData);
  };

  const handleSend = () => {
    console.log("Enviando campaña InWeb:", inWebData);
  };

  const handlePlatformToggle = (platform: string) => {
    setInWebData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Campaña InWeb</h1>
          <p className="text-muted-foreground">
            Configura tu campaña de notificaciones web push
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Información de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Nombre de la Campaña</Label>
                <Input
                  id="campaignName"
                  placeholder="Ej: Push Black Friday 2024"
                  value={inWebData.campaignName}
                  onChange={(e) => setInWebData(prev => ({ ...prev, campaignName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Tipo de Campaña</Label>
                  <Select
                    value={inWebData.campaignType}
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, campaignType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="transactional">Transaccional</SelectItem>
                      <SelectItem value="news">Noticias</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                      <SelectItem value="abandoned-cart">Carrito Abandonado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Audiencia</Label>
                  <Select
                    value={inWebData.targetAudience}
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="subscribers">Solo suscriptores</SelectItem>
                      <SelectItem value="customers">Solo clientes</SelectItem>
                      <SelectItem value="visitors">Visitantes nuevos</SelectItem>
                      <SelectItem value="returning">Usuarios recurrentes</SelectItem>
                      <SelectItem value="inactive">Usuarios inactivos</SelectItem>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Título</Label>
                  <Badge variant={isTitleValid ? "secondary" : "destructive"}>
                    {titleLength}/50
                  </Badge>
                </div>
                <Input
                  id="title"
                  placeholder="¡Oferta especial disponible!"
                  value={inWebData.title}
                  onChange={(e) => setInWebData(prev => ({ ...prev, title: e.target.value }))}
                  className={!isTitleValid ? "border-red-500" : ""}
                />
                {!isTitleValid && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    El título es muy largo. Máximo 50 caracteres.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Mensaje</Label>
                  <Badge variant={isMessageValid ? "secondary" : "destructive"}>
                    {messageLength}/120
                  </Badge>
                </div>
                <Textarea
                  id="message"
                  rows={3}
                  placeholder="Descubre nuestras ofertas exclusivas con descuentos de hasta 50%"
                  value={inWebData.message}
                  onChange={(e) => setInWebData(prev => ({ ...prev, message: e.target.value }))}
                  className={!isMessageValid ? "border-red-500" : ""}
                />
                {!isMessageValid && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    El mensaje es muy largo. Máximo 120 caracteres.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL de Destino</Label>
                <Input
                  id="url"
                  placeholder="https://tuempresa.com/ofertas"
                  value={inWebData.url}
                  onChange={(e) => setInWebData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icono (URL)</Label>
                  <Input
                    id="icon"
                    placeholder="https://ejemplo.com/icon.png"
                    value={inWebData.icon}
                    onChange={(e) => setInWebData(prev => ({ ...prev, icon: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagen (URL)</Label>
                  <Input
                    id="image"
                    placeholder="https://ejemplo.com/banner.jpg"
                    value={inWebData.image}
                    onChange={(e) => setInWebData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionButton1">Botón de Acción 1</Label>
                  <Input
                    id="actionButton1"
                    placeholder="Ver Ofertas"
                    value={inWebData.actionButton1}
                    onChange={(e) => setInWebData(prev => ({ ...prev, actionButton1: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionButton2">Botón de Acción 2</Label>
                  <Input
                    id="actionButton2"
                    placeholder="Recordar Después"
                    value={inWebData.actionButton2}
                    onChange={(e) => setInWebData(prev => ({ ...prev, actionButton2: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Navegadores Compatible</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "chrome", label: "Chrome" },
                    { id: "firefox", label: "Firefox" },
                    { id: "safari", label: "Safari" },
                    { id: "edge", label: "Edge" }
                  ].map((browser) => (
                    <div key={browser.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={browser.id}
                        checked={inWebData.platforms.includes(browser.id)}
                        onChange={() => handlePlatformToggle(browser.id)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={browser.id} className="text-sm">
                        {browser.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Tipo de Dispositivo</Label>
                  <Select
                    value={inWebData.deviceType}
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, deviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="desktop">Solo Desktop</SelectItem>
                      <SelectItem value="mobile">Solo Móvil</SelectItem>
                      <SelectItem value="tablet">Solo Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="browserLanguage">Idioma del Navegador</Label>
                  <Select
                    value={inWebData.browserLanguage}
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, browserLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                      <SelectItem value="pt">Portugués</SelectItem>
                      <SelectItem value="fr">Francés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Comportamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireInteraction"
                    checked={inWebData.requireInteraction}
                    onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, requireInteraction: checked }))}
                  />
                  <Label htmlFor="requireInteraction">Requiere interacción del usuario</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="silent"
                    checked={inWebData.silent}
                    onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, silent: checked }))}
                  />
                  <Label htmlFor="silent">Notificación silenciosa</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableFrequencyCap"
                    checked={inWebData.enableFrequencyCap}
                    onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, enableFrequencyCap: checked }))}
                  />
                  <Label htmlFor="enableFrequencyCap">Límite de frecuencia</Label>
                </div>
              </div>

              {inWebData.enableFrequencyCap && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Máximo por día: {inWebData.maxPerDay}</Label>
                    <Slider
                      value={[inWebData.maxPerDay]}
                      onValueChange={(value) => setInWebData(prev => ({ ...prev, maxPerDay: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo por semana: {inWebData.maxPerWeek}</Label>
                    <Slider
                      value={[inWebData.maxPerWeek]}
                      onValueChange={(value) => setInWebData(prev => ({ ...prev, maxPerWeek: value[0] }))}
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
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, ttl: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3600">1 hora</SelectItem>
                      <SelectItem value="86400">24 horas</SelectItem>
                      <SelectItem value="604800">7 días</SelectItem>
                      <SelectItem value="2592000">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgencia</Label>
                  <Select
                    value={inWebData.urgency}
                    onValueChange={(value) => setInWebData(prev => ({ ...prev, urgency: value }))}
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

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendImmediately"
                  checked={inWebData.sendImmediately}
                  onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, sendImmediately: checked }))}
                />
                <Label htmlFor="sendImmediately">Enviar inmediatamente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="quietHours"
                  checked={inWebData.quietHours}
                  onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, quietHours: checked }))}
                />
                <Label htmlFor="quietHours">Respetar horario de silencio</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableABTest"
                  checked={inWebData.enableABTest}
                  onCheckedChange={(checked) => setInWebData(prev => ({ ...prev, enableABTest: checked }))}
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
        <div className="space-y-6">
          <Card>
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
              />
            </CardContent>
          </Card>

          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Estimadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">~2.5%</div>
                  <div className="text-sm text-muted-foreground">CTR Estimado</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">~15%</div>
                  <div className="text-sm text-muted-foreground">Tasa de Opt-out</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Plataformas seleccionadas:</span>
                  <span className="font-medium">{inWebData.platforms.length}/4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Validación:</span>
                  <Badge variant={isTitleValid && isMessageValid ? "default" : "destructive"}>
                    {isTitleValid && isMessageValid ? "Válido" : "Revisar"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}