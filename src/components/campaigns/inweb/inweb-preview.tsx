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
  const ChromeNotificationPopup = () => {
    const hasContent = (contentType === "html" && htmlContent) || image;

    return (
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
        {/* Imagen de fondo con blur condicional para popup */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/compu2.jpg"
            alt=""
            className={`w-full h-full object-contain ${hasContent ? "blur-sm" : ""}`}
          />
        </div>
        {/* Overlay oscuro solo si hay contenido */}
        {hasContent && <div className="absolute inset-0 bg-black/30" />}
        {/* Modal centrado solo si hay contenido */}
        {hasContent && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm">
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
        )}
      </div>
    );
  };

  // Chrome Desktop Notification - Slider (tipo toast)
  const ChromeNotificationSlider = () => (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
      {/* Imagen de fondo sin blur para slider */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/compu.jpg"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      {/* Modal en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm">
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
    </div>
  );

  const ChromeNotification =
    displayStyle === "popup"
      ? ChromeNotificationPopup
      : ChromeNotificationSlider;

  // Mobile Chrome Notification - Pop-up
  const MobileNotificationPopup = () => {
    const hasContent = (contentType === "html" && htmlContent) || image;

    return (
      <div className="relative w-full h-[600px] max-w-[375px] mx-auto rounded-lg">
        {/* Contenedor para limitar la imagen base */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
          <img src="/cell.jpg" alt="" className="h-full w-auto object-contain rounded-xl" />
        </div>
        {/* Capa con blur limitada */}
        {hasContent && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
            <img src="/cell.jpg" alt="" className="h-full w-auto object-contain blur-sm rounded-xl" />
          </div>
        )}
        {/* Overlay oscuro solo si hay contenido */}
        {hasContent && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
            <div className="h-full w-auto aspect-[9/19.5] bg-black/30 rounded-xl" />
          </div>
        )}
        {/* Modal centrado solo si hay contenido */}
        {hasContent && (
          <div className="absolute inset-0 flex items-center justify-center z-10 px-[15%] py-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4 w-full max-w-xs">
              {contentType === "html" && htmlContent ? (
                <div
                  className="rounded overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : image ? (
                <div className="rounded overflow-hidden">
                  <img
                    src={image}
                    alt="Notification"
                    className="w-full h-32 object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile Chrome Notification - Slider
  const MobileNotificationSlider = () => (
    <div className="relative w-full h-[600px] max-w-[375px] mx-auto rounded-lg">
      {/* Contenedor para limitar la imagen */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
        <img src="/cell.jpg" alt="" className="h-full w-auto object-contain rounded-xl" />
      </div>
      {/* Modal en la parte superior, ajustado a los márgenes del celular */}
      <div className="absolute top-[8%] left-[12%] right-[12%] z-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-3">
          {contentType === "html" && htmlContent ? (
            <div
              className="rounded overflow-hidden"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : image ? (
            <div className="rounded overflow-hidden">
              <img
                src={image}
                alt="Notification"
                className="w-full h-32 object-cover"
              />
            </div>
          ) : null}
        </div>
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
