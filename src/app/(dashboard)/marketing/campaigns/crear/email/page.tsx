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
import { ArrowLeft, Mail, Save, Send, Eye, Upload, Users, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmailPreview } from "@/components/campaigns/email/email-preview";

export default function CrearCampaignEmailPage() {
  const router = useRouter();

  const [emailData, setEmailData] = useState({
    // Campaign Info
    campaignName: "",
    campaignType: "promotional",
    targetAudience: "all",

    // Email Settings
    subject: "",
    fromName: "",
    fromEmail: "",
    preheader: "",
    replyTo: "",

    // Content
    headerImage: "",
    title: "",
    subtitle: "",
    content: "",

    // CTA
    buttonText: "",
    buttonUrl: "",

    // Footer
    footerText: "",

    // Company Info
    companyName: "Tu Empresa",
    companyAddress: "123 Calle Principal, Ciudad, País",
    unsubscribeText: "Si no deseas recibir más emails, puedes darte de baja",

    // Scheduling
    sendImmediately: true,
    scheduledDate: null as Date | null,

    // A/B Testing
    enableABTest: false,
    abTestPercentage: 50
  });

  const handleGoBack = () => {
    router.push('/marketing/campaigns');
  };

  const handleSave = () => {
    console.log("Guardando campaña email:", emailData);
  };

  const handleSend = () => {
    console.log("Enviando campaña email:", emailData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Campaña Email</h1>
          <p className="text-muted-foreground">
            Configura tu campaña de email marketing
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
                  placeholder="Ej: Newsletter Semanal - Enero 2024"
                  value={emailData.campaignName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, campaignName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Tipo de Campaña</Label>
                  <Select
                    value={emailData.campaignType}
                    onValueChange={(value) => setEmailData(prev => ({ ...prev, campaignType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="transactional">Transaccional</SelectItem>
                      <SelectItem value="announcement">Anuncio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Audiencia</Label>
                  <Select
                    value={emailData.targetAudience}
                    onValueChange={(value) => setEmailData(prev => ({ ...prev, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="customers">Solo clientes</SelectItem>
                      <SelectItem value="prospects">Solo prospectos</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                      <SelectItem value="inactive">Usuarios inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración del Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto del Email</Label>
                <Input
                  id="subject"
                  placeholder="Ej: 🎉 Oferta especial solo para ti"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preheader">Preheader (Vista Previa)</Label>
                <Input
                  id="preheader"
                  placeholder="Texto que aparece después del asunto..."
                  value={emailData.preheader}
                  onChange={(e) => setEmailData(prev => ({ ...prev, preheader: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">Nombre del Remitente</Label>
                  <Input
                    id="fromName"
                    placeholder="Tu Empresa"
                    value={emailData.fromName}
                    onChange={(e) => setEmailData(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email del Remitente</Label>
                  <Input
                    id="fromEmail"
                    placeholder="noreply@tuempresa.com"
                    value={emailData.fromEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyTo">Responder a (Opcional)</Label>
                <Input
                  id="replyTo"
                  placeholder="support@tuempresa.com"
                  value={emailData.replyTo}
                  onChange={(e) => setEmailData(prev => ({ ...prev, replyTo: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headerImage">Imagen de Cabecera (URL)</Label>
                <Input
                  id="headerImage"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={emailData.headerImage}
                  onChange={(e) => setEmailData(prev => ({ ...prev, headerImage: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título Principal</Label>
                <Input
                  id="title"
                  placeholder="¡Descubre nuestras ofertas exclusivas!"
                  value={emailData.title}
                  onChange={(e) => setEmailData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                <Input
                  id="subtitle"
                  placeholder="Solo por tiempo limitado"
                  value={emailData.subtitle}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido Principal</Label>
                <Textarea
                  id="content"
                  rows={6}
                  placeholder="Escribe el contenido de tu email aquí..."
                  value={emailData.content}
                  onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Texto del Botón</Label>
                  <Input
                    id="buttonText"
                    placeholder="Ver Ofertas"
                    value={emailData.buttonText}
                    onChange={(e) => setEmailData(prev => ({ ...prev, buttonText: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">URL del Botón</Label>
                  <Input
                    id="buttonUrl"
                    placeholder="https://tuempresa.com/ofertas"
                    value={emailData.buttonUrl}
                    onChange={(e) => setEmailData(prev => ({ ...prev, buttonUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Texto del Pie (Opcional)</Label>
                <Textarea
                  id="footerText"
                  rows={2}
                  placeholder="Mensaje adicional en el pie del email..."
                  value={emailData.footerText}
                  onChange={(e) => setEmailData(prev => ({ ...prev, footerText: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Scheduling & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación y Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendImmediately"
                  checked={emailData.sendImmediately}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, sendImmediately: checked }))}
                />
                <Label htmlFor="sendImmediately">Enviar inmediatamente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableABTest"
                  checked={emailData.enableABTest}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, enableABTest: checked }))}
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
              Enviar Campaña
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
              <EmailPreview
                subject={emailData.subject}
                fromName={emailData.fromName}
                fromEmail={emailData.fromEmail}
                preheader={emailData.preheader}
                headerImage={emailData.headerImage}
                title={emailData.title}
                subtitle={emailData.subtitle}
                content={emailData.content}
                buttonText={emailData.buttonText}
                buttonUrl={emailData.buttonUrl}
                footerText={emailData.footerText}
                companyName={emailData.companyName}
                companyAddress={emailData.companyAddress}
                unsubscribeText={emailData.unsubscribeText}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}