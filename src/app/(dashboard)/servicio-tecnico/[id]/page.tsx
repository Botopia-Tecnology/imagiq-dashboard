"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupportOrderDetail } from "@/hooks/use-support-order-detail";
import {
  getSupportStatusColor,
  getSupportStatusLabel,
  getSupportStatusVariant,
  type SupportOrderStatus,
} from "@/types/support-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  User,
  CreditCard,
  Activity,
  XCircle,
  Mail,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DetailSection } from "@/components/orders/detail/detail-section";
import { CopyField } from "@/components/orders/detail/copy-field";
import { TransactionTimeline } from "@/components/orders/detail/transaction-timeline";
import { CommunicationsTimeline } from "@/components/orders/detail/communications-timeline";
import { PaymentResponseCards } from "@/components/orders/detail/payment-response-cards";

const POSTHOG_PROJECT_URL =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_URL ||
  "https://us.posthog.com/project/274592";

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "dd MMM yyyy, HH:mm:ss", { locale: es });
  } catch {
    return "—";
  }
}

export default function SupportOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { detail, isLoading, error, refetch } = useSupportOrderDetail(id);

  if (isLoading) return <DetailSkeleton />;

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/servicio-tecnico")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a tickets
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el detalle</AlertTitle>
          <AlertDescription>
            {error?.message || "Ticket de soporte no encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { order, customer, payment, transactionAttempts, communications, rejection } = detail;
  const statusKey = (order.estadoPago as SupportOrderStatus) ?? "PENDING";
  const statusLabel = getSupportStatusLabel(statusKey);
  const statusVariant = getSupportStatusVariant(statusKey);
  const statusColor = getSupportStatusColor(statusKey);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/servicio-tecnico">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a tickets
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ticket #{order.ordenNumero}
            </h1>
            <Badge variant={statusVariant} className={`gap-1 ${statusColor}`}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Creado el {formatDate(order.fechaCreacion)} · {formatCurrency(order.total)} · {order.medioPago || "sin método"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Refrescar</span>
        </Button>
      </div>

      {/* Rechazo destacado */}
      {rejection && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Motivo de rechazo</AlertTitle>
          <AlertDescription className="space-y-1">
            <p className="font-medium">{rejection.respuesta || "Sin mensaje"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {rejection.banco && <span>Banco: <span className="font-medium">{rejection.banco}</span></span>}
              {rejection.codRespuesta != null && <span>Código gateway: <span className="font-mono">{rejection.codRespuesta}</span></span>}
              {rejection.codError && <span>Código emisor: <span className="font-mono">{rejection.codError}</span></span>}
              {rejection.timestamp && <span>{formatDate(rejection.timestamp)}</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen + Cliente + Pago side-by-side */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DetailSection title="Resumen del ticket" icon={Wrench}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <CopyField label="# Ticket" value={order.ordenNumero} />
              <CopyField label="ID interno" value={order.id} mono />
              <CopyField label="Total" value={formatCurrency(order.total)} />
              <CopyField label="Estado ticket" value={order.estado} />
              <CopyField label="Estado pago" value={order.estadoPago} />
              <CopyField label="Medio pago" value={order.medioPago} />
              <CopyField label="Ref ePayco" value={order.referencia} mono />
              <CopyField label="Creado" value={formatDate(order.fechaCreacion)} />
              <CopyField label="Actualizado" value={formatDate(order.fechaActualizacion)} />
            </div>
          </DetailSection>

          <DetailSection title="Cliente" icon={User}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <CopyField label="Nombre" value={`${customer.nombre} ${customer.apellido ?? ""}`.trim()} />
              <CopyField label="Email" value={customer.email} />
              <CopyField label="Teléfono" value={customer.telefono ? `${customer.codigoPais ?? ""} ${customer.telefono}`.trim() : null} />
              <CopyField label="Documento" value={customer.numeroDocumento ? `${customer.tipoDocumento} ${customer.numeroDocumento}` : null} />
              <CopyField label="Usuario ID" value={customer.id} mono />
              <CopyField label="Registrado" value={formatDate(customer.fechaCreacion)} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Verificaciones</span>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={customer.emailVerificado ? "default" : "outline"} className="text-xs">
                    Email {customer.emailVerificado ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={customer.telefonoVerificado ? "default" : "outline"} className="text-xs">
                    Tel {customer.telefonoVerificado ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-4">
          <DetailSection title="Pago" icon={CreditCard}>
            <div className="space-y-3">
              <CopyField label="Método" value={payment.method} />
              {payment.pse && <CopyField label="Banco PSE" value={payment.pse.banco} />}
              {payment.card && (
                <>
                  <CopyField label="Tarjeta (últimos 4)" value={`**** **** **** ${payment.card.last_four}`} mono />
                  <CopyField label="Franquicia" value={payment.card.franquicia} />
                </>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Respuesta del banco + ePayco */}
      {(transactionAttempts.pse.length > 0 || transactionAttempts.card.length > 0) && (
        <DetailSection title="Respuesta del banco y la pasarela" icon={CreditCard}>
          <PaymentResponseCards
            pseAttempts={transactionAttempts.pse}
            cardAttempts={transactionAttempts.card}
          />
        </DetailSection>
      )}

      {/* Historial */}
      <DetailSection title="Historial / Intentos ePayco" icon={Activity}>
        {transactionAttempts.pse.length === 0 && transactionAttempts.card.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin intentos registrados para este ticket.</p>
        ) : (
          <TransactionTimeline
            pse={transactionAttempts.pse}
            card={transactionAttempts.card}
            rejection={rejection}
            orderCreatedAt={order.fechaCreacion}
            orderEstado={order.estadoPago}
          />
        )}
      </DetailSection>

      {/* Comunicaciones */}
      <DetailSection title="Comunicaciones enviadas" icon={Mail}>
        <CommunicationsTimeline
          whatsapp={communications.whatsapp}
          emails={communications.emails}
        />
      </DetailSection>

      {/* Observabilidad */}
      <DetailSection title="Observabilidad" icon={Activity}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" asChild className="h-9">
            <a
              href={`${POSTHOG_PROJECT_URL}/persons?search=${encodeURIComponent(customer.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Buscar persona en PostHog
            </a>
          </Button>
        </div>
      </DetailSection>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-12 w-80" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40" />
        </div>
      </div>
      <Skeleton className="h-60" />
    </div>
  );
}
