"use client";

import React from 'react';

interface WhatsAppPreviewProps {
  businessName?: string;
  productName?: string;
  productDescription?: string;
  originalPrice?: string;
  discountPrice?: string;
  discount?: string;
  headerText?: string;
  bodyText?: string;
  buttonText1?: string;
  buttonText2?: string;
  ctaText?: string;
  phoneNumber?: string;
}

const WhatsAppPreview = ({
  businessName = "Tu Tienda",
  productName = "Samsung Galaxy S25 Ultra",
  productDescription = "✨ Cámara profesional de 200MP\n🔋 Batería de 5000mAh\n📱 Pantalla Dynamic AMOLED 6.8\"",
  originalPrice = "$1.124.900",
  discountPrice = "$899.900",
  discount = "-20%",
  headerText = "🔥 ¡Oferta especial solo hoy!",
  bodyText = "🚚 Envío gratis a toda Colombia\n💳 Paga en 12 cuotas sin interés\n⚡ Disponible solo por tiempo limitado\n\n¿Te interesa este producto?",
  buttonText1 = "🛒 Comprar Ahora",
  buttonText2 = "ℹ️ Más Información",
  ctaText = "📞 Responde \"SÍ\" para más información\no llámanos al 📱 +57 300 123 4567",
  phoneNumber = "+57 300 123 4567"
}: WhatsAppPreviewProps) => {

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6">Preview</h2>

      {/* Phone Mockup */}
      <div className="relative mx-auto bg-black rounded-[3rem] p-2 shadow-2xl" style={{ width: '300px', height: '600px' }}>
        {/* Screen */}
        <div className="bg-[#0F172A] rounded-[2.5rem] h-full overflow-hidden relative">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-3 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{businessName}</div>
              <div className="text-xs text-green-100">en línea</div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3 bg-[#ECE5DD] overflow-y-auto" style={{ maxHeight: '400px' }}>

            {/* Main Product Message */}
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-sm p-3 shadow-sm max-w-[85%]">
                {/* Product Image Placeholder */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg h-24 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="text-white text-center">
                    <div className="text-xl mb-1">📱</div>
                    <div className="text-xs font-medium">{productName.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                  {discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {discount}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{productName}</h3>
                  <p className="text-gray-600 text-xs leading-tight">
                    {formatText(productDescription)}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-base font-bold text-green-600">{discountPrice}</span>
                      {originalPrice && (
                        <span className="text-xs text-gray-500 line-through ml-2">{originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-green-500 text-white py-1.5 rounded-lg font-medium text-xs">
                      {buttonText1}
                    </button>
                    <button className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg font-medium text-xs">
                      {buttonText2}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-2 text-right">14:32 ✓✓</div>
              </div>
            </div>

            {/* Header + Body Message */}
            {(headerText || bodyText) && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-sm p-3 shadow-sm max-w-[80%]">
                  {/* Header */}
                  {headerText && (
                    <div className="mb-2">
                      <p className="text-xs font-bold text-green-600">
                        {formatText(headerText)}
                      </p>
                    </div>
                  )}

                  {/* Body */}
                  {bodyText && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-800 leading-relaxed">
                        {formatText(bodyText)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-2">
                    <button className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium text-xs">
                      {buttonText1}
                    </button>
                    <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium text-xs">
                      {buttonText2}
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 mt-2 text-right">14:33 ✓✓</div>
                </div>
              </div>
            )}

            {/* CTA Message */}
            {ctaText && (
              <div className="flex justify-start">
                <div className="bg-green-50 border border-green-200 rounded-lg rounded-tl-sm p-3 max-w-[75%]">
                  <p className="text-xs text-green-800 text-center font-medium">
                    {formatText(ctaText)}
                  </p>
                  <div className="text-xs text-gray-400 mt-2 text-right">14:33 ✓</div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-[#F0F0F0] px-4 py-2 flex items-center">
            <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-gray-400">
              Escribe un mensaje...
            </div>
            <button className="ml-2 bg-[#075E54] w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">▶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreview;