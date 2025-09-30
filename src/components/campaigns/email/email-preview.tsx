interface EmailPreviewProps {
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  preheader?: string;
  headerImage?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  unsubscribeText?: string;
  companyName?: string;
  companyAddress?: string;
}

export function EmailPreview({
  subject = "Asunto del email",
  fromName = "Tu Empresa",
  fromEmail = "noreply@tuempresa.com",
  preheader = "Vista previa del contenido...",
  headerImage,
  title = "Título del Email",
  subtitle,
  content = "Contenido del email aquí...",
  buttonText,
  buttonUrl = "#",
  footerText,
  unsubscribeText = "Si no deseas recibir más emails, puedes darte de baja",
  companyName = "Tu Empresa",
  companyAddress = "123 Calle Principal, Ciudad, País"
}: EmailPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden shadow-lg">
      {/* Email Client Header */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {fromName.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-900">{fromName}</div>
              <div className="text-xs">{fromEmail}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Ahora</div>
        </div>
        <div className="mt-2">
          <div className="font-medium text-gray-900">{subject}</div>
          <div className="text-sm text-gray-600">{preheader}</div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white">
        {/* Header Image */}
        {headerImage && (
          <div className="w-full">
            <img
              src={headerImage}
              alt="Header"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <h2 className="text-lg text-gray-700 mb-6 text-center">
              {subtitle}
            </h2>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-8">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
            />
          </div>

          {/* CTA Button */}
          {buttonText && (
            <div className="text-center mb-8">
              <a
                href={buttonUrl}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {buttonText}
              </a>
            </div>
          )}

          {/* Footer Text */}
          {footerText && (
            <div className="text-sm text-gray-600 text-center mb-8 border-t pt-8">
              {footerText}
            </div>
          )}
        </div>

        {/* Email Footer */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 mb-2">
              {companyName}
            </div>
            <div className="text-xs text-gray-600 mb-4">
              {companyAddress}
            </div>
            <div className="text-xs text-gray-500">
              {unsubscribeText}{" "}
              <a href="#" className="text-blue-600 hover:underline">
                aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}