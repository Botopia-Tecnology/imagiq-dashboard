import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Apple, Globe, X, Bell } from "lucide-react";

interface InWebPreviewProps {
  image?: string;
  url?: string;
  displayStyle?: "popup" | "slider";
  contentType?: "image" | "html";
  htmlContent?: string;
}

export function InWebPreview({
  image,
  url = "https://tuempresa.com",
  displayStyle = "popup",
  contentType = "image",
  htmlContent = "",
}: InWebPreviewProps) {
  // Chrome Desktop Notification - Pop-up (bloqueante)
  const ChromeNotificationPopup = () => (
    <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm z-10">
        {contentType === "html" && htmlContent ? (
          <div
            className="mt-3 rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : image ? (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-32 object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  // Chrome Desktop Notification - Slider (tipo toast)
  const ChromeNotificationSlider = () => (
    <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm z-10">
        {contentType === "html" && htmlContent ? (
          <div
            className="mt-3 rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : image ? (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-32 object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  const ChromeNotification =
    displayStyle === "popup"
      ? ChromeNotificationPopup
      : ChromeNotificationSlider;

  // Mobile Chrome Notification - Pop-up
  const MobileNotificationPopup = () => (
    <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-gray-900 text-white p-4 max-w-xs rounded-lg shadow-2xl z-10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 ml-2">
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {contentType === "html" && htmlContent ? (
          <div
            className="mt-3 rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : image ? (
          <div className="mt-3 rounded overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-24 object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  // Mobile Chrome Notification - Slider
  const MobileNotificationSlider = () => (
     <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-gray-900 text-white p-4 max-w-xs rounded-lg shadow-2xl z-10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 ml-2">
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {contentType === "html" && htmlContent ? (
          <div
            className="mt-3 rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : image ? (
          <div className="mt-3 rounded overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-24 object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  const MobileNotification =
    displayStyle === "popup"
      ? MobileNotificationPopup
      : MobileNotificationSlider;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Móvil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Desktop -{" "}
                {displayStyle === "popup"
                  ? "Pop-up (Bloqueante)"
                  : "Slider (Toast)"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayStyle === "popup"
                  ? "Notificación bloqueante"
                  : "Notificación no intrusiva que aparece en la esquina"}
              </p>
            </div>
            <div className="flex justify-center">
              <ChromeNotification />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-lg">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Mobile -{" "}
                {displayStyle === "popup"
                  ? "Pop-up (Bloqueante)"
                  : "Slider (Toast)"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayStyle === "popup"
                  ? "Notificación completa en dispositivos móviles"
                  : "Notificación compacta desde la parte superior"}
              </p>
            </div>
            <div className="flex justify-center">
              <MobileNotification />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
