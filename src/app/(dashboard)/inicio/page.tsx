import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { OverviewChart } from "@/components/charts/overview-chart"
import { CategoryChart } from "@/components/charts/category-chart"
import { BrandIcon } from "@/components/icons/BrandIcon"
import { IconTest } from "@/components/icons/IconTest"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  CreditCard
} from "lucide-react"
import {
  mockDashboardMetrics,
  mockSalesData,
  mockCategoryData,
  mockPaymentMethodData,
  mockTopProducts,
  mockRecentActivity,
} from "@/lib/mock-data"

export default function InicioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista general de tu e-commerce
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ventas Totales"
          value={`$${mockDashboardMetrics.totalSales.toLocaleString()}`}
          description="Total de ingresos este mes"
          icon={DollarSign}
          trend={{
            value: mockDashboardMetrics.salesGrowth,
            label: "desde el mes pasado"
          }}
        />
        <MetricCard
          title="Órdenes"
          value={mockDashboardMetrics.totalOrders}
          description="Órdenes procesadas este mes"
          icon={ShoppingCart}
          trend={{
            value: mockDashboardMetrics.ordersGrowth,
            label: "desde el mes pasado"
          }}
        />
        <MetricCard
          title="Clientes"
          value={mockDashboardMetrics.totalCustomers}
          description="Total de clientes registrados"
          icon={Users}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${mockDashboardMetrics.conversionRate}%`}
          description="Porcentaje de conversión de visitas a ventas"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Overview Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={mockSalesData} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <RecentActivity activities={mockRecentActivity} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Category Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={mockCategoryData} />
            <div className="mt-4 space-y-2">
              {mockCategoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
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
                        ][index % 6]
                      }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{category.value}%</p>
                    <p className="text-xs text-muted-foreground">
                      ${category.sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {mockTopProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} ventas
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    ${product.revenue.toLocaleString()}
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
            <div className="space-y-4">
              {mockPaymentMethodData.map((method) => (
                <div key={method.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BrandIcon brand={method.name} size={20} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.value}% del total
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    ${method.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}