"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

export interface SchedulingSettingsData {
  sendImmediately: boolean;
  scheduledDate: Date | null;
  enableABTest: boolean;
}

interface SchedulingSettingsProps {
  data: SchedulingSettingsData;
  onChange: (data: SchedulingSettingsData) => void;
}

export function SchedulingSettings({ data, onChange }: SchedulingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Programación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="sendImmediately"
            checked={data.sendImmediately}
            onCheckedChange={(checked) =>
              onChange({
                ...data,
                sendImmediately: checked,
              })
            }
          />
          <Label htmlFor="sendImmediately">Enviar inmediatamente</Label>
        </div>

        {!data.sendImmediately && (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Fecha y Hora de Envío</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={
                  data.scheduledDate
                    ? new Date(
                        data.scheduledDate.getTime() -
                          data.scheduledDate.getTimezoneOffset() *
                            60000
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  onChange({
                    ...data,
                    scheduledDate: e.target.value
                      ? new Date(e.target.value)
                      : null,
                  })
                }
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="enableABTest"
            checked={data.enableABTest}
            onCheckedChange={(checked) =>
              onChange({ ...data, enableABTest: checked })
            }
          />
          <Label htmlFor="enableABTest">Habilitar prueba A/B</Label>
        </div>
      </CardContent>
    </Card>
  );
}
