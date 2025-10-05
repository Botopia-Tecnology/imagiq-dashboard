"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Mail,
  Tag,
  Trash2,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
} from "lucide-react"
import { Customer, CustomerSegment } from "@/types"

export default function ClientesListaPage() {
  const router = useRouter()
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [segmentFilter, setSegmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock data - clientes
  const customers: Customer[] = [
    {
      id: "1",
      email: "maria.garcia@email.com",
      name: "María García",
      phone: "+52 55 1234 5678",
      segment: "vip",
      tags: ["premium", "fashion"],
      status: "active",
      lifecycleStage: "loyal",
      totalOrders: 45,
      totalSpent: 125000,
      averageOrderValue: 2777,
      lastOrderDate: new Date("2025-01-15"),
      firstOrderDate: new Date("2023-06-10"),
      sessionsCount: 234,
      pageviewsCount: 1567,
      avgSessionDuration: 8.5,
      lastSeenAt: new Date("2025-01-20"),
      device: "mobile",
      browser: "Safari",
      country: "México",
      city: "Ciudad de México",
      acquisitionSource: "instagram",
      acquisitionMedium: "social",
      acquisitionCampaign: "summer_2023",
      createdAt: new Date("2023-06-10"),
      updatedAt: new Date("2025-01-20"),
    },
    {
      id: "2",
      email: "juan.martinez@email.com",
      name: "Juan Martínez",
      segment: "loyal",
      tags: ["tech", "early-adopter"],
      status: "active",
      lifecycleStage: "customer",
      totalOrders: 28,
      totalSpent: 84500,
      averageOrderValue: 3018,
      lastOrderDate: new Date("2025-01-18"),
      firstOrderDate: new Date("2023-09-15"),
      sessionsCount: 156,
      pageviewsCount: 987,
      avgSessionDuration: 12.3,
      lastSeenAt: new Date("2025-01-19"),
      device: "desktop",
      browser: "Chrome",
      country: "México",
      city: "Guadalajara",
      acquisitionSource: "google",
      acquisitionMedium: "cpc",
      acquisitionCampaign: "tech_products_2023",
      createdAt: new Date("2023-09-15"),
      updatedAt: new Date("2025-01-19"),
    },
    {
      id: "3",
      email: "ana.lopez@email.com",
      name: "Ana López",
      segment: "promising",
      tags: ["new-customer"],
      status: "active",
      lifecycleStage: "prospect",
      totalOrders: 3,
      totalSpent: 8900,
      averageOrderValue: 2967,
      lastOrderDate: new Date("2025-01-10"),
      firstOrderDate: new Date("2024-12-20"),
      sessionsCount: 45,
      pageviewsCount: 234,
      avgSessionDuration: 6.8,
      lastSeenAt: new Date("2025-01-15"),
      device: "mobile",
      browser: "Chrome",
      country: "México",
      city: "Monterrey",
      acquisitionSource: "facebook",
      acquisitionMedium: "social",
      acquisitionCampaign: "new_year_2025",
      createdAt: new Date("2024-12-20"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: "4",
      email: "carlos.rodriguez@email.com",
      name: "Carlos Rodríguez",
      segment: "at_risk",
      tags: ["inactive"],
      status: "inactive",
      lifecycleStage: "at_risk",
      totalOrders: 18,
      totalSpent: 45600,
      averageOrderValue: 2533,
      lastOrderDate: new Date("2024-09-20"),
      firstOrderDate: new Date("2023-03-10"),
      sessionsCount: 98,
      pageviewsCount: 567,
      avgSessionDuration: 5.2,
      lastSeenAt: new Date("2024-10-05"),
      device: "desktop",
      browser: "Firefox",
      country: "México",
      city: "Puebla",
      acquisitionSource: "organic",
      acquisitionMedium: "search",
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2024-10-05"),
    },
    {
      id: "5",
      email: "lucia.hernandez@email.com",
      name: "Lucía Hernández",
      segment: "new",
      tags: ["first-time"],
      status: "new",
      lifecycleStage: "lead",
      totalOrders: 1,
      totalSpent: 2400,
      averageOrderValue: 2400,
      lastOrderDate: new Date("2025-01-22"),
      firstOrderDate: new Date("2025-01-22"),
      sessionsCount: 12,
      pageviewsCount: 67,
      avgSessionDuration: 4.1,
      lastSeenAt: new Date("2025-01-22"),
      device: "tablet",
      browser: "Safari",
      country: "México",
      city: "Cancún",
      acquisitionSource: "tiktok",
      acquisitionMedium: "social",
      acquisitionCampaign: "january_sale",
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-22"),
    },
  ]

  const getSegmentConfig = (segment: CustomerSegment) => {
    const configs = {
      vip: { label: "VIP", color: "bg-purple-500" },
      loyal: { label: "Leal", color: "bg-blue-500" },
      promising: { label: "Prometedor", color: "bg-green-500" },
      at_risk: { label: "En Riesgo", color: "bg-orange-500" },
      hibernating: { label: "Inactivo", color: "bg-gray-500" },
      lost: { label: "Perdido", color: "bg-red-500" },
      new: { label: "Nuevo", color: "bg-cyan-500" },
    }
    return configs[segment]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case "inactive":
        return <TrendingDown className="h-3 w-3 text-orange-600" />
      case "churned":
        return <Minus className="h-3 w-3 text-red-600" />
      default:
        return <TrendingUp className="h-3 w-3 text-cyan-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    return matchesSearch && matchesSegment && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map((c) => c.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId])
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Base de Datos de Clientes
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length} clientes encontrados
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AOV Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los segmentos</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="loyal">Leal</SelectItem>
                  <SelectItem value="promising">Prometedor</SelectItem>
                  <SelectItem value="at_risk">En Riesgo</SelectItem>
                  <SelectItem value="hibernating">Inactivo</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="churned">Churn</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCustomers.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {selectedCustomers.length} cliente(s) seleccionado(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="mr-2 h-4 w-4" />
                  Agregar Tag
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  <TableHead className="text-right">Gastado</TableHead>
                  <TableHead className="text-right">AOV</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const segmentConfig = getSegmentConfig(customer.segment)
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCustomer(customer.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name || "Sin nombre"}</span>
                          <span className="text-xs text-muted-foreground">{customer.email}</span>
                          {customer.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {customer.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${segmentConfig.color}`} />
                          <span className="text-sm">{segmentConfig.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(customer.status)}
                          <span className="text-sm capitalize">{customer.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.totalOrders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(customer.averageOrderValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {customer.lastOrderDate
                            ? formatDate(customer.lastOrderDate)
                            : "Nunca"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {customer.city || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="mr-2 h-4 w-4" />
                              Gestionar tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
