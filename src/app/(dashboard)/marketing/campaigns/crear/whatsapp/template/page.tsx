"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WhatsAppTemplateForm } from "@/components/campaigns/whatsapp/template/template-form";
import { WhatsAppTemplatePreview } from "@/components/campaigns/whatsapp/template/template-preview";
import { useState } from "react";

export default function CrearPlantillaWhatsAppPage() {
  const router = useRouter();
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "MARKETING",
    language: "es",
    header: {
      type: "NONE",
      content: "",
    },
    body: "",
    footer: "",
    buttons: [],
  });

  const handleSaveTemplate = () => {
    // TODO: Implement save template logic
    console.log("Saving template:", templateData);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns/crear">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Plantilla de WhatsApp</h1>
            <p className="text-muted-foreground">
              Diseña una plantilla de mensaje que podrás usar en tus campañas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button size="sm" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Plantilla
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Plantilla</CardTitle>
            <p className="text-sm text-muted-foreground">
              Completa todos los campos requeridos para crear tu plantilla
            </p>
          </CardHeader>
          <CardContent>
            <WhatsAppTemplateForm
              templateData={templateData}
              onTemplateDataChange={setTemplateData}
            />
          </CardContent>
        </Card>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <WhatsAppTemplatePreview templateData={templateData} />
        </div>
      </div>
    </div>
  );
}
