"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface IOSNotificationClosedPreviewProps {
  templateData: any;
  variableValues?: Record<string, string>;
}

export function IOSNotificationClosedPreview({ templateData, variableValues = {} }: IOSNotificationClosedPreviewProps) {
  // Get short notification text for banner
  const getNotificationText = () => {
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
      text = headerText + " ";
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

    // Remove WhatsApp formatting symbols for notification
    text = text.replace(/\*\*([^\*]+?)\*\*/g, '$1');
    text = text.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '$1');
    text = text.replace(/__([^_]+?)__/g, '$1');
    text = text.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '$1');
    text = text.replace(/~([^~\n]+?)~/g, '$1');
    text = text.replace(/```([^`]+?)```/g, '$1');

    // Truncate to 40 chars for closed banner
    if (text.length > 40) {
      text = text.substring(0, 37) + "...";
    }

    return text;
  };

  return (
    <div className="mx-auto" style={{ width: "280px" }}>
      {/* iOS Push Notification Banner - Closed */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* Profile Picture with WhatsApp Badge */}
          <div className="flex-shrink-0 w-6 h-6 relative">
            {/* Profile Picture */}
            <div className="w-6 h-6 bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dbqgbemui/image/upload/v1761873777/Samsung_Store_deken7.png"
                alt="Samsung Store"
                className="w-full h-full object-cover"
              />
            </div>
            {/* WhatsApp Badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#25D366] rounded-full flex items-center justify-center border border-white dark:border-gray-800 shadow-sm">
              <BrandIcon brand="WhatsApp" size={6} className="text-white" />
            </div>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[10px] text-gray-900 dark:text-gray-100 truncate">Samsung Store</span>
              <span className="text-[8px] text-gray-500 dark:text-gray-400 ml-2">ahora</span>
            </div>

            {/* Message Body - Single line */}
            <div className="text-[9px] text-gray-600 dark:text-gray-300 truncate">
              {getNotificationText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}