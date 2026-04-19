"use client";

import { CardAttempt, PseAttempt } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyField } from "./copy-field";
import { JsonViewer } from "./json-viewer";
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Cpu,
  CreditCard,
} from "lucide-react";
import {
  EPAYCO_RESPONSE_CODES,
  lookupIso8583,
} from "@/lib/iso-8583-codes";

interface Props {
  pseAttempts: PseAttempt[];
  cardAttempts: CardAttempt[];
}

type AnyAttempt =
  | (PseAttempt & { kind: "pse" })
  | (CardAttempt & { kind: "card" });

function getLatestAttempt(
  pse: PseAttempt[],
  card: CardAttempt[],
): AnyAttempt | null {
  const all: AnyAttempt[] = [
    ...pse.map((a) => ({ ...a, kind: "pse" as const })),
    ...card.map((a) => ({ ...a, kind: "card" as const })),
  ];
  if (!all.length) return null;
  return all.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

function extractTx(rawResponse: unknown): Record<string, unknown> | null {
  if (!rawResponse || typeof rawResponse !== "object") return null;
  const wrapper = rawResponse as Record<string, unknown>;
  const outer = (wrapper.data as Record<string, unknown> | undefined) ?? wrapper;
  const tx = (outer?.transaction as Record<string, unknown> | undefined) ?? null;
  if (tx && typeof tx === "object") return tx;
  if (outer && typeof outer === "object") return outer;
  return null;
}

function statusTone(estado: string | null | undefined): {
  variant: "default" | "destructive" | "secondary" | "outline";
  label: string;
} {
  const raw = (estado ?? "").toLowerCase();
  if (raw.includes("acept") || raw.includes("aprob")) {
    return { variant: "default", label: estado ?? "Aceptada" };
  }
  if (raw.includes("rechaz") || raw.includes("fail")) {
    return { variant: "destructive", label: estado ?? "Rechazada" };
  }
  if (raw.includes("pend")) {
    return { variant: "secondary", label: estado ?? "Pendiente" };
  }
  return { variant: "outline", label: estado ?? "—" };
}

function severityClass(severity: "info" | "warning" | "error"): string {
  switch (severity) {
    case "info":
      return "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-100";
    case "warning":
      return "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100";
    case "error":
      return "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-100";
  }
}

/**
 * Splits a payment attempt into two views:
 * - ePayco (gateway) response — what our acquirer/gateway says.
 * - Bank (issuer) response — what the cardholder's bank says.
 *
 * Follows the pattern Stripe/Adyen/PayPal use: separate gateway result
 * from network/issuer result so operators can diagnose at the right layer.
 * Decorates bank errorCode with an ISO 8583 human explanation and an
 * ops-facing hint (resolve at first glance, no external lookup).
 */
export function PaymentResponseCards({ pseAttempts, cardAttempts }: Props) {
  const attempt = getLatestAttempt(pseAttempts, cardAttempts);
  if (!attempt) return null;

  const tx = extractTx(attempt.raw_response);
  const isCard = attempt.kind === "card";

  // ---- ePayco (gateway) layer ----
  const gatewayStatus =
    (tx?.status as string | undefined) ??
    attempt.estado ??
    null;
  const gatewayCode =
    (tx?.codeResponse as number | string | undefined) ??
    (tx?.codTransactionState as number | string | undefined) ??
    attempt.cod_respuesta ??
    null;
  const gatewayReason =
    (tx?.responseReasonText as string | undefined) ??
    attempt.respuesta ??
    null;
  const gatewayLabel =
    typeof gatewayCode === "number"
      ? EPAYCO_RESPONSE_CODES[gatewayCode]
      : typeof gatewayCode === "string" && /^\d+$/.test(gatewayCode)
        ? EPAYCO_RESPONSE_CODES[Number(gatewayCode)]
        : null;
  const gatewayTone = statusTone(gatewayStatus);
  const invoice = (tx?.invoice as string | undefined) ?? attempt.factura ?? null;
  const refPayco = (tx?.refPayco as string | number | undefined) ?? attempt.ref_payco ?? null;
  const clientIp = (tx?.ip as string | undefined) ?? attempt.ip ?? null;
  const testMode = (tx?.testMode as string | undefined) ?? null;

  // ---- Bank / issuer layer (card only) ----
  const bankName =
    (tx?.bank as string | undefined) ?? attempt.banco ?? null;
  const cardLast4 = isCard ? ((tx?.cardNumber as string | undefined) ?? null) : null;
  const franchise = isCard
    ? ((tx?.franchise as string | undefined) ?? (attempt as CardAttempt).franquicia ?? null)
    : null;
  const bankErrorCode = isCard
    ? ((tx?.errorCode as string | number | undefined) ??
        (attempt as CardAttempt).cod_error ??
        null)
    : null;
  const authorization =
    (tx?.autorizacion as string | undefined) ?? attempt.autorizacion ?? null;
  const isoEntry = lookupIso8583(bankErrorCode);
  const networkCode = isCard ? ((attempt as CardAttempt).cc_network_code ?? null) : null;
  const networkMessage = isCard
    ? ((attempt as CardAttempt).cc_network_message ?? null)
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ePayco (gateway) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Respuesta de ePayco
          </CardTitle>
          <Badge variant={gatewayTone.variant}>{gatewayTone.label}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <CopyField
              label="Gateway state"
              value={gatewayStatus ?? "—"}
            />
            <CopyField
              label="Code"
              value={
                gatewayCode != null
                  ? `${gatewayCode}${gatewayLabel ? ` · ${gatewayLabel}` : ""}`
                  : "—"
              }
              mono
            />
            <CopyField
              className="col-span-2"
              label="Mensaje"
              value={gatewayReason ?? "—"}
            />
            <CopyField label="Factura" value={invoice} mono />
            <CopyField label="Ref ePayco" value={refPayco != null ? String(refPayco) : null} mono />
            <CopyField label="IP del cliente" value={clientIp} mono />
            {testMode && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Modo prueba</span>
                <Badge variant={testMode === "TRUE" ? "secondary" : "outline"} className="w-fit text-xs">
                  {testMode === "TRUE" ? "TEST" : "PROD"}
                </Badge>
              </div>
            )}
          </div>
          <JsonViewer
            data={attempt.raw_response}
            title="raw response (ePayco)"
            downloadName={`epayco-${attempt.id}.json`}
          />
        </CardContent>
      </Card>

      {/* Bank / issuer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isCard ? (
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
            Respuesta del banco {isCard ? "emisor" : "(PSE)"}
          </CardTitle>
          {authorization ? (
            <Badge variant={authorization !== "000000" ? "default" : "destructive"} className="gap-1">
              {authorization !== "000000" ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              Auth: {authorization}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <CopyField label="Banco" value={bankName} />
            {isCard && (
              <>
                <CopyField label="Franquicia" value={franchise} />
                <CopyField label="Tarjeta" value={cardLast4} mono />
                <CopyField
                  label="Código error emisor"
                  value={bankErrorCode != null ? String(bankErrorCode) : null}
                  mono
                />
              </>
            )}
            <CopyField label="Autorización" value={authorization} mono />
            {isCard && networkCode != null && (
              <CopyField label="Código red" value={networkCode} mono />
            )}
            {isCard && networkMessage && (
              <CopyField className="col-span-2" label="Mensaje red" value={networkMessage} />
            )}
          </div>

          {isoEntry && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${severityClass(isoEntry.severity)}`}
            >
              <p className="font-medium">{isoEntry.label}</p>
              {isoEntry.customerHint && (
                <p className="text-xs mt-1 opacity-90">
                  <span className="font-medium">Cliente: </span>
                  {isoEntry.customerHint}
                </p>
              )}
              {isoEntry.opsHint && (
                <p className="text-xs mt-1 opacity-90">
                  <span className="font-medium">Operación: </span>
                  {isoEntry.opsHint}
                </p>
              )}
            </div>
          )}

          {!isoEntry && bankErrorCode != null && (
            <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              Código del emisor{" "}
              <span className="font-mono">{String(bankErrorCode)}</span>{" "}
              no está en nuestro catálogo ISO 8583. Consulta directamente con el
              banco si el cliente solicita más información.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
