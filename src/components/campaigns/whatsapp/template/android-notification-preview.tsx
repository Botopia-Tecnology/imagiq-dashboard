"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface AndroidNotificationPreviewProps {
  templateData: any;
  variableValues?: Record<string, string>;
}

export function AndroidNotificationPreview({ templateData, variableValues = {} }: AndroidNotificationPreviewProps) {
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

    // Truncate to 120 chars for Android expanded
    if (text.length > 120) {
      text = text.substring(0, 117) + "...";
    }

    return text;
  };

  const getNotificationTitle = () => {
    const baseTitle = "Samsung Store";

    // Add media type prefix if present
    if (templateData.header.type === "IMAGE") {
      return "📷 " + baseTitle;
    }
    if (templateData.header.type === "VIDEO") {
      return "🎥 " + baseTitle;
    }
    if (templateData.header.type === "DOCUMENT") {
      return "📄 " + baseTitle;
    }

    return baseTitle;
  };

  return (
    <div className="mx-auto" style={{ width: "280px" }}>
      {/* Android Material You Notification */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Notification Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {/* WhatsApp Icon */}
            <div className="w-4 h-4 bg-[#25D366] rounded-full flex items-center justify-center">
              <BrandIcon brand="WhatsApp" size={10} className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">ahora</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Notification Content */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            {/* Profile Picture */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src="https://res.cloudinary.com/dbqgbemui/image/upload/v1761873777/Samsung_Store_deken7.png"
                alt="Samsung Store"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {getNotificationTitle()}
              </div>

              {/* Message Body */}
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getNotificationBody()}
              </div>

              {/* Media Preview for Image/Video */}
              {(templateData.header.type === "IMAGE" || templateData.header.type === "VIDEO") && (
                <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {templateData.header.type === "IMAGE" && templateData.header.content ? (
                    <img
                      src={templateData.header.content}
                      alt="Imagen adjunta"
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <div className="text-gray-400 dark:text-gray-500 text-center">
                        <div className="text-2xl mb-1">
                          {templateData.header.type === "IMAGE" ? "🖼️" : "🎬"}
                        </div>
                        <div className="text-xs">
                          {templateData.header.type === "IMAGE" ? "Imagen" : "Video"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Preview */}
              {templateData.header.type === "DOCUMENT" && (
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Documento.pdf</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">PDF • 1.2 MB</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button className="px-3 py-1.5 text-[10px] font-medium text-[#25D366] bg-[#25D366]/10 rounded-full whitespace-nowrap">
              RESPONDER
            </button>
            <button className="px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full whitespace-nowrap">
              MARCAR COMO LEÍDO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}