"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface TemplateVariablesProps {
  bodyText: string;
  headerText?: string;
  variableValues: Record<string, string>;
  onVariableValuesChange: (values: Record<string, string>) => void;
}

export function TemplateVariables({
  bodyText,
  headerText,
  variableValues,
  onVariableValuesChange,
}: TemplateVariablesProps) {
  // Extract all variables from body and header
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{\d+\}\}/g) || [];
    return [...new Set(matches)].sort();
  };

  const bodyVariables = extractVariables(bodyText || "");
  const headerVariables = extractVariables(headerText || "");
  const allVariables = [...new Set([...headerVariables, ...bodyVariables])].sort();

  if (allVariables.length === 0) {
    return null;
  }

  const handleChange = (variable: string, value: string) => {
    onVariableValuesChange({
      ...variableValues,
      [variable]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">
              Valores de Ejemplo para Variables
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define valores de ejemplo para ver cómo se verá tu mensaje
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allVariables.map((variable) => (
            <div key={variable}>
              <Label htmlFor={`var-${variable}`} className="text-xs">
                Variable {variable}
              </Label>
              <Input
                id={`var-${variable}`}
                placeholder={`Ejemplo: ${getDefaultPlaceholder(variable)}`}
                value={variableValues[variable] || ""}
                onChange={(e) => handleChange(variable, e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getDefaultPlaceholder(variable: string): string {
  const defaults: Record<string, string> = {
    "{{1}}": "Juan",
    "{{2}}": "Pérez",
    "{{3}}": "20%",
    "{{4}}": "hoy",
    "{{5}}": "producto",
    "{{6}}": "servicio",
    "{{7}}": "cuenta",
    "{{8}}": "pedido",
  };
  return defaults[variable] || "valor";
}
