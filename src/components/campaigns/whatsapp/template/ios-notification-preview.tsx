"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface IOSNotificationPreviewProps {
  templateData: any;
}

export function IOSNotificationPreview({ templateData }: IOSNotificationPreviewProps) {
  // Get notification title
  const getNotificationTitle = () => {
    if (templateData.header.type === "TEXT" && templateData.header.content) {
      return templateData.header.content;
    }
    return null;
  };

  // Get notification body
  const getNotificationBody = () => {
    if (!templateData.body) return "Tu mensaje aparecerá aquí...";

    // Remove variables and get plain text
    let text = templateData.body.replace(/\{\{\d+\}\}/g, "...");

    // Truncate to 80 chars for banner
    if (text.length > 80) {
      text = text.substring(0, 77) + "...";
    }

    return text;
  };

  return (
    <div className="mx-auto" style={{ width: "280px" }}>
      {/* iOS Push Notification Banner */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-gray-200/50">
        <div className="flex items-start gap-2.5">
          {/* WhatsApp Icon */}
          <div className="flex-shrink-0 w-9 h-9 bg-[#25D366] rounded-lg flex items-center justify-center shadow-sm">
            <BrandIcon brand="WhatsApp" size={20} className="text-white" />
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-xs text-gray-900">WhatsApp</span>
              <span className="text-[10px] text-gray-500">ahora</span>
            </div>

            {/* Title from header if exists */}
            {getNotificationTitle() && (
              <div className="font-semibold text-xs text-gray-900 mb-0.5 truncate">
                {getNotificationTitle()}
              </div>
            )}

            {/* Message Body */}
            <div className="text-xs text-gray-600 leading-snug line-clamp-2">
              {getNotificationBody()}
            </div>

            {/* Media Indicator */}
            {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.type) && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  {templateData.header.type === "IMAGE" && "📷 Foto"}
                  {templateData.header.type === "VIDEO" && "🎥 Video"}
                  {templateData.header.type === "DOCUMENT" && "📄 Documento"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info text */}
      <div className="text-center mt-2">
        <p className="text-[10px] text-muted-foreground">
          Push notification de iOS
        </p>
      </div>
    </div>
  );
}
