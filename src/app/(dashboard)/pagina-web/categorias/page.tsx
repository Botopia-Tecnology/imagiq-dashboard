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
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
} from "lucide-react"
import { WebsiteCategory } from "@/types"
import { useCategories } from "@/features/categories/useCategories"
import { useAvailableCategories } from "@/features/categories/useAvailableCategories"

export default function CategoriasPage() {
  const router = useRouter()
  // Mantener estas variables para futuras funcionalidades
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<WebsiteCategory | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  // Hook para manejar categorías del backend
  const {
    categories: websiteCategories,
    loading,
    error,
    toggleCategoryActive: handleToggleActive,
    deleteCategory: handleDeleteCategory,
    updatingCategory,
    deletingCategory,
    updateCategory,
    updatingCategoryData,
    syncCategories,
    syncingCategories
  } = useCategories()

  // Hook para manejar categorías disponibles del backend
  const {
    availableCategories,
    loading: loadingAvailable,
    error: errorAvailable
  } = useAvailableCategories()

  // Filtrar categorías disponibles para edición (excluye las ya usadas excepto la actual)
  const filteredAvailableCategoriesForEdit = availableCategories.filter(availableCat =>
    !websiteCategories.some(visibleCat =>
      visibleCat.name === availableCat && visibleCat.id !== selectedCategory?.id
    )
  )

  // Estado del formulario del modal de editar
  const [editCategoryName, setEditCategoryName] = useState<string>("")
  const [editDescription, setEditDescription] = useState<string>("")
  const [editImage, setEditImage] = useState<string>("")

  // Función para manejar la edición de categoría
  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryName) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const categoryData = {
      nombre: editCategoryName,
      descripcion: editDescription,
      imagen: editImage || "https://example.com/mock-image.jpg", // Mock image por ahora
    }

    const success = await updateCategory(selectedCategory.id, categoryData)

    if (success) {
      // Limpiar formulario y cerrar modal
      setEditCategoryName("")
      setEditDescription("")
      setEditImage("")
      setSelectedCategory(null)
      setIsEditDialogOpen(false)
    }
  }

  // Función para resetear el formulario de edición al cerrar el modal
  const handleCloseEditModal = () => {
    setEditCategoryName("")
    setEditDescription("")
    setEditImage("")
    setSelectedCategory(null)
    setIsEditDialogOpen(false)
  }

  // Función para manejar el cambio de estado del modal de edición
  const handleEditModalOpenChange = (open: boolean) => {
    if (!open) {
      // Solo limpiar cuando se cierra, no cuando se abre
      handleCloseEditModal()
    } else {
      setIsEditDialogOpen(true)
    }
  }

  // Función para abrir el modal de edición con los datos de la categoría
  const handleOpenEditModal = (category: WebsiteCategory) => {
    setSelectedCategory(category)
    setEditCategoryName(category.name)
    setEditDescription(category.description || "")
    setEditImage(category.image || "")
    setIsEditDialogOpen(true)
  }

  // Función para abrir el modal de confirmación de eliminación
  const handleOpenDeleteModal = (category: WebsiteCategory) => {
    setCategoryToDelete(category)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  // Función para cerrar el modal de confirmación de eliminación
  const handleCloseDeleteModal = () => {
    setCategoryToDelete(null)
    setDeleteError(null)
    setIsDeleteDialogOpen(false)
  }

  // Función para confirmar la eliminación de la categoría
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleteError(null)
    const success = await handleDeleteCategory(categoryToDelete.id)

    if (success) {
      handleCloseDeleteModal()
    } else {
      setDeleteError("No se pudo eliminar la categoría. Por favor, revisa la consola para más detalles.")
    }
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Categorías del Sitio Web
          </h1>
          <p className="text-sm text-muted-foreground">
            Cargando categorías...
          </p>
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Categorías del Sitio Web
          </h1>
          <p className="text-sm text-muted-foreground">
            Error al cargar categorías
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
            Categorías del Sitio Web
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorías y subcategorías visibles en tu tienda
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={syncCategories}
          disabled={syncingCategories}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncingCategories ? 'animate-spin' : ''}`} />
          {syncingCategories ? 'Sincronizando...' : 'Sincronizar'}
        </Button>

        {/* Modal de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditModalOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>
                Modifica los datos de la categoría seleccionada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-select">Categoría de Productos</Label>
                <Select
                  disabled={loadingAvailable || updatingCategoryData}
                  value={editCategoryName}
                  onValueChange={setEditCategoryName}
                >
                  <SelectTrigger id="edit-category-select">
                    <SelectValue placeholder={
                      loadingAvailable
                        ? "Cargando categorías..."
                        : errorAvailable
                          ? "Error al cargar categorías"
                          : "Selecciona una categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableCategoriesForEdit.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {loadingAvailable
                    ? "Cargando categorías del backend..."
                    : errorAvailable
                      ? "Error al cargar categorías disponibles"
                      : filteredAvailableCategoriesForEdit.length === 0
                        ? "Todas las categorías ya han sido agregadas"
                        : `Mostrando ${filteredAvailableCategoriesForEdit.length} categorías disponibles`
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción (opcional)</Label>
                <Input
                  id="edit-description"
                  placeholder="Descripción de la categoría para SEO"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updatingCategoryData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Imagen de la Categoría</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    disabled={updatingCategoryData}
                  />
                  <Button type="button" variant="outline" size="icon" disabled={updatingCategoryData}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 600x400px
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditModal} disabled={updatingCategoryData}>
                Cancelar
              </Button>
              <Button onClick={handleEditCategory} disabled={updatingCategoryData || !editCategoryName || filteredAvailableCategoriesForEdit.length === 0}>
                {updatingCategoryData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Categoría"
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
                ¿Estás seguro de que deseas eliminar esta categoría?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="font-medium text-lg">{categoryToDelete?.name}</div>
                {categoryToDelete?.description && (
                  <div className="text-sm text-muted-foreground">
                    {categoryToDelete.description}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{categoryToDelete?.productsCount || 0} productos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{categoryToDelete?.subcategories.length || 0} subcategorías</span>
                  </div>
                </div>
              </div>
              {deleteError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{deleteError}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. La categoría se eliminará permanentemente de tu sitio web.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDeleteModal} disabled={deletingCategory}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={deletingCategory}>
                {deletingCategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Categoría
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-colors"
                            onClick={() => {
                              router.push(`/pagina-web/categorias/${category.id}/subcategorias`)
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategoría' : 'subcategorías'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar subcategorías de {category.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                        disabled={updatingCategory === category.id}
                      />
                      {updatingCategory === category.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        category.isActive ? (
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
                        onClick={() => handleOpenEditModal(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteModal(category)}
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
