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
import { ArrowLeft, Smartphone, Save, Send, Eye, Clock, Target, Users, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SmsPreview } from "@/components/campaigns/sms/sms-preview";

export default function CrearCampaignSmsPage() {
  const router = useRouter();

  const [smsData, setSmsData] = useState({
    // Campaign Info
    campaignName: "",
    campaignType: "promotional",
    targetAudience: "all",

    // SMS Settings
    fromNumber: "",
    message: "",
    companyName: "Tu Empresa",

    // Personalization
    usePersonalization: false,
    includeOptOut: true,

    // Scheduling
    sendImmediately: true,
    scheduledDate: null as Date | null,

    // Compliance
    includeCompanyName: true,
    optOutMessage: "Reply STOP to opt-out",

    // A/B Testing
    enableABTest: false,
    abTestPercentage: 50
  });

  // Calcular estadísticas del mensaje
  const fullMessage = `${smsData.message}${smsData.includeOptOut ? ` ${smsData.optOutMessage}.` : ""}`;
  const messageLength = fullMessage.length;
  const isOverLimit = messageLength > 160;
  const segments = messageLength <= 160 ? 1 : Math.ceil(messageLength / 153);

  const handleGoBack = () => {
    router.push('/marketing/campaigns');
  };

  const handleSave = () => {
    console.log("Guardando campaña SMS:", smsData);
  };

  const handleSend = () => {
    console.log("Enviando campaña SMS:", smsData);
  };

  const handleInsertVariable = (variable: string) => {
    const newMessage = smsData.message + `{{${variable}}}`;
    setSmsData(prev => ({ ...prev, message: newMessage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Campaña SMS</h1>
          <p className="text-muted-foreground">
            Configura tu campaña de mensajes de texto
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
                  placeholder="Ej: Oferta Flash - Viernes Negro"
                  value={smsData.campaignName}
                  onChange={(e) => setSmsData(prev => ({ ...prev, campaignName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Tipo de Campaña</Label>
                  <Select
                    value={smsData.campaignType}
                    onValueChange={(value) => setSmsData(prev => ({ ...prev, campaignType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="transactional">Transaccional</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                      <SelectItem value="alert">Alerta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Audiencia</Label>
                  <Select
                    value={smsData.targetAudience}
                    onValueChange={(value) => setSmsData(prev => ({ ...prev, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="customers">Solo clientes</SelectItem>
                      <SelectItem value="opted-in">Usuarios opt-in SMS</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                      <SelectItem value="location">Por ubicación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configuración del SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromNumber">Número de Envío</Label>
                  <Select
                    value={smsData.fromNumber}
                    onValueChange={(value) => setSmsData(prev => ({ ...prev, fromNumber: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar número" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1234567890">+1 (234) 567-8900</SelectItem>
                      <SelectItem value="+1234567891">+1 (234) 567-8901</SelectItem>
                      <SelectItem value="shortcode">Short Code 12345</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Tu Empresa"
                    value={smsData.companyName}
                    onChange={(e) => setSmsData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Mensaje</Label>
                  <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                    {messageLength}/160 chars • {segments} SMS
                  </Badge>
                </div>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Escribe tu mensaje SMS aquí..."
                  value={smsData.message}
                  onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                  className={isOverLimit ? "border-red-500" : ""}
                />
                {isOverLimit && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Mensaje muy largo. Se enviará como {segments} SMS separados.
                  </div>
                )}
              </div>

              {/* Variables de Personalización */}
              <div className="space-y-2">
                <Label>Variables de Personalización</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Nombre", value: "nombre" },
                    { label: "Apellido", value: "apellido" },
                    { label: "Empresa", value: "empresa" },
                    { label: "Descuento", value: "descuento" }
                  ].map((variable) => (
                    <Button
                      key={variable.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsertVariable(variable.value)}
                    >
                      {variable.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento y Regulaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeOptOut"
                  checked={smsData.includeOptOut}
                  onCheckedChange={(checked) => setSmsData(prev => ({ ...prev, includeOptOut: checked }))}
                />
                <Label htmlFor="includeOptOut">Incluir opción de opt-out (Requerido)</Label>
              </div>

              {smsData.includeOptOut && (
                <div className="space-y-2">
                  <Label htmlFor="optOutMessage">Mensaje de Opt-out</Label>
                  <Input
                    id="optOutMessage"
                    value={smsData.optOutMessage}
                    onChange={(e) => setSmsData(prev => ({ ...prev, optOutMessage: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeCompanyName"
                  checked={smsData.includeCompanyName}
                  onCheckedChange={(checked) => setSmsData(prev => ({ ...prev, includeCompanyName: checked }))}
                />
                <Label htmlFor="includeCompanyName">Incluir nombre de la empresa</Label>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Nota:</strong> Asegúrate de cumplir con las regulaciones locales de SMS marketing.
                  Solo envía mensajes a usuarios que han dado su consentimiento explícito.
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
                  checked={smsData.sendImmediately}
                  onCheckedChange={(checked) => setSmsData(prev => ({ ...prev, sendImmediately: checked }))}
                />
                <Label htmlFor="sendImmediately">Enviar inmediatamente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableABTest"
                  checked={smsData.enableABTest}
                  onCheckedChange={(checked) => setSmsData(prev => ({ ...prev, enableABTest: checked }))}
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
              Enviar SMS
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
              <SmsPreview
                fromNumber={smsData.fromNumber}
                message={smsData.message}
                companyName={smsData.companyName}
                includeOptOut={smsData.includeOptOut}
              />
            </CardContent>
          </Card>

          {/* Message Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis del Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{messageLength}</div>
                  <div className="text-sm text-muted-foreground">Caracteres</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{segments}</div>
                  <div className="text-sm text-muted-foreground">Segmentos</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Costo estimado por SMS:</span>
                  <span className="font-medium">$0.05</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Costo total estimado:</span>
                  <span className="font-medium">${(segments * 0.05).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}