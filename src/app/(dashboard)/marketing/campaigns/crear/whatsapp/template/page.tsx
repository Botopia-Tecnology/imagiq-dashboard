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

/**
 * Extrae las variables de un texto en formato {{1}}, {{2}}, etc.
 * @param text - Texto que puede contener variables
 * @returns Array de números de variables encontradas, ordenados
 */
function extractVariables(text: string): number[] {
  const matches = text.match(/\{\{(\d+)\}\}/g);
  if (!matches) return [];
  
  return matches
    .map(match => parseInt(match.replace(/\{|\}/g, '')))
    .filter((v, i, arr) => arr.indexOf(v) === i) // Eliminar duplicados
    .sort((a, b) => a - b);
}

/**
 * Construye el component BODY con su example si tiene variables
 * @param bodyText - Texto del cuerpo del mensaje
 * @param variableValues - Valores de ejemplo para las variables
 * @returns Component BODY con structure correcta
 */
function buildBodyComponent(
  bodyText: string,
  variableValues: Record<string, string>
): any {
  const component: any = {
    type: "BODY",
    text: bodyText
  };

  const variables = extractVariables(bodyText);
  
  if (variables.length > 0) {
    const exampleValues = variables.map(varNum => {
      const key = `{{${varNum}}}`;
      return variableValues[key] || `Ejemplo ${varNum}`;
    });
    
    // IMPORTANTE: body_text debe ser un array de arrays
    component.example = {
      body_text: [exampleValues]
    };
  }

  return component;
}

/**
 * Construye el component HEADER con su example si es necesario
 * @param headerType - Tipo de header (TEXT, IMAGE, VIDEO, etc.)
 * @param headerContent - Contenido del header
 * @param variableValues - Valores de ejemplo para las variables
 * @returns Component HEADER con structure correcta o null si es NONE
 */
function buildHeaderComponent(
  headerType: string,
  headerContent: string,
  variableValues: Record<string, string>
): any | null {
  if (!headerType || headerType === "NONE") {
    return null;
  }

  const component: any = {
    type: "HEADER",
    format: headerType
  };

  switch (headerType) {
    case "TEXT":
      component.text = headerContent || "";
      
      const variables = extractVariables(headerContent);
      if (variables.length > 0) {
        const exampleValues = variables.map(varNum => {
          const key = `{{${varNum}}}`;
          return variableValues[key] || `Ejemplo ${varNum}`;
        });
        
        // IMPORTANTE: header_text es un array simple (no anidado)
        component.example = {
          header_text: exampleValues
        };
      }
      break;

    case "IMAGE":
    case "VIDEO":
    case "DOCUMENT":
      // Para media, siempre incluir example con URL de ejemplo
      component.example = {
        header_handle: [headerContent || "https://example.com/media"]
      };
      break;

    case "LOCATION":
      // Para ubicación, incluir coordenadas de ejemplo
      component.example = {
        header_location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: "Ubicación de ejemplo",
          address: "Dirección de ejemplo"
        }
      };
      break;
  }

  return component;
}

/**
 * Construye el component BUTTONS con examples para URLs dinámicas
 * @param buttons - Array de botones del formulario
 * @param variableValues - Valores de ejemplo para las variables
 * @returns Component BUTTONS con structure correcta o null si no hay botones
 */
