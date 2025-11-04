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
import { whatsappTemplateEndpoints } from "@/lib/api";
import { toast } from "sonner";

export default function CrearPlantillaWhatsAppPage() {
  const router = useRouter();
  const [templateData, setTemplateData] = useState<{
    name: string;
    category: string;
    language: string;
    header: {
      type: string;
      content: string;
    };
    body: string;
    footer: string;
    buttons: Array<{
      id: number;
      type: string;
      text: string;
      phoneNumber?: string;
      url?: string;
    }>;
  }>({
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

  const createExampleTemplate = () => {
    const exampleTemplate = {
      name: "pedido_confirmado",
      category: "MARKETING",
      language: "es",
      header: {
        type: "TEXT",
        content: "Pedido confirmado",
      },
      body: "Hola, {{1}}:\n\n¡Gracias por tu {{2}}! El número de pedido es {{3}}.\n\nEmpezaremos a preparar {{4}} para su envío.\n\nEntrega estimada: {{5}} \n\nTe avisaremos cuando se envíe el pedido.",
      footer: "Imagiq Store - Tu tienda de confianza",
      buttons: [
        {
          id: 1,
          type: "URL",
          text: "Ver detalles del pedido",
          url: "https://imagiq-frontend.vercel.app/{{1}}"
        }
      ],
    };

    const exampleVariables = {
      "{{1}}": "John",
      "{{2}}": "compra", 
      "{{3}}": "12345",
      "{{4}}": "2 paquetes de 12 rollos de papel de cocina Jasper's",
      "{{5}}": "1 de enero de 2024"
    };

    setTemplateData(exampleTemplate);
    setVariableValues(exampleVariables);
    toast.success("Plantilla de ejemplo cargada");
  };

  const createLocationExample = () => {
    const locationTemplate = {
      name: "ubicacion_tienda",
      category: "UTILITY",
      language: "es",
      header: {
        type: "LOCATION",
        content: "",
      },
      body: "¡Visítanos en nuestra tienda! Estamos ubicados en {{1}}. Horario de atención: {{2}}",
      footer: "Te esperamos",
      buttons: [
        {
          id: 1,
          type: "PHONE_NUMBER",
          text: "Llamar tienda",
          phoneNumber: "+57 300 123 4567"
        }
      ],
    };

    const locationVariables = {
      "{{1}}": "Centro Comercial Plaza Mayor",
      "{{2}}": "Lunes a Sábado 9:00 AM - 8:00 PM"
    };

    setTemplateData(locationTemplate);
    setVariableValues(locationVariables);
    toast.success("Plantilla de ubicación cargada");
  };

  const createImageExample = () => {
    const imageTemplate = {
      name: "promocion_producto",
      category: "MARKETING",
      language: "es",
      header: {
        type: "IMAGE",
        content: "https://example.com/promo-image.jpg",
      },
      body: "¡Oferta especial! {{1}} con {{2}}% de descuento. Solo hasta {{3}}. ¡No te lo pierdas!",
      footer: "Términos y condiciones aplican",
      buttons: [
        {
          id: 1,
          type: "URL",
          text: "Comprar ahora",
          url: "https://imagiq-frontend.vercel.app/productos/{{4}}"
        }
      ],
    };

    const imageVariables = {
      "{{1}}": "iPhone 15 Pro",
      "{{2}}": "20",
      "{{3}}": "31 de diciembre",
      "{{4}}": "iphone-15-pro"
    };

    setTemplateData(imageTemplate);
    setVariableValues(imageVariables);
    toast.success("Plantilla con imagen cargada");
  };

  const handleSaveTemplate = async () => {
    try {
      // Validaciones básicas
      if (!templateData.name || !/^([a-z0-9_]+)$/.test(templateData.name)) {
        toast.error("Nombre inválido. Usa minúsculas, números y guiones bajos.");
        return;
      }
      if (!templateData.body || templateData.body.trim().length === 0) {
        toast.error("El cuerpo del mensaje es requerido.");
        return;
      }

      // Verificar si ya existe una plantilla con el mismo nombre
      try {
        const existingTemplates = await whatsappTemplateEndpoints.getAll();
        if (existingTemplates.success && existingTemplates.data) {
          const nameExists = existingTemplates.data.some((template: any) => 
            template.name === templateData.name
          );
          if (nameExists) {
            toast.error(`Ya existe una plantilla con el nombre "${templateData.name}". Usa un nombre diferente.`);
            return;
          }
        }
      } catch (checkError) {
        console.warn("No se pudo verificar plantillas existentes:", checkError);
        // Continuar con la creación aunque no se pueda verificar
      }

      // Construir components según el esquema del backend con examples
      const components: any[] = [];

      // HEADER
      if (templateData.header?.type && templateData.header.type !== "NONE") {
        const headerComponent: any = { type: "HEADER", format: templateData.header.type };
        
        switch (templateData.header.type) {
          case "TEXT":
            headerComponent.text = templateData.header.content || "";
            // Agregar example para header de texto si tiene variables
            if (templateData.header.content && templateData.header.content.includes("{{")) {
              const headerVariables = templateData.header.content.match(/\{\{\d+\}\}/g);
              if (headerVariables && headerVariables.length > 0) {
                const headerExampleValues = [];
                for (let i = 1; i <= headerVariables.length; i++) {
                  const variableKey = `{{${i}}}`;
                  if (variableValues[variableKey]) {
                    headerExampleValues.push(variableValues[variableKey]);
                  } else {
                    headerExampleValues.push(`Ejemplo ${i}`);
                  }
                }
                headerComponent.example = {
                  header_text: headerExampleValues
                };
              }
            }
            break;
            
          case "IMAGE":
            // Para imágenes, el content puede ser una URL o variable
            if (templateData.header.content) {
              if (templateData.header.content.includes("{{")) {
                headerComponent.example = {
                  header_handle: ["https://example.com/image.jpg"]
                };
              }
            }
            break;
            
          case "VIDEO":
            // Para videos, similar a imágenes
            if (templateData.header.content) {
              if (templateData.header.content.includes("{{")) {
                headerComponent.example = {
                  header_handle: ["https://example.com/video.mp4"]
                };
              }
            }
            break;
            
          case "DOCUMENT":
            // Para documentos
            if (templateData.header.content) {
              if (templateData.header.content.includes("{{")) {
                headerComponent.example = {
                  header_handle: ["https://example.com/document.pdf"]
                };
              }
            }
            break;
            
          case "LOCATION":
            // Para ubicación, no necesita content pero puede tener example
            headerComponent.example = {
              header_location: {
                latitude: 37.7749,
                longitude: -122.4194,
                name: "San Francisco, CA",
                address: "San Francisco, CA, USA"
              }
            };
            break;
        }
        
        components.push(headerComponent);
      }

      // BODY (requerido)
      const bodyComponent: any = { type: "BODY", text: templateData.body };
      
      // Agregar examples para el body si tiene variables
      const bodyVariables = templateData.body.match(/\{\{\d+\}\}/g);
      if (bodyVariables && bodyVariables.length > 0) {
        // Crear examples basados en las variables del cuerpo
        const exampleValues = [];
        for (let i = 1; i <= bodyVariables.length; i++) {
          const variableKey = `{{${i}}}`;
          if (variableValues[variableKey]) {
            exampleValues.push(variableValues[variableKey]);
          } else {
            // Valores de ejemplo por defecto
            switch (i) {
              case 1: exampleValues.push("John"); break;
              case 2: exampleValues.push("compra"); break;
              case 3: exampleValues.push("12345"); break;
              case 4: exampleValues.push("2 paquetes de 12 rollos de papel de cocina Jasper's"); break;
              case 5: exampleValues.push("1 de enero de 2024"); break;
              default: exampleValues.push(`Ejemplo ${i}`); break;
            }
          }
        }
        bodyComponent.example = {
          body_text: [exampleValues]
        };
      }
      
      components.push(bodyComponent);

      // FOOTER
      if (templateData.footer && templateData.footer.trim().length > 0) {
        components.push({ type: "FOOTER", text: templateData.footer });
      }

      // BUTTONS (opcionales)
      if (Array.isArray(templateData.buttons) && templateData.buttons.length > 0) {
        const buttons = templateData.buttons.map((btn: any) => {
          const button: any = {
            type: btn.type,
            text: btn.text || ""
          };

          if (btn.type === "URL") {
            button.url = btn.url || "";
            // Agregar example para URL si tiene variables
            if (btn.url && btn.url.includes("{{")) {
              const urlVariables = btn.url.match(/\{\{\d+\}\}/g);
              if (urlVariables && urlVariables.length > 0) {
                // Reemplazar variables en la URL con valores de ejemplo
                let exampleUrl = btn.url;
                urlVariables.forEach((varKey: string) => {
                  const varNum = varKey.match(/\d+/)?.[0];
                  if (varNum) {
                    const variableKey = `{{${varNum}}}`;
                    const exampleValue = variableValues[variableKey] || `ejemplo-${varNum}`;
                    exampleUrl = exampleUrl.replace(varKey, exampleValue);
                  }
                });
                button.example = [exampleUrl];
              } else {
                button.example = [btn.url];
              }
            }
          } else if (btn.type === "PHONE_NUMBER") {
            button.phone_number = btn.phoneNumber || "";
          }

          return button;
        });
        components.push({ type: "BUTTONS", buttons });
      }

      const payload = {
        name: templateData.name,
        category: templateData.category as "MARKETING" | "UTILITY" | "AUTHENTICATION",
        language: templateData.language,
        components,
      };

      const response = await whatsappTemplateEndpoints.create(payload);
      if (response.success) {
        toast.success("Plantilla creada correctamente");
        router.push("/marketing/campaigns/templates/whatsapp");
      } else {
        toast.error(response.message || "No se pudo crear la plantilla");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor");
    }
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
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={createExampleTemplate}
              className="text-xs"
            >
              Ejemplo Texto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={createImageExample}
              className="text-xs"
            >
              Ejemplo Imagen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={createLocationExample}
              className="text-xs"
            >
              Ejemplo Ubicación
            </Button>
          </div>
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
