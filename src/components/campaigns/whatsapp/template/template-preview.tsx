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
  ChevronLeft,
  VideoIcon,
  PhoneCall,
  MoreVertical,
  Camera,
  Mic,
  Plus,
} from "lucide-react";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { IOSNotificationPreview } from "./ios-notification-preview";

interface TemplatePreviewProps {
  templateData: any;
}

export function WhatsAppTemplatePreview({ templateData }: TemplatePreviewProps) {
  const renderHeader = () => {
    if (templateData.header.type === "NONE") return null;

    if (templateData.header.type === "TEXT") {
      return (
        <div className="font-semibold text-sm mb-1.5">
          {templateData.header.content || "Texto del encabezado"}
        </div>
      );
    }

    if (templateData.header.type === "IMAGE") {
      return (
        <div className="mb-1.5 -mx-2 -mt-2">
          {templateData.header.content ? (
            <img
              src={templateData.header.content}
              alt="Header"
              className="w-full h-32 object-cover rounded-t-xl"
            />
          ) : (
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-xl">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    if (templateData.header.type === "VIDEO") {
      return (
        <div className="mb-1.5 -mx-2 -mt-2">
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-xl">
            <Video className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      );
    }

    if (templateData.header.type === "DOCUMENT") {
      return (
        <div className="mb-1.5 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Documento.pdf</p>
            <p className="text-[10px] text-muted-foreground">PDF</p>
          </div>
        </div>
      );
    }

    if (templateData.header.type === "LOCATION") {
      return (
        <div className="mb-1.5 -mx-2 -mt-2">
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-xl">
            <MapPin className="h-8 w-8 text-red-500" />
          </div>
        </div>
      );
    }
  };

  const renderBody = () => {
    if (!templateData.body) {
      return (
        <p className="text-gray-400 italic text-xs">
          El mensaje aparecerá aquí...
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
      bodyText = bodyText.replace(variable, `<span class="font-semibold text-blue-600 dark:text-blue-400">${sampleData[index] || "Valor"}</span>`);
    });

    return (
      <div
        className="text-xs whitespace-pre-wrap break-words leading-relaxed"
        dangerouslySetInnerHTML={{ __html: bodyText }}
      />
    );
  };

  const renderButtons = () => {
    if (templateData.buttons.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {templateData.buttons.map((button: any) => (
          <button
            key={button.id}
            className="w-full py-1.5 px-2 text-center text-[#007AFF] font-medium text-xs border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center justify-center gap-1.5"
          >
            {button.type === "PHONE_NUMBER" && (
              <Phone className="h-3 w-3" />
            )}
            {button.type === "URL" && (
              <ExternalLink className="h-3 w-3" />
            )}
            {button.text || "Texto del botón"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .whatsapp-chat-bg {
          background-image: url('https://i.pinimg.com/736x/31/04/e0/3104e02012ee109335a5ca2fc52b81db.jpg');
        }
        .dark .whatsapp-chat-bg {
          background-image: url('https://i.pinimg.com/736x/2b/60/94/2b609488b4711e06e40a213e24e55d77.jpg');
        }
      `}</style>
      <div className="space-y-4">
        {/* iOS Push Notification Preview */}
        <IOSNotificationPreview templateData={templateData} />

        {/* iPhone 17 Pro Max Frame */}
        <div className="mx-auto" style={{ width: "280px" }}>
        {/* iPhone Container with rounded corners and notch */}
        <div className="bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Dynamic Island / Notch */}
          <div className="relative bg-black rounded-[2.75rem] overflow-hidden">
            {/* Dynamic Island - Pill Shape (Smaller) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10 shadow-lg"></div>

            {/* Screen Content */}
            <div className="bg-white dark:bg-[#000000] rounded-[2.5rem] overflow-hidden">
              {/* iOS Status Bar */}
              <div className="bg-transparent px-8 pt-4 pb-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-black dark:text-white">9:41</span>
                  <div className="flex items-center gap-1">
                    {/* Signal bars */}
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-black dark:text-white">
                      <circle cx="1.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <circle cx="5" cy="7" r="1.5" fill="currentColor"/>
                      <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
                    </svg>
                    {/* WiFi */}
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" className="text-black dark:text-white">
                      <path d="M7.5 11L10.5 7.5C9.5 6.5 8.5 6 7.5 6C6.5 6 5.5 6.5 4.5 7.5L7.5 11Z" fill="currentColor"/>
                      <path d="M7.5 6C8.83 6 10.08 6.53 11 7.4L12.5 5.5C11.17 4.3 9.42 3.5 7.5 3.5C5.58 3.5 3.83 4.3 2.5 5.5L4 7.4C4.92 6.53 6.17 6 7.5 6Z" fill="currentColor"/>
                      <path d="M7.5 3.5C9.75 3.5 11.83 4.42 13.5 6L15 4C12.92 2.17 10.33 1 7.5 1C4.67 1 2.08 2.17 0 4L1.5 6C3.17 4.42 5.25 3.5 7.5 3.5Z" fill="currentColor"/>
                    </svg>
                    {/* Battery */}
                    <svg width="22" height="11" viewBox="0 0 22 11" fill="none" className="text-black dark:text-white">
                      <rect x="0" y="2" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="2" y="3.5" width="14" height="4" rx="1" fill="currentColor"/>
                      <rect x="18" y="4" width="2" height="3" rx="1" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* WhatsApp Header - iOS Style */}
              <div className="bg-[#F6F6F6] dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-gray-800 px-2 py-2">
                <div className="flex items-center gap-2">
                  {/* Back Button */}
                  <button className="p-1">
                    <ChevronLeft className="h-6 w-6 text-[#007AFF]" strokeWidth={2.5} />
                  </button>

                  {/* Profile Picture */}
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dbqgbemui/image/upload/v1761873777/Samsung_Store_deken7.png"
                      alt="Samsung Store"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-black dark:text-white truncate leading-tight">Samsung Store</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">en línea</p>
                  </div>

                  {/* Action Buttons */}
                  <button className="p-1.5">
                    <VideoIcon className="h-5 w-5 text-[#007AFF]" />
                  </button>
                  <button className="p-1.5">
                    <PhoneCall className="h-5 w-5 text-[#007AFF]" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div
                className="px-3 py-3 bg-cover bg-center whatsapp-chat-bg"
                style={{ height: "420px" }}
              >
                <div className="flex justify-end">
                  {/* Message Bubble */}
                  <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-xl shadow-sm p-2 max-w-[200px]">
                    {renderHeader()}

                    <div className="space-y-1">
                      {renderBody()}

                      {templateData.footer && (
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                          {templateData.footer}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-1 text-[9px] text-gray-600 dark:text-gray-400 mt-1">
                        <span>10:30</span>
                        <Check className="h-2.5 w-2.5" />
                        <Check className="h-2.5 w-2.5 -ml-1" />
                      </div>
                    </div>

                    {renderButtons()}
                  </div>
                </div>
              </div>

              {/* WhatsApp Input Bar - iOS Style */}
              <div className="bg-[#F6F6F6] dark:bg-[#1C1C1E] px-2 py-1.5 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <button className="p-1">
                    <Plus className="h-5 w-5 text-[#007AFF]" />
                  </button>
                  <div className="flex-1 bg-white dark:bg-[#2C2C2E] rounded-full px-3 py-1.5 flex items-center gap-2 border border-gray-300 dark:border-gray-700">
                    <span className="text-[11px] text-gray-400">Mensaje</span>
                  </div>
                  <button className="p-1">
                    <Mic className="h-5 w-5 text-[#007AFF]" />
                  </button>
                </div>
              </div>

              {/* iOS Home Indicator */}
              <div className="bg-white dark:bg-black flex justify-center py-2">
                <div className="w-32 h-1 bg-gray-800 dark:bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Template Info */}
      <Card className="p-3 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-blue-200 dark:border-blue-800">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block">Nombre</span>
            <span className="font-medium">{templateData.name || "sin_nombre"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Categoría</span>
            <Badge variant="outline" className="text-xs mt-0.5">
              {templateData.category === "MARKETING" && "Marketing"}
              {templateData.category === "UTILITY" && "Utilidad"}
              {templateData.category === "AUTHENTICATION" && "Auth"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground block">Idioma</span>
            <span className="font-medium text-xs">
              {templateData.language === "es" && "ES"}
              {templateData.language === "es_AR" && "ES-AR"}
              {templateData.language === "es_ES" && "ES-ES"}
              {templateData.language === "es_MX" && "ES-MX"}
              {templateData.language === "en" && "EN"}
              {templateData.language === "pt_BR" && "PT-BR"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Componentes</span>
            <div className="flex gap-1 flex-wrap mt-0.5">
              {templateData.header.type !== "NONE" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">H</Badge>
              )}
              {templateData.body && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">B</Badge>
              )}
              {templateData.footer && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">F</Badge>
              )}
              {templateData.buttons.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{templateData.buttons.length}BTN</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}
