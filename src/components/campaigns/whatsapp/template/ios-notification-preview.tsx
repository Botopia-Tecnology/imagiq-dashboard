"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface IOSNotificationPreviewProps {
  templateData: any;
}

export function IOSNotificationPreview({ templateData }: IOSNotificationPreviewProps) {
  // Get first 60 characters of body for notification preview
  const getNotificationBody = () => {
    if (!templateData.body) return "Tu mensaje aparecerá aquí...";

    // Remove variables and get plain text
    let text = templateData.body.replace(/\{\{\d+\}\}/g, "...");

    // Truncate to 60 chars
    if (text.length > 60) {
      text = text.substring(0, 57) + "...";
    }

    return text;
  };

  const getHeaderText = () => {
    if (templateData.header.type === "TEXT" && templateData.header.content) {
      return templateData.header.content.substring(0, 30);
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* iOS Lock Screen Notification */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-4 shadow-2xl">
        {/* iOS Time */}
        <div className="text-center mb-8">
          <div className="text-7xl font-light text-white mb-1">9:41</div>
          <div className="text-lg text-gray-300">Martes, 30 de octubre</div>
        </div>

        {/* Notification */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg">
          <div className="flex items-start gap-3">
            {/* WhatsApp Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center shadow-sm">
              <BrandIcon brand="WhatsApp" size={24} className="text-white" />
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm text-gray-900">WhatsApp</span>
                <span className="text-xs text-gray-500">ahora</span>
              </div>

              {/* Header if exists */}
              {getHeaderText() && (
                <div className="font-semibold text-sm text-gray-900 mb-0.5">
                  {getHeaderText()}
                </div>
              )}

              {/* Business Name */}
              <div className="text-sm text-gray-700 mb-1">
                Tu Empresa
              </div>

              {/* Message Body */}
              <div className="text-sm text-gray-600 leading-snug">
                {getNotificationBody()}
              </div>

              {/* Media Indicator */}
              {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.type) && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {templateData.header.type === "IMAGE" && "📷 Foto"}
                    {templateData.header.type === "VIDEO" && "🎥 Video"}
                    {templateData.header.type === "DOCUMENT" && "📄 Documento"}
                  </div>
                </div>
              )}

              {/* Buttons indicator */}
              {templateData.buttons.length > 0 && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                  {templateData.buttons.slice(0, 2).map((button: any, index: number) => (
                    <div
                      key={button.id}
                      className="text-xs text-[#007AFF] font-medium"
                    >
                      {button.text || `Botón ${index + 1}`}
                    </div>
                  ))}
                  {templateData.buttons.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{templateData.buttons.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swipe indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <span>Deslizar para abrir</span>
          </div>
        </div>
      </div>

      {/* Info text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Vista previa de notificación push en iOS
        </p>
      </div>
    </div>
  );
}