function buildButtonsComponent(
  buttons: Array<any>,
  variableValues: Record<string, string>
): any | null {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  const formattedButtons = buttons.map(btn => {
    const button: any = {
      type: btn.type,
      text: btn.text || ""
    };

    if (btn.type === "URL") {
      button.url = btn.url || "";
      
      // Si la URL tiene variables, agregar example
      const variables = extractVariables(btn.url);
      if (variables.length > 0) {
        let exampleUrl = btn.url;
        variables.forEach(varNum => {
          const key = `{{${varNum}}}`;
          const value = variableValues[key] || `ejemplo-${varNum}`;
          exampleUrl = exampleUrl.replace(key, value);
        });
        
        // IMPORTANTE: example para URL es un array simple
        button.example = [exampleUrl];
      }
    } else if (btn.type === "PHONE_NUMBER") {
      button.phone_number = btn.phoneNumber || "";
    }

    return button;
  });

  return {
    type: "BUTTONS",
    buttons: formattedButtons
  };
}

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
      name: "order_confirmation",
      category: "UTILITY",
      language: "en",
      header: {
        type: "TEXT",
        content: "Order Confirmed",
      },
      body: "Hi {{1}}, your order {{2}} has been successfully confirmed and is being processed by our team. You will receive a notification once it ships to {{3}}. Expected delivery date is {{4}}. Thank you for shopping with us and trusting our service!",
      footer: "Imagiq Store - We appreciate your business",
      buttons: [
        {
          id: 1,
          type: "URL",
          text: "Track Order",
          url: "https://imagiq-frontend.vercel.app/orders/{{2}}"
        }
      ],
    };

    const exampleVariables = {
      "{{1}}": "John",
      "{{2}}": "ORD-12345", 
      "{{3}}": "123 Main Street",
      "{{4}}": "January 15, 2024"
    };

    setTemplateData(exampleTemplate);
    setVariableValues(exampleVariables);
    toast.success("Plantilla de ejemplo cargada");
  };

  const createLocationExample = () => {
    const locationTemplate = {
      name: "store_location",
      category: "UTILITY",
      language: "en",
      header: {
        type: "LOCATION",
        content: "",
      },
      body: "Visit us at our store! We are located at {{1}} and would love to welcome you. Our business hours are {{2}}. Come discover our latest products and enjoy personalized service from our friendly team.",
      footer: "We look forward to seeing you",
      buttons: [
        {
          id: 1,
          type: "PHONE_NUMBER",
          text: "Call Store",
          phoneNumber: "+1 234 567 8900"
        }
      ],
    };

    const locationVariables = {
      "{{1}}": "123 Main Street, Downtown",
      "{{2}}": "Monday to Saturday 9:00 AM - 8:00 PM"
    };

    setTemplateData(locationTemplate);
    setVariableValues(locationVariables);
    toast.success("Plantilla de ubicación cargada");
  };

  const createImageExample = () => {
    const imageTemplate = {
      name: "special_offer",
      category: "MARKETING",
      language: "en",
      header: {
        type: "IMAGE",
        content: "https://example.com/promo-image.jpg",
      },
      body: "Hello {{1}}! We have an exclusive offer for you: Get {{2}} off on {{3}}. This limited-time promotion is our way of thanking you for being a valued customer. Don't miss out on this amazing deal! Visit our store or shop online at {{4}}.",
      footer: "Terms and conditions apply",
      buttons: [
        {
          id: 1,
          type: "URL",
          text: "Shop Now",
          url: "https://imagiq-frontend.vercel.app/products/{{4}}"
        }
      ],
    };

    const imageVariables = {
      "{{1}}": "Maria",
      "{{2}}": "20%",
      "{{3}}": "all electronics",
      "{{4}}": "electronics-sale"
    };

    setTemplateData(imageTemplate);
    setVariableValues(imageVariables);
    toast.success("Plantilla con imagen cargada");
  };

  const handleSaveTemplate = async () => {
    try {
      // Validación 1: Nombre de plantilla
      if (!templateData.name || !/^[a-z0-9_]+$/.test(templateData.name)) {
        toast.error("Nombre inválido. Usa solo minúsculas, números y guiones bajos (_)");
        return;
      }
      
      if (templateData.name.length < 3 || templateData.name.length > 512) {
        toast.error("El nombre debe tener entre 3 y 512 caracteres");
        return;
      }
      
      // Validación 2: Body requerido
      if (!templateData.body || templateData.body.trim().length === 0) {
        toast.error("El cuerpo del mensaje es requerido");
        return;
      }

      // Validación 3: Idioma en formato correcto
      if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(templateData.language)) {
        toast.error('Formato de idioma inválido. Usa: es, en, pt_BR, es_MX, etc.');
        return;
      }

      // Validación 4: Ratio variables vs texto (CRÍTICO para Meta API)
      const bodyVariables = (templateData.body.match(/\{\{\d+\}\}/g) || []).length;
      const bodyWordCount = templateData.body.trim().split(/\s+/).length;
      
      const minWordsRequired: Record<number, number> = {
        1: 15,
        2: 25,
        3: 40,
        4: 60,
        5: 60
      };

      if (bodyVariables > 0) {
        const minWords = minWordsRequired[bodyVariables] || 60;
        if (bodyWordCount < minWords) {
          toast.error(
            `El mensaje es muy corto para ${bodyVariables} variable(s). ` +
            `Necesitas al menos ${minWords} palabras (tienes ${bodyWordCount}). ` +
            `Agrega más texto descriptivo.`
          );
          return;
        }
      }

      // Verificar duplicados
      try {
        const existingTemplates = await whatsappTemplateEndpoints.getAll();
        if (existingTemplates.success && existingTemplates.data) {
          const nameExists = existingTemplates.data.some((template: any) => 
            template.name === templateData.name
          );
          if (nameExists) {
            toast.error(`Ya existe una plantilla con el nombre "${templateData.name}".`);
            return;
          }
        }
      } catch (checkError) {
        console.warn("No se pudo verificar plantillas existentes:", checkError);
      }

      // Construir components usando funciones auxiliares
      const components: any[] = [];

      // HEADER
      const headerComponent = buildHeaderComponent(
        templateData.header?.type,
        templateData.header?.content,
        variableValues
      );
      if (headerComponent) {
        components.push(headerComponent);
      }

      // BODY (requerido)
      const bodyComponent = buildBodyComponent(templateData.body, variableValues);
      components.push(bodyComponent);

      // FOOTER
      if (templateData.footer && templateData.footer.trim().length > 0) {
        components.push({
          type: "FOOTER",
          text: templateData.footer
        });
      }

      // BUTTONS
      const buttonsComponent = buildButtonsComponent(templateData.buttons, variableValues);
      if (buttonsComponent) {
        components.push(buttonsComponent);
      }

      // Construir payload final
      const payload = {
        name: templateData.name,
        category: templateData.category as "MARKETING" | "UTILITY" | "AUTHENTICATION",
        language: templateData.language,
        components,
      };

      // Log para debugging
      console.log("Payload a enviar:", JSON.stringify(payload, null, 2));

      // Enviar al backend
      const response = await whatsappTemplateEndpoints.create(payload);
      
      if (response.success) {
        toast.success("Plantilla creada correctamente");
        router.push("/marketing/campaigns/templates/whatsapp");
      } else {
        toast.error(response.message || "No se pudo crear la plantilla");
      }
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
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
