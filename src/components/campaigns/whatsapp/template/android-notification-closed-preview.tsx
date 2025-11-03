"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";

interface AndroidNotificationClosedPreviewProps {
  templateData: any;
  variableValues?: Record<string, string>;
}

export function AndroidNotificationClosedPreview({ templateData, variableValues = {} }: AndroidNotificationClosedPreviewProps) {
  // Get short notification text for closed notification
  const getNotificationText = () => {
    if (!templateData.body) return "Tu mensaje aparecerá aquí...";

    let text = "";

    // Add header as prefix if exists
    if (templateData.header.type === "TEXT" && templateData.header.content) {
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

    // Remove WhatsApp formatting symbols
    text = text.replace(/\*\*([^\*]+?)\*\*/g, '$1');
    text = text.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '$1');
    text = text.replace(/__([^_]+?)__/g, '$1');
    text = text.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '$1');
    text = text.replace(/~([^~\n]+?)~/g, '$1');
    text = text.replace(/```([^`]+?)```/g, '$1');

    // Truncate to 50 chars for Android closed
    if (text.length > 50) {
      text = text.substring(0, 47) + "...";
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
      {/* Android Closed Notification */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Notification Content */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            {/* WhatsApp Icon + Profile Picture */}
            <div className="flex-shrink-0 w-6 h-6 relative">
              <div className="w-6 h-6 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dbqgbemui/image/upload/v1761873777/Samsung_Store_deken7.png"
                  alt="Samsung Store"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* WhatsApp badge overlay */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#25D366] rounded-full flex items-center justify-center">
                <BrandIcon brand="WhatsApp" size={6} className="text-white" />
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-[10px] text-gray-900 dark:text-gray-100 truncate">
                  {getNotificationTitle()}
                </span>
                <span className="text-[8px] text-gray-500 dark:text-gray-400 ml-2">ahora</span>
              </div>

              {/* Message Body - Single line */}
              <div className="text-[9px] text-gray-700 dark:text-gray-300 truncate">
                {getNotificationText()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}