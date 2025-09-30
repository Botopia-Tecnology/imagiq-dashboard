"use client";

import React, { useState } from 'react';
import { CampaignForm } from '@/components/campaigns/whatsapp/campaign-form';
import WhatsAppPreview from '@/components/campaigns/whatsapp/whatsapp-preview';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function WhatsAppCampaignPage() {
  const router = useRouter();

  const [previewData, setPreviewData] = useState({
    businessName: "Tu Tienda",
    productName: "Samsung Galaxy S25 Ultra",
    productDescription: "✨ Cámara profesional de 200MP\n🔋 Batería de 5000mAh\n📱 Pantalla Dynamic AMOLED 6.8\"",
    originalPrice: "$1.124.900",
    discountPrice: "$899.900",
    discount: "-20%",
    headerText: "🔥 ¡Oferta especial solo hoy!",
    bodyText: "🚚 Envío gratis a toda Colombia\n💳 Paga en 12 cuotas sin interés\n⚡ Disponible solo por tiempo limitado\n\n¿Te interesa este producto?",
    buttonText1: "🛒 Comprar Ahora",
    buttonText2: "ℹ️ Más Información",
    ctaText: "📞 Responde \"SÍ\" para más información\no llámanos al 📱 +57 300 123 4567",
    phoneNumber: "+57 300 123 4567"
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Campaña WhatsApp</h1>
          <p className="text-muted-foreground">
            Configura tu campaña de WhatsApp con preview en tiempo real
          </p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <CampaignForm
            previewData={previewData}
            setPreviewData={setPreviewData}
          />
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <WhatsAppPreview {...previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}