"use client";

import { CardAttempt, PseAttempt } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "./json-viewer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

type AnyAttempt =
  | (PseAttempt & { kind: "pse" })
  | (CardAttempt & { kind: "card" });

interface Props {
  pse: PseAttempt[];
  card: CardAttempt[];
  rejection: { timestamp: string } | null;
  orderCreatedAt: string;
  orderEstado: string;
}

function iconFor(estado: string | null) {
  if (!estado) return AlertCircle;
  if (estado === "Rechazada" || estado === "REJECTED") return XCircle;
  if (estado === "Aceptada" || estado === "APPROVED") return CheckCircle2;
  if (estado === "Pendiente" || estado === "PENDING") return Clock;
  return AlertCircle;
}

function badgeVariantFor(estado: string | null): "default" | "destructive" | "secondary" | "outline" {
  if (estado === "Rechazada") return "destructive";
  if (estado === "Aceptada") return "default";
  if (estado === "Pendiente") return "secondary";
  return "outline";
}

export function TransactionTimeline({ pse, card, orderCreatedAt, orderEstado }: Props) {
  const all: AnyAttempt[] = [
    ...pse.map((a) => ({ ...a, kind: "pse" as const })),
    ...card.map((a) => ({ ...a, kind: "card" as const })),
  ].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const events: Array<{
    timestamp: string;
    title: string;
    description?: string;
    estado?: string | null;
    attempt?: AnyAttempt;
    isFinal?: boolean;
  }> = [
    {
      timestamp: orderCreatedAt,
      title: "Orden creada",
      description: "Registrada en el sistema",
    },
    ...all.map((a) => ({
      timestamp: a.created_at,
      title: a.kind === "pse" ? "Consulta ePayco PSE" : "Consulta ePayco Tarjeta",
      description: a.respuesta || a.estado || "Sin respuesta",
      estado: a.estado,
      attempt: a,
    })),
  ];

  if (orderEstado && all.length > 0) {
    const last = all[all.length - 1];
    events.push({
      timestamp: last.created_at,
      title: `Estado final: ${orderEstado}`,
      estado: orderEstado,
      isFinal: true,
    });
  }

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {events.map((e, idx) => {
          const Icon = iconFor(e.estado ?? null);
          return (
            <div key={idx} className="relative pl-8">
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{e.title}</span>
                    {e.estado && (
                      <Badge variant={badgeVariantFor(e.estado)} className="text-xs">
                        {e.estado}
                      </Badge>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {format(new Date(e.timestamp), "dd MMM yyyy, HH:mm:ss", { locale: es })}
                </span>
              </div>
              {e.attempt && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {e.attempt.banco && (
                      <div>
                        <span className="text-muted-foreground">Banco: </span>
                        <span className="font-medium">{e.attempt.banco}</span>
                      </div>
                    )}
                    {e.attempt.cod_respuesta != null && (
                      <div>
                        <span className="text-muted-foreground">Cod: </span>
                        <span className="font-mono">{e.attempt.cod_respuesta}</span>
                      </div>
                    )}
                    {e.attempt.autorizacion && (
                      <div>
                        <span className="text-muted-foreground">Autorización: </span>
                        <span className="font-mono">{e.attempt.autorizacion}</span>
                      </div>
                    )}
                    {e.attempt.ref_payco && (
                      <div>
                        <span className="text-muted-foreground">Ref ePayco: </span>
                        <span className="font-mono">{e.attempt.ref_payco}</span>
                      </div>
                    )}
                  </div>
                  {e.attempt.raw_response !== null && e.attempt.raw_response !== undefined ? (
                    <JsonViewer
                      data={e.attempt.raw_response}
                      title={`raw_response · ${e.attempt.kind === "pse" ? "PSE" : "Tarjeta"}`}
                      downloadName={`epayco-${e.attempt.id}.json`}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
