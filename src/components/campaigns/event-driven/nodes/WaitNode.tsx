"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Timer, Webhook, Activity } from "lucide-react";
import {
  WaitNode as WaitNodeType,
  WaitConfig,
  WaitTriggerType,
} from "@/types/event-driven-campaigns";

interface WaitNodeData {
  waitType: WaitTriggerType;
  config: WaitConfig & { summary?: string };
  label: string;
  icon: { type: "brand" | "lucide"; name: string } | string;
  timeout?: {
    amount: number;
    unit: "minutes" | "hours" | "days";
  };
}

const WaitNode = memo(({ data, selected }: NodeProps<WaitNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [waitType, setWaitType] = useState<WaitTriggerType | "">("");
  const [config, setConfig] = useState<WaitConfig & { summary?: string }>(
    data.config || {}
  );

  const getWaitTypeIcon = (type: WaitTriggerType | "") => {
    switch (type) {
      case "time_delay":
        return <Timer className="h-6 w-6" />;
      case "wait_for_event":
        return <Activity className="h-6 w-6" />;
      case "wait_for_webhook":
        return <Webhook className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  const getWaitTypeLabel = (type: WaitTriggerType | "") => {
    const labels = {
      time_delay: "Tiempo",
      wait_for_event: "Evento",
      wait_for_webhook: "Webhook",
    };
    return type ? labels[type] : "Sin tipo";
  };

  const [rawExpectedData, setRawExpectedData] = useState(
  JSON.stringify(config.wait_for_webhook?.expectedData || {}, null, 2)
);


  const generateSummary = (
    type: WaitTriggerType | "",
    currentConfig: WaitConfig
  ): string => {
    if (!type) return "Sin configurar";
    switch (type) {
      case "time_delay":
        if (currentConfig.time_delay) {
          const { amount, unit } = currentConfig.time_delay;
          const unitLabel = {
            minutes: "min",
            hours: "hrs",
            days: "días",
          }[unit];
          return `${amount} ${unitLabel}`;
        }
        return "Sin configurar";
      case "wait_for_event":
        if (currentConfig.wait_for_event?.eventName) {
          const parts = [currentConfig.wait_for_event.eventName];
          if (currentConfig.wait_for_event.timeout) {
            const { amount, unit } = currentConfig.wait_for_event.timeout;
            const unitLabel = {
              minutes: "min",
              hours: "hrs",
              days: "días",
            }[unit];
            parts.push(` ${amount}${unitLabel}`);
          }
          return parts.join(" ");
        }
        return "Sin evento";
      case "wait_for_webhook":
        if (currentConfig.wait_for_webhook?.webhookUrl) {
          return currentConfig.wait_for_webhook?.webhookUrl;
        }
        return "Sin URL";
      default:
        return "Sin configurar";
    }
  };

  const renderConfigForm = () => {
    switch (waitType) {
      case "time_delay":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={config.time_delay?.amount || ""}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      time_delay: {
                        ...config.time_delay,
                        amount: parseInt(e.target.value) || 0,
                        unit: config.time_delay?.unit || "minutes",
                      },
                    };
                    newConfig.summary = generateSummary(waitType, newConfig);
                    setConfig(newConfig);
                  }}
                  placeholder="Ej: 30"
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Select
                  value={config.time_delay?.unit || "minutes"}
                  onValueChange={(value: "minutes" | "hours" | "days") => {
                    const newConfig = {
                      ...config,
                      time_delay: {
                        ...config.time_delay,
                        amount: config.time_delay?.amount || 0,
                        unit: value,
                      },
                    };
                    newConfig.summary = generateSummary(waitType, newConfig);
                    setConfig(newConfig);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "wait_for_event":
        return (
          <div className="space-y-4">
            <div>
              <Label>Nombre del Evento</Label>
              <Input
                value={config.wait_for_event?.eventName || ""}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    wait_for_event: {
                      ...config.wait_for_event,
                      eventName: e.target.value,
                    },
                  };
                  newConfig.summary = generateSummary(waitType, newConfig);
                  setConfig(newConfig);
                }}
                placeholder="Ej: user_clicked_email"
              />
            </div>

            <div className="space-y-2">
              <Label>Timeout (opcional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={config.wait_for_event?.timeout?.amount || ""}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      wait_for_event: {
                        ...config.wait_for_event,
                        eventName: config.wait_for_event?.eventName || "",
                        timeout: {
                          amount: parseInt(e.target.value) || 0,
                          unit: config.wait_for_event?.timeout?.unit || "hours",
                        },
                      },
                    };
                    newConfig.summary = generateSummary(waitType, newConfig);
                    setConfig(newConfig);
                  }}
                  placeholder="24"
                />
                <Select
                  value={config.wait_for_event?.timeout?.unit || "hours"}
                  onValueChange={(value: "minutes" | "hours" | "days") => {
                    const newConfig = {
                      ...config,
                      wait_for_event: {
                        ...config.wait_for_event,
                        eventName: config.wait_for_event?.eventName || "",
                        timeout: {
                          amount: config.wait_for_event?.timeout?.amount || 24,
                          unit: value,
                        },
                      },
                    };
                    newConfig.summary = generateSummary(waitType, newConfig);
                    setConfig(newConfig);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "wait_for_webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label>URL del Webhook</Label>
              <Input
                value={config.wait_for_webhook?.webhookUrl || ""}
                onChange={(e) => {
                  const newConfig = {
                    ...config,
                    wait_for_webhook: {
                      ...config.wait_for_webhook,
                      webhookUrl: e.target.value,
                    },
                  };
                  newConfig.summary = generateSummary(waitType, newConfig);
                  setConfig(newConfig);
                }}
                placeholder="https://api.ejemplo.com/webhook"
              />
            </div>

            <div>
              <Label>Datos Esperados (JSON)</Label>
              <Textarea
                value={rawExpectedData}
                onChange={(e) => {
                  const text = e.target.value;
                  setRawExpectedData(text);

                  try {
                    const parsed = JSON.parse(text);
                    const newConfig = {
                      ...config,
                      wait_for_webhook: {
                        ...config.wait_for_webhook,
                        webhookUrl: config.wait_for_webhook?.webhookUrl || "",
                        expectedData: parsed,
                      },
                    };
                    newConfig.summary = generateSummary(waitType, newConfig);
                    setConfig(newConfig);
                  } catch {
                    // El usuario aún no terminó de escribir JSON válido. No hacemos nada.
                  }
                }}
                placeholder='{"status": "completed"}'
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return (
        <div className="text-center text-muted-foreground py-4">
          Primero selecciona un tipo de espera
        </div>
      );
    }
  };

  const isConfigured = () => {
    switch (waitType) {
      case "time_delay":
        return config.time_delay && config.time_delay.amount > 0;
      case "wait_for_event":
        return config.wait_for_event?.eventName;
      case "wait_for_webhook":
        return config.wait_for_webhook?.webhookUrl;
      default:
        return false;
    }
  };

  const getBackgroundColor = () => {
    if (!isConfigured()) {
      return "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800";
    }
    return "bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50";
  };

  return (
    <>
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${
            selected
              ? "border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${getBackgroundColor()}
        `}
        onDoubleClick={() => setIsConfigOpen(true)}
        style={{ width: "140px", minHeight: "100px" }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white dark:border-gray-800"
        />

        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="w-3 h-3 !bg-green-500 border-2 border-white dark:border-gray-800"
          style={{ top: "60%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="w-3 h-3 !bg-red-500 border-2 border-white dark:border-gray-800"
          style={{ top: "80%" }}
        />

        <div className="absolute -right-12 top-[55%] text-xs text-green-600 dark:text-green-400 font-medium">
          Sí
        </div>
        <div className="absolute -right-12 top-[75%] text-xs text-red-600 dark:text-red-400 font-medium">
          No
        </div>

        <div className="p-3 h-full flex flex-col items-center justify-center gap-1.5">
          
          <div
            className={
              isConfigured()
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            {getWaitTypeIcon(waitType)}
          </div>
          <span
            className={`text-xs font-medium text-center ${
              isConfigured()
                ? "text-purple-700 dark:text-purple-300"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {getWaitTypeLabel(waitType)}
          </span>
          <div
            className={`text-xs text-center px-2 leading-tight ${
              isConfigured()
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-500"
            }`}
          >
            {config.summary || generateSummary(waitType, config)}
          </div>
        </div>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurar 
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tipo de Espera</Label>
              <Select
                value={waitType ||''}
                onValueChange={(value: WaitTriggerType) => {
                  setWaitType(value);
                  const newConfig = { summary: generateSummary(value, {}) };
                  setConfig(newConfig);
                }}
              >
                <SelectTrigger>
                  <SelectValue  placeholder="Seleccionar tipo de espera"  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_delay">Esperar Tiempo</SelectItem>
                  <SelectItem value="wait_for_event">Esperar Evento</SelectItem>
                  <SelectItem value="wait_for_webhook">
                    Esperar Webhook
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderConfigForm()}

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

WaitNode.displayName = "WaitNode";

export { WaitNode };
