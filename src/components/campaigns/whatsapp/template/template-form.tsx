"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Image,
  FileText,
  Video,
  MapPin,
  Type,
  Phone,
  ExternalLink,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TemplateFormProps {
  templateData: any;
  onTemplateDataChange: (data: any) => void;
}

export function WhatsAppTemplateForm({
  templateData,
  onTemplateDataChange,
}: TemplateFormProps) {
  const addVariable = () => {
    const varCount = (templateData.body.match(/\{\{\d+\}\}/g) || []).length;
    const newVar = `{{${varCount + 1}}}`;
    onTemplateDataChange({
      ...templateData,
      body: templateData.body + newVar,
    });
  };

  const addButton = (type: string) => {
    const newButton = {
      id: Date.now(),
      type,
      text: "",
      ...(type === "PHONE_NUMBER" && { phoneNumber: "" }),
      ...(type === "URL" && { url: "" }),
    };
    onTemplateDataChange({
      ...templateData,
      buttons: [...templateData.buttons, newButton],
    });
  };

  const removeButton = (id: number) => {
    onTemplateDataChange({
      ...templateData,
      buttons: templateData.buttons.filter((btn: any) => btn.id !== id),
    });
  };

  const updateButton = (id: number, field: string, value: string) => {
    onTemplateDataChange({
      ...templateData,
      buttons: templateData.buttons.map((btn: any) =>
        btn.id === id ? { ...btn, [field]: value } : btn
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="template-name">
            Nombre de la Plantilla <span className="text-red-500">*</span>
          </Label>
          <Input
            id="template-name"
            placeholder="ej: bienvenida_cliente"
            value={templateData.name}
            onChange={(e) =>
              onTemplateDataChange({ ...templateData, name: e.target.value })
            }
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Solo letras minúsculas, números y guiones bajos
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={templateData.category}
              onValueChange={(value) =>
                onTemplateDataChange({ ...templateData, category: value })
              }
            >
              <SelectTrigger id="category" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="UTILITY">Utilidad</SelectItem>
                <SelectItem value="AUTHENTICATION">Autenticación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">
              Idioma <span className="text-red-500">*</span>
            </Label>
            <Select
              value={templateData.language}
              onValueChange={(value) =>
                onTemplateDataChange({ ...templateData, language: value })
              }
            >
              <SelectTrigger id="language" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="es_AR">Español (Argentina)</SelectItem>
                <SelectItem value="es_ES">Español (España)</SelectItem>
                <SelectItem value="es_MX">Español (México)</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt_BR">Português (Brasil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Encabezado</h3>
          <Badge variant="secondary">Opcional</Badge>
        </div>

        <div>
          <Label>Tipo de Encabezado</Label>
          <RadioGroup
            value={templateData.header.type}
            onValueChange={(value) =>
              onTemplateDataChange({
                ...templateData,
                header: { ...templateData.header, type: value, content: "" },
              })
            }
            className="mt-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <Label 
                htmlFor="header-none" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "NONE" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="NONE" id="header-none" />
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Ninguno
                </div>
              </Label>
              
              <Label 
                htmlFor="header-text" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "TEXT" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="TEXT" id="header-text" />
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Texto
                </div>
              </Label>
              
              <Label 
                htmlFor="header-image" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "IMAGE" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="IMAGE" id="header-image" />
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Imagen
                </div>
              </Label>
              
              <Label 
                htmlFor="header-video" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "VIDEO" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="VIDEO" id="header-video" />
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video
                </div>
              </Label>
              
              <Label 
                htmlFor="header-document" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "DOCUMENT" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="DOCUMENT" id="header-document" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documento
                </div>
              </Label>
              
              <Label 
                htmlFor="header-location" 
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                  templateData.header.type === "LOCATION" ? "bg-accent border-primary" : ""
                }`}
              >
                <RadioGroupItem value="LOCATION" id="header-location" />
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {templateData.header.type === "TEXT" && (
          <div>
            <Label htmlFor="header-text-content">Texto del Encabezado</Label>
            <Input
              id="header-text-content"
              placeholder="Máximo 60 caracteres"
              maxLength={60}
              value={templateData.header.content}
              onChange={(e) =>
                onTemplateDataChange({
                  ...templateData,
                  header: { ...templateData.header, content: e.target.value },
                })
              }
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {templateData.header.content.length}/60 caracteres
            </p>
          </div>
        )}

        {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.type) && (
          <div>
            <Label htmlFor="header-media">URL del Archivo</Label>
            <Input
              id="header-media"
              placeholder={`URL del ${templateData.header.type.toLowerCase()}`}
              value={templateData.header.content}
              onChange={(e) =>
                onTemplateDataChange({
                  ...templateData,
                  header: { ...templateData.header, content: e.target.value },
                })
              }
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Se puede agregar como variable dinámica al enviar el mensaje
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Body Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Cuerpo del Mensaje</h3>
            <Badge variant="destructive">Requerido</Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariable}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Variable
          </Button>
        </div>

        <div>
          <Textarea
            id="body"
            placeholder="Escribe tu mensaje aquí... Usa {{1}}, {{2}}, etc. para variables dinámicas"
            value={templateData.body}
            onChange={(e) =>
              onTemplateDataChange({ ...templateData, body: e.target.value })
            }
            className="min-h-[150px]"
            maxLength={1024}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {templateData.body.length}/1024 caracteres
          </p>
        </div>

        <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Variables:</strong> Usa doble llave con números para crear variables dinámicas (ej: {`{{1}}`}, {`{{2}}`}).
            Estas se reemplazarán con contenido personalizado al enviar el mensaje.
          </p>
        </Card>
      </div>

      <Separator />

      {/* Footer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Pie de Página</h3>
          <Badge variant="secondary">Opcional</Badge>
        </div>

        <div>
          <Label htmlFor="footer">Texto del Pie</Label>
          <Input
            id="footer"
            placeholder="Texto adicional al final (máx. 60 caracteres)"
            maxLength={60}
            value={templateData.footer}
            onChange={(e) =>
              onTemplateDataChange({ ...templateData, footer: e.target.value })
            }
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {templateData.footer.length}/60 caracteres
          </p>
        </div>
      </div>

      <Separator />

      {/* Buttons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Botones</h3>
            <Badge variant="secondary">Opcional</Badge>
          </div>
          {templateData.buttons.length < 10 && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addButton("QUICK_REPLY")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Respuesta Rápida
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addButton("PHONE_NUMBER")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addButton("URL")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                URL
              </Button>
            </div>
          )}
        </div>

        {templateData.buttons.length === 0 && (
          <Card className="p-4 text-center text-muted-foreground">
            <p className="text-sm">
              No hay botones agregados. Agrega hasta 10 botones para interactuar con tus clientes.
            </p>
          </Card>
        )}

        <div className="space-y-3">
          {templateData.buttons.map((button: any, index: number) => (
            <Card key={button.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {button.type === "QUICK_REPLY" && (
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    )}
                    {button.type === "PHONE_NUMBER" && (
                      <Phone className="h-4 w-4 text-green-600" />
                    )}
                    {button.type === "URL" && (
                      <ExternalLink className="h-4 w-4 text-purple-600" />
                    )}
                    <span className="text-sm font-medium">
                      {button.type === "QUICK_REPLY" && "Respuesta Rápida"}
                      {button.type === "PHONE_NUMBER" && "Llamada"}
                      {button.type === "URL" && "Visitar URL"}
                    </span>
                  </div>

                  <div>
                    <Label>Texto del Botón</Label>
                    <Input
                      placeholder="Máximo 25 caracteres"
                      maxLength={25}
                      value={button.text}
                      onChange={(e) =>
                        updateButton(button.id, "text", e.target.value)
                      }
                      className="mt-1.5"
                    />
                  </div>

                  {button.type === "PHONE_NUMBER" && (
                    <div>
                      <Label>Número de Teléfono</Label>
                      <Input
                        placeholder="+57 300 123 4567"
                        value={button.phoneNumber}
                        onChange={(e) =>
                          updateButton(button.id, "phoneNumber", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  {button.type === "URL" && (
                    <div>
                      <Label>URL</Label>
                      <Input
                        placeholder="https://ejemplo.com"
                        value={button.url}
                        onChange={(e) =>
                          updateButton(button.id, "url", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeButton(button.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {templateData.buttons.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {templateData.buttons.length}/10 botones agregados
          </p>
        )}
      </div>
    </div>
  );
}
