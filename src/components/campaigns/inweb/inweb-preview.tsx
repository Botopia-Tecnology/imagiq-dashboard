import { X } from "lucide-react";
import { memo } from "react";

interface InWebPreviewProps {
  image?: string;
  previewUrl?: string;
  displayStyle?: "popup" | "slider";
  contentType?: "image" | "html";
  htmlContent?: string;
  mode?: "desktop" | "mobile";
}

function InWebPreviewComponent({
  image,
  previewUrl = "",
  displayStyle = "popup",
  contentType = "image",
  htmlContent = "",
  mode = "desktop",
}: InWebPreviewProps) {
  const iframeUrl = previewUrl || "https://imagiq-frontend.vercel.app/";
  // Chrome Desktop Notification - Pop-up (bloqueante)
  const ChromeNotificationPopup = () => {
    const hasContent = (contentType === "html" && htmlContent) || image;

    return (
      <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
        {/* Contenedor del iframe con posición relativa para los elementos superpuestos */}
        <div className="relative w-full h-full overflow-hidden">
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Desktop Preview"
            style={{
              width: '200%',
              height: '200%',
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
            }}
          />
          {/* Overlay oscuro solo si hay contenido */}
          {hasContent && <div className="absolute inset-0 bg-black/30 rounded-lg" />}
          {/* Modal centrado solo si hay contenido */}
          {hasContent && (
            <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-md max-h-[calc(100%-4rem)]">
                {/* Botón de cerrar fuera del modal */}
                <button className="absolute -top-8 right-0 rounded-full p-1.5 hover:opacity-80 transition-opacity">
                  <X className="h-4 w-4 text-gray-800" />
                </button>
                {contentType === "html" && htmlContent ? (
                  <div
                    className="rounded-lg [&>*]:max-w-full [&_img]:max-w-full [&_img]:h-auto"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{ maxHeight: 'calc(400px - 8rem)', overflow: 'hidden' }}
                  />
                ) : image ? (
                  <div className="rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={image}
                      alt="Notification"
                      className="max-w-full max-h-[calc(400px-8rem)] object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Chrome Desktop Notification - Slider (tipo toast)
  const ChromeNotificationSlider = () => (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
      {/* Contenedor del iframe con posición relativa para los elementos superpuestos */}
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Desktop Preview"
          style={{
              width: '200%',
              height: '200%',
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
            }}
        />
        {/* Modal centrado en la parte superior */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 max-w-sm max-h-[calc(100%-2rem)]">
          <div className="relative ">
            <button className="absolute -top-7 right-0 rounded-full p-1.5 hover:opacity-80 transition-opacity">
                  <X className="h-4 w-4 text-gray-800" />
                </button>
            {contentType === "html" && htmlContent ? (
              <div
                className="rounded-lg [&>*]:max-w-full [&_img]:max-w-full [&_img]:h-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{ maxHeight: 'calc(400px - 4rem)', overflow: 'hidden' }}
              />
            ) : image ? (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Notification"
                  className="w-full h-auto object-contain max-h-40"
                />
              </div>
            ) : null}
          </div>
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
      <div className="relative w-full h-[600px] max-w-[375px] mx-auto rounded-xl flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
        {/* Contenedor del iframe con posición relativa para los elementos superpuestos */}
        <div className="relative w-full h-full">
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Mobile Preview"
          />
          {/* Overlay oscuro solo si hay contenido */}
          {hasContent && (
            <div className="absolute inset-0 bg-black/30 rounded-xl" />
          )}
          {/* Modal centrado solo si hay contenido */}
          {hasContent && (
            <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-[280px] max-h-[calc(100%-4rem)]">
                {/* Botón de cerrar fuera del modal */}
                <button className="absolute -top-5 right-0 rounded-full p-1 hover:opacity-80 transition-opacity">
                  <X className="h-3.5 w-3.5 text-gray-800" />
                </button>
                {contentType === "html" && htmlContent ? (
                  <div
                    className="rounded [&>*]:max-w-full [&_img]:max-w-full [&_img]:h-auto"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{ maxHeight: 'calc(600px - 8rem)', overflow: 'hidden' }}
                  />
                ) : image ? (
                  <div className="rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={image}
                      alt="Notification"
                      className="max-w-full max-h-[calc(600px-8rem)] object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile Chrome Notification - Slider
  const MobileNotificationSlider = () => (
    <div className="relative w-full h-[600px] max-w-[375px] mx-auto rounded-xl flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
      {/* Contenedor del iframe con posición relativa para los elementos superpuestos */}
      <div className="relative w-full h-full">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Mobile Preview"
        />
        {/* Modal en la parte superior, ajustado a los márgenes del celular */}
        <div className="absolute top-[8%] left-[12%] right-[12%] z-10 max-h-[calc(100%-10%)]">
          <div className="relative">
            {contentType === "html" && htmlContent ? (
              <div
                className="rounded [&>*]:max-w-full [&_img]:max-w-full [&_img]:h-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{ maxHeight: 'calc(600px - 12%)', overflow: 'hidden' }}
              />
            ) : image ? (
              <div className="rounded overflow-hidden">
                <img
                  src={image}
                  alt="Notification"
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const MobileNotification =
    displayStyle === "popup"
      ? MobileNotificationPopup
      : MobileNotificationSlider;

  // Renderizar solo el modo seleccionado
  if (mode === "desktop") {
    return <ChromeNotification />;
  }

  return <MobileNotification />;
}

export const InWebPreview = memo(InWebPreviewComponent);
