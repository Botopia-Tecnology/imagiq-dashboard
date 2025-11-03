"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface IOSNotificationPreviewProps {
  templateData: any;
  variableValues?: Record<string, string>;
}

export function IOSNotificationPreview({ templateData, variableValues = {} }: IOSNotificationPreviewProps) {
  // Get notification body with header prepended if exists and format text
  const getNotificationBody = () => {
    if (!templateData.body) return "Tu mensaje aparecerá aquí...";

    let text = "";

    // Add header as prefix if exists
    if (templateData.header.type === "TEXT" && templateData.header.content) {
      // Replace variables in header only if user provided values
      let headerText = templateData.header.content;
      const headerVariables = headerText.match(/\{\{\d+\}\}/g) || [];
      headerVariables.forEach((variable: string) => {
        if (variableValues[variable]) {
          headerText = headerText.replace(variable, variableValues[variable]);
        }
      });
      text = headerText + "\n";
    }

    // Add body with variables replaced only if user provided values
    let bodyText = templateData.body;
    const bodyVariables = bodyText.match(/\{\{\d+\}\}/g) || [];
    bodyVariables.forEach((variable: string) => {
      if (variableValues[variable]) {
        bodyText = bodyText.replace(variable, variableValues[variable]);
      }
    });
    text += bodyText;

    // Remove WhatsApp formatting symbols for notification (they don't show in notifications)
    // Remove bold formatting: *texto* and **texto**
    text = text.replace(/\*\*([^\*]+?)\*\*/g, '$1');
    text = text.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '$1');

    // Remove italic formatting: _texto_ and __texto__
    text = text.replace(/__([^_]+?)__/g, '$1');
    text = text.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '$1');

    // Remove strikethrough: ~texto~
    text = text.replace(/~([^~\n]+?)~/g, '$1');

    // Remove monospace: ```texto```
    text = text.replace(/```([^`]+?)```/g, '$1');

    // Allow more text for expanded iOS notification (about 160 chars for 3 lines)
    if (text.length > 160) {
      text = text.substring(0, 157) + "...";
    }

    return text;
  };

  return (
    <div className="mx-auto" style={{ width: "280px" }}>
      {/* iOS Push Notification Banner */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-start gap-2">
          {/* Profile Picture with WhatsApp Badge */}
          <div className="flex-shrink-0 w-8 h-8 relative">
            {/* Profile Picture */}
            <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dbqgbemui/image/upload/v1761873777/Samsung_Store_deken7.png"
                alt="Samsung Store"
                className="w-full h-full object-cover"
              />
            </div>
            {/* WhatsApp Badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#25D366] rounded-full flex items-center justify-center border border-white dark:border-gray-800 shadow-sm">
              <BrandIcon brand="WhatsApp" size={8} className="text-white" />
            </div>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-[11px] text-gray-900 dark:text-gray-100">Samsung Store</span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400">ahora</span>
            </div>

            {/* Message Body */}
            <div className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-3">
              {getNotificationBody()}
            </div>

            {/* Media Indicator */}
            {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.type) && (
              <div className="flex items-center gap-1 mt-1">
                <div className="text-[9px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
