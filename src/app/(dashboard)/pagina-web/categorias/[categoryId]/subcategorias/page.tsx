"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  GripVertical,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react"
import { WebsiteSubcategory, WebsiteCategory } from "@/types"
import { useSubcategories } from "@/features/categories/useSubcategories"
import { useAvailableSubcategories } from "@/features/categories/useAvailableSubcategories"
import { useCategories } from "@/features/categories/useCategories"

export default function SubcategoriasPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.categoryId as string

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<WebsiteSubcategory | null>(null)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<WebsiteSubcategory | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Hook para obtener la información de la categoría padre
  const { categories } = useCategories()
  const category = categories.find(cat => cat.id === categoryId)

  // Hook para manejar subcategorías del backend
  const {
    subcategories,
    loading,
    error,
    toggleSubcategoryActive: handleToggleActive,
    deleteSubcategory: handleDeleteSubcategory,
    updatingSubcategory,
    deletingSubcategory,
    createSubcategory,
    creatingSubcategory,
    updateSubcategory,
    updatingSubcategoryData
  } = useSubcategories(categoryId)

  // Hook para manejar subcategorías disponibles del backend
  const {
    availableSubcategories,
    loading: loadingAvailable,
    error: errorAvailable
  } = useAvailableSubcategories(category?.name || "")

  // Filtrar subcategorías disponibles para excluir las que ya están en subcategorias_visibles
  const filteredAvailableSubcategories = availableSubcategories.filter(availableSub =>
    !subcategories.some(visibleSub => visibleSub.name === availableSub)
  )

  // Filtrar subcategorías disponibles para edición
  const filteredAvailableSubcategoriesForEdit = availableSubcategories.filter(availableSub =>
    !subcategories.some(visibleSub =>
      visibleSub.name === availableSub && visibleSub.id !== selectedSubcategory?.id
    )
  )

  // Estado del formulario del modal de agregar
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(true)

  // Estado del formulario del modal de editar
  const [editSubcategoryName, setEditSubcategoryName] = useState<string>("")
  const [editDescription, setEditDescription] = useState<string>("")
  const [editImage, setEditImage] = useState<string>("")

  // Función para manejar el envío del formulario
  const handleSubmitSubcategory = async () => {
    if (!selectedSubcategoryName) {
      alert("Por favor selecciona una subcategoría")
      return
    }

    const subcategoryData = {
      nombre: selectedSubcategoryName,
      descripcion: description,
      imagen: "https://example.com/mock-image.jpg",
      activo: isActive
    }

    const success = await createSubcategory(subcategoryData)

    if (success) {
      setSelectedSubcategoryName("")
      setDescription("")
      setIsActive(true)
      setIsAddDialogOpen(false)
    }
  }

  // Función para manejar la edición de subcategoría
  const handleEditSubcategory = async () => {
    if (!selectedSubcategory || !editSubcategoryName) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const subcategoryData = {
      nombre: editSubcategoryName,
      descripcion: editDescription,
      imagen: editImage || "https://example.com/mock-image.jpg",
    }

    const success = await updateSubcategory(selectedSubcategory.id, subcategoryData)

    if (success) {
      setEditSubcategoryName("")
      setEditDescription("")
      setEditImage("")
      setSelectedSubcategory(null)
      setIsEditDialogOpen(false)
    }
  }

  // Función para resetear el formulario al cerrar el modal
  const handleCloseModal = () => {
    setSelectedSubcategoryName("")
    setDescription("")
    setIsActive(true)
    setIsAddDialogOpen(false)
  }

  // Función para resetear el formulario de edición al cerrar el modal
  const handleCloseEditModal = () => {
    setEditSubcategoryName("")
    setEditDescription("")
    setEditImage("")
    setSelectedSubcategory(null)
    setIsEditDialogOpen(false)
  }

  // Función para manejar el cambio de estado del modal
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseModal()
    } else {
      setIsAddDialogOpen(true)
    }
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
    setEditDescription(subcategory.description || "")
    setEditImage(subcategory.image || "")
    setIsEditDialogOpen(true)
  }

  // Función para abrir el modal de confirmación de eliminación
  const handleOpenDeleteModal = (subcategory: WebsiteSubcategory) => {
    setSubcategoryToDelete(subcategory)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  // Función para cerrar el modal de confirmación de eliminación
  const handleCloseDeleteModal = () => {
    setSubcategoryToDelete(null)
    setDeleteError(null)
    setIsDeleteDialogOpen(false)
  }

  // Función para confirmar la eliminación de la subcategoría
  const handleConfirmDelete = async () => {
    if (!subcategoryToDelete) return

    setDeleteError(null)
    const success = await handleDeleteSubcategory(subcategoryToDelete.id)

    if (success) {
      handleCloseDeleteModal()
    } else {
      setDeleteError("No se pudo eliminar la subcategoría. Por favor, revisa la consola para más detalles.")
    }
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pagina-web">Página Web</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pagina-web/categorias">Categorías</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Subcategorías</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pagina-web">Página Web</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pagina-web/categorias">Categorías</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Subcategorías</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/pagina-web">Página Web</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/pagina-web/categorias">Categorías</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Subcategorías de {category?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
        <Dialog open={isAddDialogOpen} onOpenChange={handleModalOpenChange}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Subcategoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Subcategoría</DialogTitle>
              <DialogDescription>
                Selecciona una subcategoría de productos y configura su visualización en el sitio web
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subcategory-select">Subcategoría de Productos</Label>
                <Select
                  disabled={loadingAvailable || creatingSubcategory}
                  value={selectedSubcategoryName}
                  onValueChange={setSelectedSubcategoryName}
                >
                  <SelectTrigger id="subcategory-select">
                    <SelectValue placeholder={
                      loadingAvailable
                        ? "Cargando subcategorías..."
                        : errorAvailable
                          ? "Error al cargar subcategorías"
                          : "Selecciona una subcategoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableSubcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {loadingAvailable
                    ? "Cargando subcategorías del backend..."
                    : errorAvailable
                      ? "Error al cargar subcategorías disponibles"
                      : filteredAvailableSubcategories.length === 0
                        ? "Todas las subcategorías ya han sido agregadas"
                        : `Mostrando ${filteredAvailableSubcategories.length} subcategorías disponibles`
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descripción de la subcategoría para SEO"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={creatingSubcategory}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen de la Subcategoría</Label>
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
                  <Label htmlFor="active">Subcategoría Activa</Label>
                  <p className="text-xs text-muted-foreground">
                    La subcategoría será visible en el sitio web
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={creatingSubcategory}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal} disabled={creatingSubcategory}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitSubcategory} disabled={creatingSubcategory || !selectedSubcategoryName || filteredAvailableSubcategories.length === 0}>
                {creatingSubcategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  "Agregar Subcategoría"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditModalOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Subcategoría</DialogTitle>
              <DialogDescription>
                Modifica los datos de la subcategoría seleccionada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory-select">Subcategoría de Productos</Label>
                <Select
                  disabled={loadingAvailable || updatingSubcategoryData}
                  value={editSubcategoryName}
                  onValueChange={setEditSubcategoryName}
                >
                  <SelectTrigger id="edit-subcategory-select">
                    <SelectValue placeholder={
                      loadingAvailable
                        ? "Cargando subcategorías..."
                        : errorAvailable
                          ? "Error al cargar subcategorías"
                          : "Selecciona una subcategoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableSubcategoriesForEdit.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {loadingAvailable
                    ? "Cargando subcategorías del backend..."
                    : errorAvailable
                      ? "Error al cargar subcategorías disponibles"
                      : filteredAvailableSubcategoriesForEdit.length === 0
                        ? "Todas las subcategorías ya han sido agregadas"
                        : `Mostrando ${filteredAvailableSubcategoriesForEdit.length} subcategorías disponibles`
                  }
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
              <Button variant="outline" onClick={handleCloseEditModal} disabled={updatingSubcategoryData}>
                Cancelar
              </Button>
              <Button onClick={handleEditSubcategory} disabled={updatingSubcategoryData || !editSubcategoryName || filteredAvailableSubcategoriesForEdit.length === 0}>
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

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar esta subcategoría?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="font-medium text-lg">{subcategoryToDelete?.name}</div>
                {subcategoryToDelete?.description && (
                  <div className="text-sm text-muted-foreground">
                    {subcategoryToDelete.description}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{subcategoryToDelete?.productsCount || 0} productos</span>
                  </div>
                </div>
              </div>
              {deleteError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{deleteError}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. La subcategoría se eliminará permanentemente de tu sitio web.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDeleteModal} disabled={deletingSubcategory}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={deletingSubcategory}>
                {deletingSubcategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Subcategoría
                  </>
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => handleOpenEditModal(subcategory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteModal(subcategory)}
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
