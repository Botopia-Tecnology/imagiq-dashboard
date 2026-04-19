"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Store,
  CreditCard,
  Building2,
  Wallet,
} from "lucide-react";
import { useKioskOrders, useKioskOrdersMetrics } from "@/hooks/use-kiosk-orders";
import {
  KioskOrder,
  KioskOrderEstado,
  getKioskEstadoColor,
  getKioskEstadoLabel,
} from "@/types/kiosk-orders";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string) => {
  try {
    return format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: es });
  } catch {
    return "—";
  }
};

const getPaymentIcon = (medio: KioskOrder["medio_pago"]) => {
  switch (medio) {
    case "Tarjeta":
      return CreditCard;
    case "PSE":
      return Building2;
    case "Addi":
      return Wallet;
    case "Datafono":
      return Store;
    default:
      return CreditCard;
  }
};

interface KioskOrdersTabProps {
  range: { from: Date; to: Date };
}

export function KioskOrdersTab({ range }: KioskOrdersTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");

  const {
    orders,
    pagination,
    isLoading,
    error,
    refetch,
    setParams,
    params,
  } = useKioskOrders({ page: 1, limit: 20 }, range);

  const { metrics, isLoading: metricsLoading, refetch: refetchMetrics } =
    useKioskOrdersMetrics(range);

  useEffect(() => {
    if (searchInput === debouncedSearch) return;
    const t = setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    setParams({ search: debouncedSearch || undefined });
  }, [debouncedSearch, setParams]);

  useEffect(() => {
    setParams({
      estado:
        estadoFilter === "all"
          ? undefined
          : (estadoFilter as KioskOrderEstado),
    });
  }, [estadoFilter, setParams]);

  const handleRefresh = () => {
    refetch();
    refetchMetrics();
  };

  const handlePrev = () => {
    if (pagination?.hasPrevPage && params.page && params.page > 1) {
      setParams({ page: params.page - 1 });
    }
  };

  const handleNext = () => {
    if (pagination?.hasNextPage) {
      setParams({ page: (params.page ?? 1) + 1 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <MetricCard
          label="Total órdenes"
          value={metrics.total_ordenes}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Aprobadas"
          value={metrics.total_aprobadas}
          isLoading={metricsLoading}
          tone="success"
        />
        <MetricCard
          label="Pendientes"
          value={metrics.total_pendientes}
          isLoading={metricsLoading}
          tone="warn"
        />
        <MetricCard
          label="Rechazadas"
          value={metrics.total_rechazadas}
          isLoading={metricsLoading}
          tone="danger"
        />
        <MetricCard
          label="Ingresos"
          value={formatCurrency(metrics.total_ingresos)}
          isLoading={metricsLoading}
          isText
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Órdenes Kiosko</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, tienda, serial, documento..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="APPROVED">Aprobada</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Esperando pago</SelectItem>
                <SelectItem value="REJECTED">Rechazada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                <SelectItem value="ABANDONED">Abandonada</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refrescar</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No se pudieron cargar las órdenes</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No hay órdenes kiosko en este rango.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => {
                    const Icon = getPaymentIcon(o.medio_pago);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">
                          {o.serial_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{o.cliente}</span>
                            <span className="text-xs text-muted-foreground">
                              {o.numero_documento}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {o.tienda_codigo ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {o.tienda_codigo}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {o.tienda_descripcion ?? ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {o.medio_pago ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(o.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getKioskEstadoColor(o.estado)}
                          >
                            {getKioskEstadoLabel(o.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(o.fecha_creacion)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ordenes/${o.id}`}>
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Detalle
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.total > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Página {pagination.page} de {pagination.totalPages} ·{" "}
                {pagination.total} orden{pagination.total === 1 ? "" : "es"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!pagination.hasPrevPage || isLoading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
  isText?: boolean;
  tone?: "success" | "warn" | "danger";
}

function MetricCard({ label, value, isLoading, isText, tone }: MetricCardProps) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "danger"
          ? "text-red-600 dark:text-red-400"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div
            className={`font-bold ${isText ? "text-lg" : "text-2xl"} ${toneClass}`}
          >
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
