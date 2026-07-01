"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { supportOrdersColumns } from "@/components/tables/columns/support-orders-columns";
import { SupportMetricsCards } from "@/components/support-orders/support-metrics-cards";
import { SupportMetricsChart } from "@/components/support-orders/support-metrics-chart";
import { TestFilterToggle } from "@/components/dashboard/test-filter-toggle";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { DateRange, makeDefaultRange } from "@/types/date-range";
import { useSupportOrders } from "@/hooks/use-support-orders";
import { useSupportOrdersMetrics } from "@/hooks/use-support-orders-metrics";
import { SupportOrderSortField, SortOrder } from "@/types/support-orders";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ServicioTecnicoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [range, setRange] = useState<DateRange>(() => makeDefaultRange());

  const { orders, pagination, isLoading, error, refetch, setParams, params } =
    useSupportOrders(
      {
        page: 1,
        limit: 20,
        sortField: "fecha_creacion",
        sortOrder: "desc",
      },
      { from: range.from, to: range.to }
    );

  const {
    metrics,
    statusDistribution,
    paymentMethodDistribution,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useSupportOrdersMetrics({ from: range.from, to: range.to });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const estado = order.estado_pago ?? "PENDING";
      switch (activeTab) {
        case "approved":
          return estado === "APPROVED";
        case "pending":
          return estado === "PENDING";
        case "rejected":
          return estado === "REJECTED";
        default:
          return true;
      }
    });
  }, [orders, activeTab]);

  // Contadores por pestaña desde la distribución por estado del endpoint de
  // métricas (cubre todo el rango), no `orders`, que es solo la página actual.
  const tabCounts = useMemo(() => {
    const countFor = (estados: Array<string | null>) =>
      statusDistribution
        .filter((s) => estados.includes((s.estado_pago as string | null) ?? null))
        .reduce((sum, s) => sum + Number(s.cantidad), 0);
    return {
      all: statusDistribution.reduce((sum, s) => sum + Number(s.cantidad), 0),
      approved: countFor(["APPROVED"]),
      pending: countFor(["PENDING", null, ""]),
      rejected: countFor(["REJECTED"]),
    };
  }, [statusDistribution]);

  const tableFilters = [
    {
      id: "estado_pago",
      title: "Estado",
      options: [
        { label: "Aprobado", value: "APPROVED" },
        { label: "Pendiente", value: "PENDING" },
        { label: "Rechazado", value: "REJECTED" },
      ],
    },
    {
      id: "medio_pago",
      title: "Medio de Pago",
      options: [
        { label: "Tarjeta", value: "Tarjeta" },
        { label: "PSE", value: "PSE" },
      ],
    },
  ];

  useEffect(() => {
    if (searchQuery === "" && debouncedSearch === "") return;
    if (searchQuery === debouncedSearch) return;

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch === "" && params.search === undefined) return;
    setParams({ search: debouncedSearch || undefined });
  }, [debouncedSearch, setParams, params.search]);

  const handlePaginationChange = useCallback(
    ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      setParams({
        page: pageIndex + 1,
        limit: pageSize,
      });
    },
    [setParams]
  );

  const handleRefresh = () => {
    refetch();
    refetchMetrics();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Servicio Técnico
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y monitorea los pagos de servicio técnico
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          <DateRangeSelector value={range} onChange={setRange} />
          <TestFilterToggle />
          <Button
            variant="outline"
            onClick={handleRefresh}
            size="sm"
            className="sm:h-10"
            disabled={isLoading || metricsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 sm:mr-2 ${
                isLoading || metricsLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {(error || metricsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>
            {error?.message || metricsError?.message}. Por favor intenta
            refrescar la página.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      <SupportMetricsCards metrics={metrics} isLoading={metricsLoading} />

      {/* Charts */}
      <SupportMetricsChart
        statusDistribution={statusDistribution}
        paymentMethodDistribution={paymentMethodDistribution}
        isLoading={metricsLoading}
      />

      {/* Filters Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, cliente, documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setDebouncedSearch(searchQuery);
                  }
                }}
                className="pl-9 pr-9"
              />
              {searchQuery !== debouncedSearch && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <Select
              value={params.sortField || "fecha_creacion"}
              onValueChange={(value) =>
                setParams({ sortField: value as SupportOrderSortField })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha_creacion">
                  Fecha de creación
                </SelectItem>
                <SelectItem value="orden_numero">Número de orden</SelectItem>
                <SelectItem value="total">Monto total</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="estado_pago">Estado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={params.sortOrder || "desc"}
              onValueChange={(value) =>
                setParams({ sortOrder: value as SortOrder })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes primero</SelectItem>
                <SelectItem value="asc">Más antiguos primero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs with Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-3"
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="all" className="whitespace-nowrap">
              Todos
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="whitespace-nowrap">
              Aprobados
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.approved}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">
              Pendientes
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="whitespace-nowrap">
              Rechazados
              <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
                {tabCounts.rejected}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "Todos los tickets"}
                {activeTab === "approved" && "Tickets aprobados"}
                {activeTab === "pending" && "Tickets pendientes"}
                {activeTab === "rejected" && "Tickets rechazados"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={supportOrdersColumns}
                data={filteredOrders}
                searchKey="cliente"
                filters={tableFilters}
                loading={isLoading}
                pageCount={pagination?.totalPages}
                pageIndex={(params.page || 1) - 1}
                pageSize={params.limit || 20}
                totalItems={pagination?.total}
                onPaginationChange={handlePaginationChange}
                initialColumnVisibility={{
                  fecha_creacion: false,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination Info */}
      {pagination && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando página {pagination.page} de {pagination.totalPages} (
          {pagination.total} tickets en total)
        </div>
      )}
    </div>
  );
}
