"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Edit,
  Image as ImageIcon,
  Package,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  X,
  Settings,
} from "lucide-react"
import { WebsiteMenu } from "@/types"
import { useMenus } from "@/features/categories/useMenus"
import { useCategories } from "@/features/categories/useCategories"
import { multimediaEndpoints } from "@/lib/api"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MenusPage() {
  const params = useParams()
  const categoryId = params.categoryId as string
  const router = useRouter()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<WebsiteMenu | null>(null)
  const [draggedMenu, setDraggedMenu] = useState<WebsiteMenu | null>(null)
  const [hasOrderChanged, setHasOrderChanged] = useState(false)
  const [localMenus, setLocalMenus] = useState<WebsiteMenu[]>([])
  const [orderError, setOrderError] = useState<string | null>(null)

  // Hook para obtener la información de la categoría padre
  const { categories } = useCategories()
  const category = categories.find(cat => cat.id === categoryId)

  // Hook para manejar menús del backend
  const {
    menus,
    loading,
    error,
    toggleMenuActive: handleToggleActive,
    updatingMenu,
    updateMenu,
    updatingMenuData,
    updateMenusOrder,
    updatingOrder,
    refreshMenus
  } = useMenus(categoryId)

  // Sincronizar el estado local con los menús del hook
  useEffect(() => {
    setLocalMenus(menus)
  }, [menus])

  // Estado del formulario del modal de editar
  const [editMenuName, setEditMenuName] = useState<string>("")
  const [editNombreVisible, setEditNombreVisible] = useState<string>("")
  const [editDescription, setEditDescription] = useState<string>("")
  const [editImage, setEditImage] = useState<string>("")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(false)
  const [imageToDelete, setImageToDelete] = useState<boolean>(false)

  // Función para manejar la edición de menú
  const handleEditMenu = async () => {
    if (!selectedMenu || !editMenuName || !editNombreVisible) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    try {
      let imageUrl = editImage

      // 1. Si se marcó para eliminar la imagen
      if (imageToDelete && hasExistingImage) {
        toast.info("Eliminando imagen...")
        const deleteResponse = await multimediaEndpoints.deleteMenuImage(selectedMenu.id)

        if (deleteResponse.success) {
          imageUrl = "" // Usar cadena vacía en lugar de URL de ejemplo
          toast.success("Imagen eliminada exitosamente")
        } else {
          toast.error(deleteResponse.message || "Error al eliminar la imagen")
          return
        }
      }
      // 2. Si se seleccionó una nueva imagen
      else if (selectedImageFile) {
        toast.info("Subiendo imagen...")

        // Decidir entre POST (crear) o PUT (actualizar) según si hay imagen existente
        const uploadResponse = hasExistingImage
          ? await multimediaEndpoints.updateMenuImage(selectedMenu.id, selectedImageFile)
          : await multimediaEndpoints.createMenuImage(selectedMenu.id, selectedImageFile)

        console.log("Upload response:", uploadResponse)

        if (uploadResponse.success) {
          // Si la respuesta incluye imageUrl, usarla; si no, mantener la imagen actual
          const data = uploadResponse.data as { imageUrl?: string; url?: string } | undefined
          imageUrl = data?.imageUrl || data?.url || editImage
          toast.success("Imagen subida exitosamente")
          
          // Si solo se está subiendo imagen sin cambiar otros datos, cerrar el modal
          if (!editMenuName && !editNombreVisible && !editDescription) {
            await refreshMenus()
            handleCloseEditModal()
            return
          }
        } else {
          toast.error(uploadResponse.message || "Error al subir la imagen")
          return
        }
      }

      // 3. Actualizar los datos del menú si hay cambios en los campos de texto
      const hasTextChanges = editMenuName !== selectedMenu.name || 
                            editNombreVisible !== selectedMenu.nombreVisible || 
                            editDescription !== selectedMenu.description

      if (hasTextChanges) {
        const menuData = {
          nombre: editMenuName,
          nombreVisible: editNombreVisible,
          descripcion: editDescription,
          imagen: imageUrl || "", // Usar cadena vacía en lugar de URL de ejemplo
        }

        const success = await updateMenu(selectedMenu.id, menuData)

        if (success) {
          toast.success("Menú actualizado correctamente")
        } else {
          toast.error("Error al actualizar el menú")
          return
        }
      }

      // Refrescar los menús para obtener los datos actualizados
      await refreshMenus()

      // Cerrar el modal
      handleCloseEditModal()
    } catch (error) {
      console.error("Error al actualizar menú:", error)
      toast.error("Error inesperado al actualizar el menú")
    }
  }

  // Función para resetear el formulario de edición al cerrar el modal
  const handleCloseEditModal = () => {
    setEditMenuName("")
    setEditNombreVisible("")
    setEditDescription("")
    setEditImage("")
    setSelectedImageFile(null)
    setImagePreviewUrl("")
    setHasExistingImage(false)
    setImageToDelete(false)
    setSelectedMenu(null)
    setIsEditDialogOpen(false)
  }

  // Función para manejar el cambio de estado del modal de edición
  const handleEditModalOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseEditModal()
    }
  }

  // Función para abrir el modal de edición con los datos del menú
  const handleOpenEditModal = (menu: WebsiteMenu) => {
    setSelectedMenu(menu)
    setEditMenuName(menu.name)
    setEditNombreVisible(menu.nombreVisible || "")
    setEditDescription(menu.description || "")
    setEditImage(menu.image || "")
    setSelectedImageFile(null)
    setImageToDelete(false)

    // Verificar si tiene imagen existente y configurar preview
    const hasImage = !!(menu.image && menu.image !== "https://example.com/mock-image.jpg")
    setHasExistingImage(hasImage)
    setImagePreviewUrl(hasImage && menu.image ? menu.image : "")

    setIsEditDialogOpen(true)
  }

  // Función para eliminar la imagen actual
  const handleRemoveImage = () => {
    setImageToDelete(true)
    setImagePreviewUrl("")
    setSelectedImageFile(null)
    toast.info("Imagen marcada para eliminar")
  }

  // Función para manejar la selección de archivo de imagen
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño máximo (5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error("La imagen no debe superar los 5MB")
        return
      }

      setSelectedImageFile(file)
      setImageToDelete(false) // Cancelar eliminación si se selecciona nueva imagen

      // Crear URL de preview para la nueva imagen seleccionada
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      toast.success(`Imagen "${file.name}" seleccionada`)
    }
  }

  // Funciones para drag and drop
  const handleDragStart = (e: React.DragEvent, menu: WebsiteMenu) => {
    setDraggedMenu(menu)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetMenu: WebsiteMenu) => {
    e.preventDefault()
    
    if (!draggedMenu || draggedMenu.id === targetMenu.id) {
      setDraggedMenu(null)
      return
    }

    // Reordenar los menús localmente
    const newMenus = [...localMenus]
    const draggedIndex = newMenus.findIndex(m => m.id === draggedMenu.id)
    const targetIndex = newMenus.findIndex(m => m.id === targetMenu.id)
    
    // Remover el elemento arrastrado
    const [removed] = newMenus.splice(draggedIndex, 1)
    // Insertar en la nueva posición
    newMenus.splice(targetIndex, 0, removed)
    
    // Actualizar el estado local
    setLocalMenus(newMenus)
    setHasOrderChanged(true)
    setDraggedMenu(null)
  }

  const handleDragEnd = () => {
    setDraggedMenu(null)
  }

  // Función para guardar el nuevo orden
  const handleSaveOrder = async () => {
    setOrderError(null)
    try {
      const menuIds = localMenus.map(m => m.id)
      const success = await updateMenusOrder(menuIds)
      
      if (success) {
        setHasOrderChanged(false)
        // Orden guardado exitosamente 
      } else {
        setOrderError('Error al guardar el orden. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error al guardar el orden:', error)
      setOrderError('Error al guardar el orden. Por favor, intenta nuevamente.')
    }
  }

  const handleCancelOrder = () => {
    // Restaurar el orden original
    setLocalMenus(menus)
    setHasOrderChanged(false)
    setDraggedMenu(null)
    setOrderError(null)
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Menús de {category?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cargando menús...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando menús...</p>
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
            Menús de {category?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Error al cargar menús
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error ?? "Ha ocurrido un error"}</p>
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
            Menús de {category?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los menús y submenús visibles de esta categoría
          </p>
        </div>
        <div className="flex gap-2">
          {hasOrderChanged && (
            <>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={handleCancelOrder}
                disabled={updatingOrder}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={handleSaveOrder}
                disabled={updatingOrder}
              >
                {updatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Orden
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Error de Orden */}
        {orderError && (
          <Alert variant="destructive">
            <AlertDescription>{orderError}</AlertDescription>
          </Alert>
        )}

        {/* Modal de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditModalOpenChange}>
          <DialogContent className="max-w-2xl [&>button]:cursor-pointer">
            <DialogHeader>
              <DialogTitle>Editar Menú</DialogTitle>
              <DialogDescription>
                Modifica los datos del menú seleccionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-menu-name">Menú de Productos</Label>
                <Input
                  id="edit-menu-name"
                  value={editMenuName}
                  disabled={true}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El nombre del menú no es editable
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre-visible">Nombre Visible</Label>
                <Input
                  id="edit-nombre-visible"
                  placeholder="Nombre que se mostrará en el sitio web"
                  value={editNombreVisible}
                  onChange={(e) => setEditNombreVisible(e.target.value)}
                  disabled={updatingMenuData}
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
                  placeholder="Descripción del menú para SEO"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updatingMenuData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Imagen del Menú</Label>

                {/* Preview de la imagen */}
                {imagePreviewUrl && !imageToDelete && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge variant={hasExistingImage && !selectedImageFile ? "secondary" : "default"}>
                        {hasExistingImage && !selectedImageFile ? "Imagen actual" : "Nueva imagen"}
                      </Badge>
                      {hasExistingImage && !selectedImageFile && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={updatingMenuData}
                          className="cursor-pointer"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Mensaje si se marcó para eliminar */}
                {imageToDelete && (
                  <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/30">
                    <p className="text-sm text-destructive font-medium">
                      La imagen se eliminará al presionar "Actualizar Menú"
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    disabled={updatingMenuData}
                    onChange={handleImageFileChange}
                  />
                  {selectedImageFile && (
                    <Badge variant="secondary" className="gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {selectedImageFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 600x400px
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditModal} disabled={updatingMenuData} className="cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleEditMenu} disabled={updatingMenuData || !editMenuName || !editNombreVisible} className="cursor-pointer">
                {updatingMenuData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Menú"
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
            <CardTitle className="text-sm font-medium">Total Menús</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.length}</div>
            <p className="text-xs text-muted-foreground">
              {menus.filter(m => m.isActive).length} activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Submenús</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.reduce((acc, menu) => acc + menu.submenus.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En todos los menús
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.reduce((acc, menu) => acc + (menu.productsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuidos en menús
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.filter(m => m.image).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Menús con imagen asignada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menus Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menús Configurados de {category?.name}</CardTitle>
          <CardDescription>
            Arrastra para reordenar los menús como aparecerán en tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Menú</TableHead>
                <TableHead>Nombre visible</TableHead>
                <TableHead>Submenús</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localMenus.map((menu) => (
                <TableRow
                  key={menu.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, menu)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, menu)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-all duration-200 ${
                    draggedMenu?.id === menu.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <TableCell>
                    <Button variant="ghost" size="icon" className="cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{menu.name}</div>
                      {menu.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {menu.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{menu.nombreVisible || '-'}</span>
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
                              router.push(`/pagina-web/categorias/${categoryId}/menus/${menu.id}/submenus`)
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            {menu.submenus.length} {menu.submenus.length === 1 ? 'submenú' : 'submenús'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar submenús de {menu.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{menu.productsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {menu.image && menu.image !== "https://example.com/mock-image.jpg" ? (
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
                        checked={menu.isActive}
                        onCheckedChange={() => handleToggleActive(menu.id)}
                        disabled={updatingMenu === menu.id}
                        className="cursor-pointer"
                      />
                      {(() => {
                        if (updatingMenu === menu.id) {
                          return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        }
                        return menu.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => handleOpenEditModal(menu)}
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
