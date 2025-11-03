"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { WhatsAppTemplateForm } from "@/components/campaigns/whatsapp/template/template-form";
import { WhatsAppTemplatePreview } from "@/components/campaigns/whatsapp/template/template-preview";
import { TemplateVariables } from "@/components/campaigns/whatsapp/template/template-variables";
import { useState, useEffect } from "react";
import { mockWhatsAppTemplates } from "@/lib/mock-data";
import { WhatsAppTemplate } from "@/types";
import { toast } from "sonner";

export default function EditWhatsAppTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "MARKETING" as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    language: "es",
    header: {
      type: "NONE" as "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION",
      content: "",
    },
    body: "",
    footer: "",
    buttons: [] as Array<{
      id: number;
      type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL';
      text: string;
      phoneNumber?: string;
      url?: string;
    }>,
  });

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Find the template to edit
    const foundTemplate = mockWhatsAppTemplates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      setTemplateData({
        name: foundTemplate.name,
        category: foundTemplate.category,
        language: foundTemplate.language,
        header: foundTemplate.header,
        body: foundTemplate.body,
        footer: foundTemplate.footer,
        buttons: foundTemplate.buttons,
      });
    }
  }, [templateId]);

  const handleSaveTemplate = () => {
    // TODO: Implement save template logic
    console.log("Saving template:", templateData);
    toast.success("Plantilla actualizada correctamente");
    router.push("/marketing/campaigns/templates/whatsapp");
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Plantilla no encontrada</h2>
          <p className="text-muted-foreground mt-2">
            La plantilla que buscas no existe o ha sido eliminada.
          </p>
          <Link href="/marketing/campaigns/templates/whatsapp">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a plantillas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns/templates/whatsapp">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Editar Plantilla: {template.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Modifica los elementos de tu plantilla de WhatsApp
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
            Guardar Cambios
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
                  Modifica los campos necesarios para actualizar tu plantilla
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}