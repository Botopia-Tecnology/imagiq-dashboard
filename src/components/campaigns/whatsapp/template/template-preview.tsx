"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  Phone,
  ExternalLink,
  Check,
} from "lucide-react";
import { BrandIcon } from "@/components/icons/BrandIcon";

interface TemplatePreviewProps {
  templateData: any;
}

export function WhatsAppTemplatePreview({ templateData }: TemplatePreviewProps) {
  const renderHeader = () => {
    if (templateData.header.type === "NONE") return null;

    if (templateData.header.type === "TEXT") {
      return (
        <div className="font-bold text-base mb-2">
          {templateData.header.content || "Texto del encabezado"}
        </div>
      );
    }

    if (templateData.header.type === "IMAGE") {
      return (
        <div className="mb-2 -mx-3 -mt-3">
          {templateData.header.content ? (
            <img
              src={templateData.header.content}
              alt="Header"
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    if (templateData.header.type === "VIDEO") {
      return (
        <div className="mb-2 -mx-3 -mt-3">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
            <Video className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      );
    }

    if (templateData.header.type === "DOCUMENT") {
      return (
        <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Documento.pdf</p>
            <p className="text-xs text-muted-foreground">PDF Document</p>
          </div>
        </div>
      );
    }

    if (templateData.header.type === "LOCATION") {
      return (
        <div className="mb-2 -mx-3 -mt-3">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
            <MapPin className="h-12 w-12 text-red-500" />
          </div>
        </div>
      );
    }
  };

  const renderBody = () => {
    if (!templateData.body) {
      return (
        <p className="text-gray-400 italic text-sm">
          El cuerpo del mensaje aparecerá aquí...
        </p>
      );
    }

    // Replace variables with sample data
    let bodyText = templateData.body;
    const variables = bodyText.match(/\{\{\d+\}\}/g) || [];
    variables.forEach((variable: string, index: number) => {
      const sampleData = [
        "Juan",
        "Pérez",
        "20%",
        "hoy",
        "producto",
        "servicio",
        "cuenta",
        "pedido",
      ];
      bodyText = bodyText.replace(variable, `<span class="font-semibold text-blue-600">${sampleData[index] || "Valor"}</span>`);
    });

    return (
      <div
        className="text-sm whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: bodyText }}
      />
    );
  };

  const renderButtons = () => {
    if (templateData.buttons.length === 0) return null;

    return (
      <div className="mt-3 space-y-1.5">
        {templateData.buttons.map((button: any) => (
          <Button
            key={button.id}
            variant="outline"
            className="w-full justify-center text-blue-600 hover:text-blue-700 border-gray-200 dark:border-gray-700"
            size="sm"
          >
            {button.type === "PHONE_NUMBER" && (
              <Phone className="h-3.5 w-3.5 mr-2" />
            )}
            {button.type === "URL" && (
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
            )}
            {button.text || "Texto del botón"}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Phone Frame */}
      <div className="mx-auto max-w-sm">
        {/* Phone Header */}
        <div className="bg-[#075E54] text-white p-3 rounded-t-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <BrandIcon brand="WhatsApp" size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Tu Empresa</p>
            <p className="text-xs text-green-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full"></span>
              En línea
            </p>
          </div>
        </div>

        {/* Chat Background */}
        <div className="bg-[#ECE5DD] dark:bg-[#0B141A] p-4 min-h-[500px]">
          {/* Message Bubble */}
          <div className="bg-white dark:bg-[#005C4B] rounded-lg shadow-sm p-3 max-w-[280px] ml-auto">
            {renderHeader()}

            <div className="space-y-2">
              {renderBody()}

              {templateData.footer && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {templateData.footer}
                </p>
              )}

              <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>10:30</span>
                <Check className="h-3 w-3" />
                <Check className="h-3 w-3 -ml-1.5" />
              </div>
            </div>

            {renderButtons()}
          </div>
        </div>
      </div>

      {/* Template Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nombre:</span>
            <span className="font-medium">
              {templateData.name || "sin_nombre"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Categoría:</span>
            <Badge variant="outline">
              {templateData.category === "MARKETING" && "Marketing"}
              {templateData.category === "UTILITY" && "Utilidad"}
              {templateData.category === "AUTHENTICATION" && "Autenticación"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Idioma:</span>
            <span className="font-medium">
              {templateData.language === "es" && "Español"}
              {templateData.language === "es_AR" && "Español (Argentina)"}
              {templateData.language === "es_ES" && "Español (España)"}
              {templateData.language === "es_MX" && "Español (México)"}
              {templateData.language === "en" && "English"}
              {templateData.language === "pt_BR" && "Português (Brasil)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Componentes:</span>
            <div className="flex gap-2">
              {templateData.header.type !== "NONE" && (
                <Badge variant="secondary" className="text-xs">
                  Header
                </Badge>
              )}
              {templateData.body && (
                <Badge variant="secondary" className="text-xs">
                  Body
                </Badge>
              )}
              {templateData.footer && (
                <Badge variant="secondary" className="text-xs">
                  Footer
                </Badge>
              )}
              {templateData.buttons.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {templateData.buttons.length} Botones
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
