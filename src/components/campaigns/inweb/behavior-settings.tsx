"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export interface BehaviorSettingsData {
  displayStyle: "popup" | "slider";
  enableFrequencyCap: boolean;
  maxPerDay: number;
  maxPerWeek: number;
  ttl: number;
  urgency: string;
}

interface BehaviorSettingsProps {
  data: BehaviorSettingsData;
  onChange: (data: BehaviorSettingsData) => void;
}

export function BehaviorSettings({ data, onChange }: BehaviorSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Comportamiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="displayStyle">Estilo de Presentación</Label>
          <Select
            value={data.displayStyle}
            onValueChange={(value: "popup" | "slider") =>
              onChange({ ...data, displayStyle: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popup">Pop-up (Bloqueante)</SelectItem>
              <SelectItem value="slider">Slider (Tipo Toast)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableFrequencyCap"
              checked={data.enableFrequencyCap}
              onCheckedChange={(checked) =>
                onChange({
                  ...data,
                  enableFrequencyCap: checked,
                })
              }
            />
            <Label htmlFor="enableFrequencyCap">
              Límite de frecuencia
            </Label>
          </div>
        </div>

        {data.enableFrequencyCap && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Máximo por día: {data.maxPerDay}</Label>
              <Slider
                value={[data.maxPerDay]}
                onValueChange={(value) =>
                  onChange({
                    ...data,
                    maxPerDay: value[0],
                  })
                }
                max={10}
                min={1}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Máximo por semana: {data.maxPerWeek}</Label>
              <Slider
                value={[data.maxPerWeek]}
                onValueChange={(value) =>
                  onChange({
                    ...data,
                    maxPerWeek: value[0],
                  })
                }
                max={50}
                min={1}
                step={1}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ttl">TTL (segundos)</Label>
            <Select
              value={data.ttl.toString()}
              onValueChange={(value) =>
                onChange({
                  ...data,
                  ttl: parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="120">120</SelectItem>
                <SelectItem value="180">180</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgencia</Label>
            <Select
              value={data.urgency}
              onValueChange={(value) =>
                onChange({ ...data, urgency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very-low">Muy Baja</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
