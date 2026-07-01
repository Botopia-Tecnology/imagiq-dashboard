"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useBodegaMetrics,
  BodegaMetrics,
} from "@/hooks/use-bodega-metrics";
import { Warehouse, Activity, AlertTriangle, RefreshCw, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Nota: esta página antes mostraba operarios, órdenes de trabajo y métricas de
// picking/packing que eran datos MOCK (no existe un modelo de operaciones de
// bodega en la base). Ahora solo muestra datos REALES: alertas de restock
// (clientes esperando stock) y actividad de envíos (eventos de guía).

const humanizeEvento = (evento: string, guia: string) => {
  const map: Record<string, string> = {
    ENTREGADA: `Guía ${guia} entregada`,
    "EN REPARTO": `Guía ${guia} en reparto`,
    "EN TERMINAL ORIGEN": `Guía ${guia} en terminal origen`,
    "EN TERMINAL DESTINO": `Guía ${guia} en terminal destino`,
    "ENTREGA FALLIDA": `Guía ${guia} — entrega fallida`,
    RECIBIDA: `Guía ${guia} recibida`,
  };
  return map[evento] ?? `${evento} — Guía ${guia}`;
};

const safeDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function BodegaPage() {
  const { getMetrics } = useBodegaMetrics();
  const [data, setData] = useState<BodegaMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getMetrics();
      setData(res);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading warehouse data:", error);
      toast.error("Error al cargar datos de bodega");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // refrescar cada 60s
    return () => clearInterval(interval);
  }, [loadData]);

  const alertas = data?.alertas ?? [];
  const actividad = data?.actividad ?? [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-8 w-8 text-blue-600" />
            Centro de Operaciones - Bodega
          </h1>
          <p className="text-muted-foreground">
            Restock solicitado y actividad de envíos en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <div className="text-sm text-muted-foreground">
              Última actualización:{" "}
              {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alertas de restock (clientes esperando stock, por SKU) */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Productos agotados con demanda ({data?.alertas_total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Cargando…" : "Sin solicitudes de restock pendientes."}
            </p>
          ) : (
            <div className="space-y-2">
              {alertas.map((a) => {
                const d = safeDate(a.ultima);
                return (
                  <div
                    key={a.sku}
                    className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
                  >
                    <div>
                      <span className="font-medium flex items-center gap-2">
                        <PackageSearch className="h-4 w-4" />
                        {a.sku}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {a.solicitudes}{" "}
                        {a.solicitudes === 1
                          ? "cliente esperando"
                          : "clientes esperando"}
                        {d
                          ? ` · última: ${formatDistanceToNow(d, {
                              addSuffix: true,
                              locale: es,
                            })}`
                          : ""}
                      </div>
                    </div>
                    <Badge variant="destructive">{a.solicitudes}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actividad reciente (eventos de envíos) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actividad.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Cargando…" : "Sin actividad de envíos reciente."}
            </p>
          ) : (
            <div className="space-y-3">
              {actividad.map((ev, index) => {
                const d = safeDate(ev.time_stamp);
                return (
                  <div
                    key={`${ev.numero_guia}-${index}`}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <span>{humanizeEvento(ev.evento, ev.numero_guia)}</span>
                      <div className="text-xs text-muted-foreground">
                        {d
                          ? formatDistanceToNow(d, { addSuffix: true, locale: es })
                          : ""}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ev.evento}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
