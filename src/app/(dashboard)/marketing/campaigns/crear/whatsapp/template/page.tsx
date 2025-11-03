"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Apple, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WhatsAppTemplateForm } from "@/components/campaigns/whatsapp/template/template-form";
import { WhatsAppTemplatePreview } from "@/components/campaigns/whatsapp/template/template-preview";
import { TemplateVariables } from "@/components/campaigns/whatsapp/template/template-variables";
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

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [selectedOS, setSelectedOS] = useState<'ios' | 'android'>('ios');

  const handleSaveTemplate = () => {
    // TODO: Implement save template logic
    console.log("Saving template:", templateData);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns/crear">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Plantilla de WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Diseña una plantilla de mensaje que podrás usar en tus campañas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedOS === 'ios' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOS('ios')}
            className="text-xs flex items-center gap-1"
          >
            <Apple className="h-3 w-3" />
            iOS
          </Button>
          <Button
            variant={selectedOS === 'android' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOS('android')}
            className="text-xs flex items-center gap-1"
          >
            <Smartphone className="h-3 w-3" />
            Android
          </Button>
          <Button size="sm" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Plantilla
          </Button>
        </div>
      </div>

      {/* Content - Grid with controlled heights */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid gap-4 lg:grid-cols-2 h-full">
          {/* Form Section */}
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            <Card className="flex flex-col flex-1 min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Configuración de Plantilla</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Completa todos los campos requeridos para crear tu plantilla
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <WhatsAppTemplateForm
                  templateData={templateData}
                  onTemplateDataChange={setTemplateData}
                />
              </CardContent>
            </Card>

            {/* Variable Values Section */}
            <div className="flex-shrink-0">
              <TemplateVariables
                bodyText={templateData.body}
                headerText={templateData.header.type === "TEXT" ? templateData.header.content : ""}
                variableValues={variableValues}
                onVariableValuesChange={setVariableValues}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="overflow-y-auto h-full">
            <WhatsAppTemplatePreview
              templateData={templateData}
              variableValues={variableValues}
              selectedOS={selectedOS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
