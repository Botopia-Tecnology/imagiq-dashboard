"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react"
import { WebsiteCategory } from "@/types"
import { useCategories } from "@/features/categories/useCategories"

export default function CategoriasPage() {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  // Mantener estas variables para futuras funcionalidades
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | null>(null)
  
  // Hook para manejar categorías del backend
  const { 
    categories: websiteCategories, 
    loading, 
    error, 
    toggleCategoryActive: handleToggleActive, 
    deleteCategory: handleDeleteCategory 
  } = useCategories()

  // Categorías de productos disponibles en la base de datos
  const availableCategories = [
    "Electrónicos",
    "Ropa",
    "Hogar",
    "Belleza",
    "Deportes",
    "Juguetes",
    "Libros",
    "Alimentos",
    "Muebles",
    "Tecnología",
    "Jardín",
    "Mascotas",
    "Automóviles",
    "Salud",
  ]

  // Los datos ahora vienen del hook useCategories del backend

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/pagina-web")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Categorías del Sitio Web
              </h1>
              <p className="text-sm text-muted-foreground">
                Cargando categorías...
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando categorías...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/pagina-web")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Categorías del Sitio Web
              </h1>
              <p className="text-sm text-muted-foreground">
                Error al cargar categorías
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/pagina-web")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Categorías del Sitio Web
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las categorías y subcategorías visibles en tu tienda
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Categoría</DialogTitle>
              <DialogDescription>
                Selecciona una categoría de productos y configura su visualización en el sitio web
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-select">Categoría de Productos</Label>
                <Select>
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Las categorías provienen de tu catálogo de productos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descripción de la categoría para SEO"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen de la Categoría</Label>
                <div className="flex gap-2">
                  <Input id="image" type="file" accept="image/*" />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 600x400px
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Categoría Activa</Label>
                  <p className="text-xs text-muted-foreground">
                    La categoría será visible en el sitio web
                  </p>
                </div>
                <Switch id="active" defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Agregar Categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websiteCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              {websiteCategories.filter(c => c.isActive).length} activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subcategorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En todas las categorías
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteCategories.reduce((acc, cat) => acc + (cat.productsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuidos en categorías
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteCategories.filter(c => c.image).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorías con imagen asignada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías Configuradas</CardTitle>
          <CardDescription>
            Arrastra para reordenar las categorías como aparecerán en tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Subcategorías</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websiteCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategoría' : 'subcategorías'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{category.productsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.image ? (
                      <Badge variant="secondary" className="gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Asignada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        Sin imagen
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category.id)}
                      />
                      {category.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
