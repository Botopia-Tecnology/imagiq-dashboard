"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Upload } from "lucide-react";

export interface NotificationContentData {
  contentType: "image" | "html";
  image: string;
  url: string;
  previewUrl: string;
  htmlContent: string;
}

interface NotificationContentProps {
  data: NotificationContentData;
  onChange: (data: NotificationContentData) => void;
}

export function NotificationContent({ data, onChange }: NotificationContentProps) {
  return (
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
            value={data.contentType}
            onValueChange={(value: "image" | "html") =>
              onChange({ ...data, contentType: value })
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

        {data.contentType === "image" ? (
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
                        onChange({
                          ...data,
                          image: reader.result as string,
                        });
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
                value={data.url}
                onChange={(e) =>
                  onChange({
                    ...data,
                    url: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                URL a la que se redirige al hacer clic en la notificación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previewUrl">URL del Preview (Iframe)</Label>
              <Input
                id="previewUrl"
                placeholder="https://imagiq-frontend.vercel.app/productos"
                value={data.previewUrl}
                onChange={(e) =>
                  onChange({
                    ...data,
                    previewUrl: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                URL que se mostrará en el fondo del preview
              </p>
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
              value={data.htmlContent}
              onChange={(e) =>
                onChange({
                  ...data,
                  htmlContent: e.target.value,
                })
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
  );
}
