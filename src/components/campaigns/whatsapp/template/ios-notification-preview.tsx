"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface IOSNotificationPreviewProps {
  templateData: any;
}

export function IOSNotificationPreview({ templateData }: IOSNotificationPreviewProps) {
  // Get notification body with header prepended if exists
  const getNotificationBody = () => {
    if (!templateData.body) return "Tu mensaje aparecerá aquí...";

    let text = "";

    // Add header as prefix if exists
    if (templateData.header.type === "TEXT" && templateData.header.content) {
      text = templateData.header.content + "\n";
    }

    // Add body
    text += templateData.body.replace(/\{\{\d+\}\}/g, "...");

    // Truncate to 60 chars for banner
    if (text.length > 60) {
      text = text.substring(0, 57) + "...";
    }

    return text;
  };

  return (
    <div className="mx-auto" style={{ width: "280px" }}>
      {/* iOS Push Notification Banner */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl p-2 shadow-xl border border-gray-200/50">
        <div className="flex items-start gap-2">
          {/* WhatsApp Icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center shadow-sm">
            <BrandIcon brand="WhatsApp" size={18} className="text-white" />
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-[11px] text-gray-900">Samsung Store</span>
              <span className="text-[9px] text-gray-500">ahora</span>
            </div>

            {/* Message Body */}
            <div className="text-[11px] text-gray-600 leading-snug line-clamp-1">
              {getNotificationBody()}
            </div>

            {/* Media Indicator */}
            {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.type) && (
              <div className="flex items-center gap-1 mt-1">
                <div className="text-[9px] text-gray-500 flex items-center gap-1">
                  {templateData.header.type === "IMAGE" && "📷 Foto"}
                  {templateData.header.type === "VIDEO" && "🎥 Video"}
                  {templateData.header.type === "DOCUMENT" && "📄 Documento"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
