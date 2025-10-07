import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Apple, Globe, X, Bell } from "lucide-react";

interface InWebPreviewProps {
  title?: string;
  message?: string;
  icon?: string;
  image?: string;
  actionButton1?: string;
  actionButton2?: string;
  badge?: string;
  url?: string;
  companyName?: string;
  displayStyle?: "popup" | "slider";
}

export function InWebPreview({
  title = "Título de la notificación",
  message = "Mensaje de la notificación push que aparecerá en el navegador del usuario.",
  icon,
  image,
  actionButton1,
  actionButton2,
  badge,
  url = "https://tuempresa.com",
  companyName = "Tu Empresa",
  displayStyle = "popup"
}: InWebPreviewProps) {
  const defaultIcon = "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=64&h=64&fit=crop&crop=center";

  // Chrome Desktop Notification - Pop-up (bloqueante)
  const ChromeNotificationPopup = () => (
    <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm z-10">
        <div className="flex items-start gap-3">
          <img
            src={icon || defaultIcon}
            alt="Icon"
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {title}
              </h4>
              <button className="text-gray-400 hover:text-gray-600 ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {message}
            </p>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {companyName}
            </div>
          </div>
        </div>

        {image && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {(actionButton1 || actionButton2) && (
          <div className="flex gap-2 mt-3">
            {actionButton1 && (
              <Button size="sm" variant="outline" className="text-xs h-7">
                {actionButton1}
              </Button>
            )}
            {actionButton2 && (
              <Button size="sm" variant="outline" className="text-xs h-7">
                {actionButton2}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Chrome Desktop Notification - Slider (tipo toast)
  const ChromeNotificationSlider = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs animate-in slide-in-from-right">
      <div className="flex items-start gap-2">
        <img
          src={icon || defaultIcon}
          alt="Icon"
          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 text-xs truncate">
              {title}
            </h4>
            <button className="text-gray-400 hover:text-gray-600 ml-2">
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );

  const ChromeNotification = displayStyle === "popup" ? ChromeNotificationPopup : ChromeNotificationSlider;



  // Mobile Chrome Notification - Pop-up
  const MobileNotificationPopup = () => (
    <div className="relative">
      {/* Overlay oscuro para simular el efecto bloqueante */}
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div className="relative bg-gray-900 text-white p-4 max-w-xs rounded-lg shadow-2xl z-10">
        <div className="flex items-start gap-3">
          <img
            src={icon || defaultIcon}
            alt="Icon"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-white text-sm">
                {companyName}
              </h4>
              <span className="text-xs text-gray-400">2 min</span>
            </div>
            <p className="text-sm text-gray-300 mb-1 font-medium">
              {title}
            </p>
            <p className="text-sm text-gray-400 line-clamp-2">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {image && (
          <div className="mt-3 rounded overflow-hidden">
            <img
              src={image}
              alt="Notification"
              className="w-full h-24 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Chrome Notification - Slider
  const MobileNotificationSlider = () => (
    <div className="bg-gray-900 text-white p-3 max-w-xs rounded-lg shadow-lg animate-in slide-in-from-top">
      <div className="flex items-start gap-2">
        <img
          src={icon || defaultIcon}
          alt="Icon"
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-white text-xs">
              {companyName}
            </h4>
            <span className="text-xs text-gray-400">2 min</span>
          </div>
          <p className="text-xs text-gray-300 mb-1 font-medium">
            {title}
          </p>
          <p className="text-xs text-gray-400 line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );

  const MobileNotification = displayStyle === "popup" ? MobileNotificationPopup : MobileNotificationSlider;

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
                Desktop - {displayStyle === "popup" ? "Pop-up (Bloqueante)" : "Slider (Toast)"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayStyle === "popup"
                  ? "Notificación modal que requiere interacción del usuario"
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
                Mobile - {displayStyle === "popup" ? "Pop-up (Bloqueante)" : "Slider (Toast)"}
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