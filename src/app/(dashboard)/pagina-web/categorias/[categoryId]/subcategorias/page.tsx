"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Edit,
  Image as ImageIcon,
  Package,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react"
import { WebsiteSubcategory, WebsiteCategory } from "@/types"
import { useSubcategories } from "@/features/categories/useSubcategories"
import { useCategories } from "@/features/categories/useCategories"

export default function SubcategoriasPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.categoryId as string

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<WebsiteSubcategory | null>(null)

  // Hook para obtener la información de la categoría padre
  const { categories } = useCategories()
  const category = categories.find(cat => cat.id === categoryId)

  // Hook para manejar subcategorías del backend
  const {
    subcategories,
    loading,
    error,
    toggleSubcategoryActive: handleToggleActive,
    updatingSubcategory,
    updateSubcategory,
    updatingSubcategoryData
  } = useSubcategories(categoryId)

  // Estado del formulario del modal de editar
  const [editSubcategoryName, setEditSubcategoryName] = useState<string>("")
  const [editNombreVisible, setEditNombreVisible] = useState<string>("")
  const [editDescription, setEditDescription] = useState<string>("")
  const [editImage, setEditImage] = useState<string>("")

  // Función para manejar la edición de subcategoría
  const handleEditSubcategory = async () => {
    if (!selectedSubcategory || !editSubcategoryName || !editNombreVisible) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const subcategoryData = {
      nombre: editSubcategoryName,
      nombreVisible: editNombreVisible,
      descripcion: editDescription,
      imagen: editImage || "https://example.com/mock-image.jpg",
    }

    const success = await updateSubcategory(selectedSubcategory.id, subcategoryData)

    if (success) {
      setEditSubcategoryName("")
      setEditNombreVisible("")
      setEditDescription("")
      setEditImage("")
      setSelectedSubcategory(null)
      setIsEditDialogOpen(false)
    }
  }

  // Función para resetear el formulario de edición al cerrar el modal
  const handleCloseEditModal = () => {
    setEditSubcategoryName("")
    setEditNombreVisible("")
    setEditDescription("")
    setEditImage("")
    setSelectedSubcategory(null)
    setIsEditDialogOpen(false)
  }

  // Función para manejar el cambio de estado del modal de edición
  const handleEditModalOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseEditModal()
    } else {
      setIsEditDialogOpen(true)
    }
  }

  // Función para abrir el modal de edición con los datos de la subcategoría
  const handleOpenEditModal = (subcategory: WebsiteSubcategory) => {
    setSelectedSubcategory(subcategory)
    setEditSubcategoryName(subcategory.name)
    setEditNombreVisible(subcategory.nombreVisible || "")
    setEditDescription(subcategory.description || "")
    setEditImage(subcategory.image || "")
    setIsEditDialogOpen(true)
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Subcategorías de {category?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cargando subcategorías...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando subcategorías...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Subcategorías de {category?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Error al cargar subcategorías
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Ha ocurrido un error"}</p>
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Subcategorías de {category?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las subcategorías y series visibles de esta categoría
          </p>
        </div>

        {/* Modal de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditModalOpenChange}>
          <DialogContent className="max-w-2xl [&>button]:cursor-pointer">
            <DialogHeader>
              <DialogTitle>Editar Subcategoría</DialogTitle>
              <DialogDescription>
                Modifica los datos de la subcategoría seleccionada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory-name">Subcategoría de Productos</Label>
                <Input
                  id="edit-subcategory-name"
                  value={editSubcategoryName}
                  disabled={true}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El nombre de la subcategoría no es editable
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre-visible">Nombre Visible</Label>
                <Input
                  id="edit-nombre-visible"
                  placeholder="Nombre que se mostrará en el sitio web"
                  value={editNombreVisible}
                  onChange={(e) => setEditNombreVisible(e.target.value)}
                  disabled={updatingSubcategoryData}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nombre personalizado para mostrar en el sitio web
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción (opcional)</Label>
                <Input
                  id="edit-description"
                  placeholder="Descripción de la subcategoría para SEO"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updatingSubcategoryData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Imagen de la Subcategoría</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    disabled={updatingSubcategoryData}
                  />
                  <Button type="button" variant="outline" size="icon" disabled={updatingSubcategoryData}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 600x400px
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditModal} disabled={updatingSubcategoryData} className="cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleEditSubcategory} disabled={updatingSubcategoryData || !editSubcategoryName || !editNombreVisible} className="cursor-pointer">
                {updatingSubcategoryData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Subcategoría"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Subcategorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcategories.length}</div>
            <p className="text-xs text-muted-foreground">
              {subcategories.filter(s => s.isActive).length} activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              En todas las subcategorías
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcategories.reduce((acc, sub) => acc + (sub.productsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuidos en subcategorías
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcategories.filter(s => s.image).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Subcategorías con imagen asignada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subcategories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subcategorías Configuradas de {category?.name}</CardTitle>
          <CardDescription>
            Arrastra para reordenar las subcategorías como aparecerán en tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Subcategoría</TableHead>
                <TableHead>Nombre visible</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subcategory.name}</div>
                      {subcategory.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {subcategory.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{subcategory.nombreVisible || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">0 series</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{subcategory.productsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {subcategory.image ? (
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
                        checked={subcategory.isActive}
                        onCheckedChange={() => handleToggleActive(subcategory.id)}
                        disabled={updatingSubcategory === subcategory.id}
                        className="cursor-pointer"
                      />
                      {updatingSubcategory === subcategory.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        subcategory.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => handleOpenEditModal(subcategory)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
