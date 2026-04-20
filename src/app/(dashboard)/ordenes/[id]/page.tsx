"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOrderDetail } from "@/hooks/use-order-detail";
import {
  getApiOrderStatusLabel,
  getApiOrderStatusVariant,
  getApiOrderStatusColor,
} from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  User,
  FileText,
  Truck,
  Package,
  CreditCard,
  Activity,
  XCircle,
  MapPin,
  Building2,
  ShoppingBag,
  Gift,
  Mail,
  ExternalLink,
  Ban,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DetailSection } from "@/components/orders/detail/detail-section";
import { CopyField } from "@/components/orders/detail/copy-field";
import { JsonViewer } from "@/components/orders/detail/json-viewer";
import { TransactionTimeline } from "@/components/orders/detail/transaction-timeline";
import { PaymentResponseCards } from "@/components/orders/detail/payment-response-cards";
import { CommunicationsTimeline } from "@/components/orders/detail/communications-timeline";
import { ActionsMenu } from "@/components/orders/detail/actions-menu";

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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { detail, isLoading, error, refetch } = useOrderDetail(id);

  const [cancelGuiaOpen, setCancelGuiaOpen] = useState(false);
  const [cancelGuiaInput, setCancelGuiaInput] = useState("");
  const [cancelGuiaTarget, setCancelGuiaTarget] = useState("");
  const [cancelGuiaLoading, setCancelGuiaLoading] = useState(false);

  const openCancelGuiaModal = (numeroGuia: string) => {
    setCancelGuiaTarget(numeroGuia);
    setCancelGuiaInput("");
    setCancelGuiaOpen(true);
  };

  const handleCancelGuia = async () => {
    if (cancelGuiaInput !== cancelGuiaTarget) {
      toast.error("El número de guía no coincide");
      return;
    }
    setCancelGuiaLoading(true);
    try {
      await apiPost("/api/deliveries/coordinadora/anular-guia", {
        codigo_remision: cancelGuiaTarget,
      });
      toast.success(`Guía ${cancelGuiaTarget} anulada exitosamente`);
      setCancelGuiaOpen(false);
      refetch();
    } catch (err) {
      toast.error(
        `Error al anular guía: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setCancelGuiaLoading(false);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/ordenes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a órdenes
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el detalle</AlertTitle>
          <AlertDescription>
            {error?.message || "Orden no encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { order, customer, billing, shippingAddress, items, payment, envios, kiosk, pickup, session, rejection, transactionAttempts, beneficios, communications } = detail;
  const statusLabel = getApiOrderStatusLabel(order.estado);
  const statusVariant = getApiOrderStatusVariant(order.estado);
  const statusColor = getApiOrderStatusColor(order.estado);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/ordenes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a órdenes
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Orden #{order.serialId}
            </h1>
            <Badge variant={statusVariant} className={`gap-1 ${statusColor}`}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Creada el {formatDate(order.fechaCreacion)} · {formatCurrency(order.total)} · {order.medioPago || "sin método"} / {order.metodoEnvio || "sin envío"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
          <ActionsMenu detail={detail} onAnularGuia={openCancelGuiaModal} />
        </div>
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
              {rejection.codRespuesta != null && <span>Código respuesta: <span className="font-mono">{rejection.codRespuesta}</span></span>}
              {rejection.codError && <span>Código error: <span className="font-mono">{rejection.codError}</span></span>}
              {rejection.timestamp && <span>{formatDate(rejection.timestamp)}</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Resumen + Cliente + Facturación */}
        <div className="space-y-4 lg:col-span-2">
          <DetailSection title="Resumen de la orden" icon={ShoppingBag}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <CopyField label="# Orden" value={order.serialId} />
              <CopyField label="Orden ID" value={order.id} mono />
              <CopyField label="Total" value={formatCurrency(order.total)} />
              <CopyField label="Envío" value={formatCurrency(order.shipping)} />
              <CopyField label="Impuestos" value={order.taxes != null ? formatCurrency(order.taxes) : null} />
              <CopyField label="Moneda" value={order.currency} />
              <CopyField label="Medio de pago" value={order.medioPago} />
              <CopyField label="Método de envío" value={order.metodoEnvio} />
              <CopyField label="Fecha creación" value={formatDate(order.fechaCreacion)} />
              <CopyField label="Referencia interna" value={order.referencia} mono />
              <CopyField label="Transaction ID" value={order.transactionId} mono />
              <CopyField label="Cupón" value={order.couponCode} />
              {order.couponDiscount != null && order.couponDiscount > 0 && (
                <CopyField label="Descuento cupón" value={formatCurrency(order.couponDiscount)} />
              )}
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

          {billing && (
            <DetailSection title="Facturación" icon={FileText}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                <CopyField label="Tipo" value={billing.type} />
                <CopyField label="Nombre completo" value={billing.nombre_completo} />
                <CopyField label="Documento" value={`${billing.tipo_documento} ${billing.numero_documento}`} />
                <CopyField label="Email factura" value={billing.email} />
                <CopyField label="Teléfono factura" value={billing.telefono} />
                {billing.razon_social && billing.razon_social !== "N/A" && (
                  <CopyField label="Razón social" value={billing.razon_social} />
                )}
                {billing.nit && billing.nit !== "N/A" && (
                  <CopyField label="NIT" value={billing.nit} mono />
                )}
                {billing.representante_legal && billing.representante_legal !== "N/A" && (
                  <CopyField label="Representante legal" value={billing.representante_legal} />
                )}
                {billing.linea_uno && (
                  <CopyField className="col-span-2 sm:col-span-3" label="Dirección facturación" value={[billing.linea_uno, billing.complemento, billing.barrio, billing.ciudad, billing.departamento, billing.codigo_postal].filter(Boolean).join(", ")} />
                )}
              </div>
            </DetailSection>
          )}

          <DetailSection title={`Items (${items.length})`} icon={Package}>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 p-3 border rounded-md">
                  {it.picture_url ? (
                    <div className="relative h-16 w-16 shrink-0 rounded border overflow-hidden bg-muted">
                      <Image src={it.picture_url} alt={it.nombre} fill sizes="64px" className="object-contain" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded border flex items-center justify-center bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div className="col-span-2 sm:col-span-4">
                      <div className="font-medium truncate">{it.nombre}</div>
                      {it.desdetallada && it.desdetallada !== it.nombre && (
                        <div className="text-xs text-muted-foreground truncate">{it.desdetallada}</div>
                      )}
                    </div>
                    <div><span className="text-xs text-muted-foreground">SKU: </span><span className="font-mono text-xs">{it.sku}</span></div>
                    <div><span className="text-xs text-muted-foreground">Cantidad: </span>{it.cantidad}</div>
                    <div><span className="text-xs text-muted-foreground">Precio: </span>{formatCurrency(Number(it.unit_price))}</div>
                    <div><span className="text-xs text-muted-foreground">IVA: </span>{formatCurrency(Number(it.tax))}</div>
                    {it.categoria && (
                      <div><span className="text-xs text-muted-foreground">Categoría: </span>{it.categoria}</div>
                    )}
                    {it.ean && (
                      <div><span className="text-xs text-muted-foreground">EAN: </span><span className="font-mono text-xs">{it.ean}</span></div>
                    )}
                    {it.cod_campana && (
                      <div><span className="text-xs text-muted-foreground">Campaña: </span>{it.cod_campana}</div>
                    )}
                    {it.bundle_id && (
                      <div><span className="text-xs text-muted-foreground">Bundle: </span><span className="font-mono text-xs">{it.bundle_id}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          {beneficios != null && (
            <DetailSection title="Beneficios aplicados" icon={Gift}>
              <JsonViewer data={beneficios} title="beneficios" defaultOpen />
            </DetailSection>
          )}

          {(transactionAttempts.pse.length > 0 || transactionAttempts.card.length > 0) && (
            <DetailSection title="Respuesta del banco y la pasarela" icon={CreditCard}>
              <PaymentResponseCards
                pseAttempts={transactionAttempts.pse}
                cardAttempts={transactionAttempts.card}
              />
            </DetailSection>
          )}

          <DetailSection title="Historial / Intentos ePayco" icon={Activity}>
            {transactionAttempts.pse.length === 0 && transactionAttempts.card.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin intentos registrados para esta orden.</p>
            ) : (
              <TransactionTimeline
                pse={transactionAttempts.pse}
                card={transactionAttempts.card}
                rejection={rejection}
                orderCreatedAt={order.fechaCreacion}
                orderEstado={order.estado}
              />
            )}
          </DetailSection>

          <DetailSection title="Comunicaciones enviadas" icon={Mail}>
            <CommunicationsTimeline
              whatsapp={communications.whatsapp}
              emails={communications.emails}
            />
          </DetailSection>
        </div>

        {/* Columna lateral: Pago, Envío, Sesión */}
        <div className="space-y-4">
          <DetailSection title="Pago" icon={CreditCard}>
            <div className="space-y-3">
              <CopyField label="Método" value={payment.method} />
              {payment.pse && (
                <>
                  <CopyField label="Banco PSE" value={payment.pse.bank} />
                </>
              )}
              {payment.card && (
                <>
                  <CopyField label="Tarjeta (masked)" value={payment.card.masked} mono />
                  <CopyField label="Franquicia" value={payment.card.franchise} />
                  <CopyField label="Cuotas" value={payment.card.installments} />
                </>
              )}
            </div>
          </DetailSection>

          {shippingAddress && (
            <DetailSection title="Dirección de envío" icon={MapPin}>
              <div className="space-y-2">
                <CopyField label="Línea 1" value={shippingAddress.linea_uno} />
                {shippingAddress.complemento && <CopyField label="Complemento" value={shippingAddress.complemento} />}
                {shippingAddress.barrio && <CopyField label="Barrio" value={shippingAddress.barrio} />}
                <CopyField label="Ciudad" value={[shippingAddress.ciudad, shippingAddress.departamento].filter(Boolean).join(", ")} />
                {shippingAddress.codigo_postal && <CopyField label="Código postal" value={shippingAddress.codigo_postal} />}
                <CopyField label="País" value={shippingAddress.pais} />
                {shippingAddress.direccion_formateada && (
                  <CopyField label="Dirección formateada" value={shippingAddress.direccion_formateada} />
                )}
                {shippingAddress.google_url && (
                  <div className="pt-1">
                    <Button variant="outline" size="sm" asChild className="h-8">
                      <a href={shippingAddress.google_url} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-3 w-3 mr-1" />
                        Ver en Google Maps
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DetailSection>
          )}

          {envios.length > 0 && (
            <DetailSection title={`Envíos (${envios.length})`} icon={Truck}>
              <div className="space-y-3">
                {envios.map((e) => (
                  <div key={e.id} className="space-y-2 border rounded-md p-3">
                    <div className="flex items-center justify-between gap-2">
                      <CopyField label="Guía" value={e.numero_guia} mono />
                      <Badge variant={e.activo ? "default" : "outline"} className="text-xs">
                        {e.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    {e.tiempo_entrega_estimado && (
                      <CopyField label="Entrega estimada" value={e.tiempo_entrega_estimado} />
                    )}
                    {e.costoEnvioBase != null && (
                      <CopyField label="Costo base" value={formatCurrency(e.costoEnvioBase)} />
                    )}
                    {e.url_seguimiento && (
                      <Button variant="outline" size="sm" asChild className="h-8 w-full">
                        <a href={e.url_seguimiento} target="_blank" rel="noopener noreferrer">
                          Abrir tracking Coordinadora
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-full"
                      onClick={() => openCancelGuiaModal(e.numero_guia)}
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Cancelar guía
                    </Button>
                    {e.eventos.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-xs text-muted-foreground">Eventos</span>
                        <ul className="text-xs space-y-1">
                          {e.eventos.map((ev, i) => (
                            <li key={i} className="flex justify-between gap-2">
                              <span>{ev.evento}</span>
                              <span className="text-muted-foreground whitespace-nowrap">{formatDate(ev.time_stamp)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {kiosk && (
            <DetailSection title="Kiosko (venta asistida)" icon={Building2}>
              <div className="space-y-2">
                <CopyField label="Tienda" value={kiosk.store_descripcion} />
                <CopyField label="Código" value={kiosk.store_codigo} mono />
                <CopyField label="Ciudad" value={kiosk.store_ciudad} />
                <CopyField label="Dirección" value={kiosk.store_direccion} />
                <CopyField label="Teléfono" value={kiosk.store_telefono} />
                <CopyField label="Email" value={kiosk.store_email} />
                <CopyField label="Cod. bodega" value={kiosk.store_cod_bodega} />
                <CopyField label="Creado en kiosko" value={formatDate(kiosk.created_at)} />
              </div>
            </DetailSection>
          )}

          {pickup && (
            <DetailSection title="Recogida en tienda" icon={Package}>
              <div className="space-y-2">
                <CopyField label="Cod. bodega" value={pickup.codbodega} mono />
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={pickup.validado ? "default" : "outline"} className="text-xs">
                    Validado {pickup.validado ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={pickup.entregado ? "default" : "outline"} className="text-xs">
                    Entregado {pickup.entregado ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={pickup.activa ? "default" : "outline"} className="text-xs">
                    {pickup.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                {pickup.hora_recogida_autorizada && (
                  <CopyField label="Hora autorizada" value={pickup.hora_recogida_autorizada} />
                )}
                <CopyField label="Actualizado" value={formatDate(pickup.updated_at)} />
              </div>
            </DetailSection>
          )}

          <DetailSection title="Sesión & observabilidad" icon={Activity}>
            <div className="space-y-2">
              <CopyField label="IP del cliente" value={session.clientIp} mono />
              <CopyField
                label="PostHog session ID"
                value={session.posthogSessionId}
                mono
              />
              {session.posthogSessionId && (
                <>
                  <CopyField
                    label="PostHog — replay de sesión (URL)"
                    value={`${POSTHOG_PROJECT_URL}/replay/${session.posthogSessionId}`}
                    mono
                  />
                  <Button variant="outline" size="sm" asChild className="h-8 w-full">
                    <a
                      href={`${POSTHOG_PROJECT_URL}/replay/${session.posthogSessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Abrir replay
                    </a>
                  </Button>
                </>
              )}
              <CopyField label="Capturado en PostHog" value={formatDate(session.posthogCapturedAt)} />
              {customer.email && (
                <CopyField
                  label="PostHog — búsqueda por email (URL)"
                  value={`${POSTHOG_PROJECT_URL}/persons?search=${encodeURIComponent(customer.email)}`}
                  mono
                />
              )}
              {order.latitude && order.longitude && (
                <CopyField label="Lat/Lng" value={`${order.latitude}, ${order.longitude}`} mono />
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Modal cancelar guía */}
      <Dialog open={cancelGuiaOpen} onOpenChange={setCancelGuiaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar guía de Coordinadora</DialogTitle>
            <DialogDescription>
              Estás a punto de anular la guía <strong>{cancelGuiaTarget}</strong>.
              Esta acción no se puede deshacer. Escribe el número de guía para confirmar.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Número de guía"
            value={cancelGuiaInput}
            onChange={(e) => setCancelGuiaInput(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelGuiaOpen(false)}
              disabled={cancelGuiaLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelGuia}
              disabled={cancelGuiaInput !== cancelGuiaTarget || cancelGuiaLoading}
            >
              {cancelGuiaLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Anular guía
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
          <Skeleton className="h-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
