"use client";
import { CategoryChart } from "@/components/charts/category-chart";
import { OverviewChart } from "@/components/charts/overview-chart";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TestFilterToggle } from "@/components/dashboard/test-filter-toggle";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics, OrderType } from "@/hooks/use-dashboard-metrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange, makeDefaultRange } from "@/types/date-range";
import { DashboardMetrics, PaymentMethod } from "@/types/dasboard";
import {
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function InicioPage() {
  const [range, setRange] = useState<DateRange>(() => makeDefaultRange());
  const [orderType, setOrderType] = useState<OrderType>("todos");
  const { getMetrics, excludeTest } = useDashboardMetrics(
    { from: range.from, to: range.to },
    orderType
  );
  const [metrics, setMetrics] = useState<DashboardMetrics>();

  const rangeFromMs = range.from.getTime();
  const rangeToMs = range.to.getTime();

  useEffect(() => {
    async function fetchMetrics() {
      const data = await getMetrics();
      setMetrics(data);
    }
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeTest, rangeFromMs, rangeToMs, orderType]);

  const currencyCOP = (v: number) =>
    Intl.NumberFormat("es-CO", {
      currency: "COP",
      style: "currency",
      maximumFractionDigits: 0,
    }).format(v || 0);

  // % REAL de facturación. Antes esta tarjeta mostraba `percent_difference`, que
  // es la variación en NÚMERO de órdenes (no en dinero) → engañoso: podía decir
  // "-13%" mientras la facturación en realidad subía. Se calcula sobre montos.
  const currentSales = Number(metrics?.sales?.current_sales ?? 0);
  const previousSales = Number(metrics?.sales?.previous_sales ?? 0);
  const salesPercent =
    previousSales > 0
      ? ((currentSales - previousSales) / previousSales) * 100
      : currentSales > 0
        ? 100
        : 0;

  // Variación en número de órdenes (esto SÍ es `percent_difference`).
  const ordersPercent = Number(metrics?.sales?.percent_difference ?? 0);

  // Ticket promedio real (reemplaza la "Tasa de Conversión" que era mock).
  const currentCount = Number(metrics?.sales?.current_count ?? 0);
  const ticketPromedio = currentCount > 0 ? currentSales / currentCount : 0;

  // Ventas por categoría REAL (orden_items.categoria). Mapea el código Samsung a
  // un nombre legible y calcula el % sobre el total del período.
  const CATEGORY_LABELS: Record<string, string> = {
    IM: "Dispositivos Móviles",
    AV: "TV y Audio",
    DA: "Electrodomésticos",
    IT: "Computación",
    OTROS: "Otros",
  };
  const categorySource = metrics?.salesByCategory ?? [];
  const categoryTotal = categorySource.reduce(
    (sum, c) => sum + Number(c.sales),
    0
  );
  const categoryData = categorySource.map((c) => ({
    name: CATEGORY_LABELS[c.categoria] ?? c.categoria,
    value:
      categoryTotal > 0
        ? Math.round((Number(c.sales) / categoryTotal) * 100)
        : 0,
    sales: Number(c.sales),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de tu e-commerce</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={orderType}
            onValueChange={(v) => setOrderType(v as OrderType)}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="soporte">Servicio Técnico</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeSelector value={range} onChange={setRange} />
          <TestFilterToggle />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ventas Totales"
          value={currencyCOP(currentSales)}
          description="Ingresos del período seleccionado"
          icon={DollarSign}
          trend={{
            value: salesPercent,
            label: "vs. período anterior",
          }}
        />
        <MetricCard
          title="Órdenes"
          value={currentCount}
          description="Órdenes procesadas en el período"
          icon={ShoppingCart}
          trend={{
            value: ordersPercent,
            label: "vs. período anterior",
          }}
        />
        <MetricCard
          title="Clientes"
          value={metrics?.newUsers.current_count ?? 0}
          description="Nuevos clientes en el período"
          icon={Users}
        />
        <MetricCard
          title="Ticket Promedio"
          value={currencyCOP(ticketPromedio)}
          description="Valor promedio por orden"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Sales Overview Chart */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={metrics?.monthlySales ?? []} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1 lg:col-span-3">
          <RecentActivity activities={metrics?.ordenes ?? []} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Category Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                Sin datos para el período seleccionado
              </div>
            ) : (
              <>
                <CategoryChart data={categoryData} />
                <div className="mt-4 space-y-2">
                  {categoryData.map((category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              "hsl(142, 76%, 36%)", // Verde principal
                              "hsl(120, 60%, 50%)", // Verde claro
                              "hsl(160, 70%, 40%)", // Verde azulado
                              "hsl(100, 65%, 45%)", // Verde amarillento
                              "hsl(180, 55%, 45%)", // Verde agua
                              "hsl(var(--muted-foreground))", // Fallback
                            ][index % 6],
                          }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{category.value}%</p>
                        <p className="text-xs text-muted-foreground">
                          {currencyCOP(category.sales)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.topProducts.map((product, index) => (
                <div
                  key={product.desdetallada}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {product.desdetallada}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.total_vendidos} ventas
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {Intl.NumberFormat("es-CO", {
                      currency: "COP",
                      style: "currency",
                      maximumFractionDigits: 0,
                    }).format(product.ingresos_generados)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const methods = metrics?.paymentMethods ?? [];
              const renderMethod = (method: PaymentMethod) => (
                <div
                  key={`${method.tipo ?? ""}-${method.nombre}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BrandIcon
                      brand={method.nombre}
                      size={20}
                      className="text-muted-foreground"
                    />
                    <div>
                      <p className="text-sm font-medium">{method.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.percent}% del total
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {Intl.NumberFormat("es-CO", {
                      currency: "COP",
                      style: "currency",
                      maximumFractionDigits: 0,
                    }).format(method.valor_vendido)}
                  </p>
                </div>
              );

              const ecommerce = methods.filter((m) => m.tipo === "ecommerce");
              const soporte = methods.filter((m) => m.tipo === "soporte");

              // Compatibilidad: si el backend no manda `tipo`, lista plana.
              if (ecommerce.length === 0 && soporte.length === 0) {
                return (
                  <div className="space-y-3">{methods.map(renderMethod)}</div>
                );
              }

              const renderGroup = (label: string, list: PaymentMethod[]) =>
                list.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    {list.map(renderMethod)}
                  </div>
                ) : null;

              return (
                <div className="space-y-5">
                  {renderGroup("Órdenes", ecommerce)}
                  {renderGroup("Órdenes de Soporte", soporte)}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
