import { DataTable } from "@/components/tables/data-table"
import { productColumns } from "@/components/tables/columns/products-columns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, DollarSign, AlertTriangle } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"

const categories = [
  { label: "Smartphones", value: "Smartphones" },
  { label: "Laptops", value: "Laptops" },
  { label: "Audio", value: "Audio" },
  { label: "Tablets", value: "Tablets" },
  { label: "Gaming", value: "Gaming" },
  { label: "Monitores", value: "Monitores" },
  { label: "Cámaras", value: "Cámaras" },
  { label: "Accesorios", value: "Accesorios" },
]

const statuses = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Borrador", value: "draft" },
]

export default function ProductosPage() {
  // Calcular métricas
  const totalProducts = mockProducts.length
  const activeProducts = mockProducts.filter(p => p.status === 'active').length
  const lowStockProducts = mockProducts.filter(p => p.stock <= 10).length
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Métricas de productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos con stock ≤ 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categorías disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={productColumns}
            data={mockProducts}
            searchKey="name"
            filters={[
              {
                id: "category",
                title: "Categoría",
                options: categories,
              },
              {
                id: "status",
                title: "Estado",
                options: statuses,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}