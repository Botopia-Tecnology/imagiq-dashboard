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
} from "lucide-react"
import { WebsiteSubmenu } from "@/types"
import { useSubmenus } from "@/features/categories/useSubmenus"
import { useMenus } from "@/features/categories/useMenus"
import { multimediaEndpoints } from "@/lib/api"
import { toast } from "sonner"

export default function SubmenusPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string
  const menuId = params.menuId as string

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubmenu, setSelectedSubmenu] = useState<WebsiteSubmenu | null>(null)
  const [draggedSubmenu, setDraggedSubmenu] = useState<WebsiteSubmenu | null>(null)
  const [hasOrderChanged, setHasOrderChanged] = useState(false)
  const [localSubmenus, setLocalSubmenus] = useState<WebsiteSubmenu[]>([])
  const [orderError, setOrderError] = useState<string | null>(null)

  // Hook para obtener la información del menú padre
  const { menus } = useMenus(categoryId)
  const menu = menus.find(m => m.id === menuId)

  // Hook para manejar submenús del backend
  const {
    submenus,
    loading,
    error,
    toggleSubmenuActive: handleToggleActive,
    updatingSubmenu,
    updateSubmenu,
    updatingSubmenuData,
    updateSubmenusOrder,
    updatingOrder,
    refreshSubmenus
  } = useSubmenus(menuId)

  // Sincronizar el estado local con los submenús del hook
  useEffect(() => {
    setLocalSubmenus(submenus)
  }, [submenus])

  // Estado del formulario del modal de editar
  const [editSubmenuName, setEditSubmenuName] = useState<string>("")
  const [editNombreVisible, setEditNombreVisible] = useState<string>("")
  const [editDescription, setEditDescription] = useState<string>("")
  const [editImage, setEditImage] = useState<string>("")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(false)
  const [imageToDelete, setImageToDelete] = useState<boolean>(false)

  // Función para manejar la edición de submenú
  const handleEditSubmenu = async () => {
    if (!selectedSubmenu || !editSubmenuName || !editNombreVisible) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    try {
      let imageUrl = editImage

      // 1. Si se marcó para eliminar la imagen
      if (imageToDelete && hasExistingImage) {
        toast.info("Eliminando imagen...")
        const deleteResponse = await multimediaEndpoints.deleteSubmenuImage(selectedSubmenu.id)

        if (deleteResponse.success) {
          imageUrl = ""
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
          ? await multimediaEndpoints.updateSubmenuImage(selectedSubmenu.id, selectedImageFile)
          : await multimediaEndpoints.createSubmenuImage(selectedSubmenu.id, selectedImageFile)

        console.log("Upload response:", uploadResponse)

        if (uploadResponse.success) {
          // Si la respuesta incluye imageUrl, usarla; si no, mantener la imagen actual
          const data = uploadResponse.data as { imageUrl?: string; url?: string } | undefined
          imageUrl = data?.imageUrl || data?.url || editImage
          toast.success("Imagen subida exitosamente")
          
          // Si solo se está subiendo imagen sin cambiar otros datos, cerrar el modal
          if (!editSubmenuName && !editNombreVisible && !editDescription) {
            await refreshSubmenus()
            handleCloseEditModal()
            return
          }
        } else {
          toast.error(uploadResponse.message || "Error al subir la imagen")
          return
        }
      }

      // 2. Actualizar los datos del submenú si hay cambios en los campos de texto
      const hasTextChanges = editSubmenuName !== selectedSubmenu.name || 
                            editNombreVisible !== selectedSubmenu.nombreVisible || 
                            editDescription !== selectedSubmenu.description

      if (hasTextChanges) {
        const submenuData = {
          nombre: editSubmenuName,
          nombreVisible: editNombreVisible,
          descripcion: editDescription,
          imagen: imageUrl || "", // Usar cadena vacía en lugar de URL de ejemplo
        }

        const success = await updateSubmenu(selectedSubmenu.id, submenuData)

        if (success) {
          toast.success("Submenú actualizado correctamente")
        } else {
          toast.error("Error al actualizar el submenú")
          return
        }
      }

      // Refrescar los submenús para obtener los datos actualizados
      await refreshSubmenus()

      // Cerrar el modal
      handleCloseEditModal()
    } catch (error) {
      console.error("Error al actualizar submenú:", error)
      toast.error("Error inesperado al actualizar el submenú")
    }
  }

  // Función para resetear el formulario de edición al cerrar el modal
  const handleCloseEditModal = () => {
    setEditSubmenuName("")
    setEditNombreVisible("")
    setEditDescription("")
    setEditImage("")
    setSelectedImageFile(null)
    setImagePreviewUrl("")
    setHasExistingImage(false)
    setImageToDelete(false)
    setSelectedSubmenu(null)
    setIsEditDialogOpen(false)
  }

  // Función para manejar el cambio de estado del modal de edición
  const handleEditModalOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseEditModal()
    }
  }

  // Función para abrir el modal de edición con los datos del submenú
  const handleOpenEditModal = (submenu: WebsiteSubmenu) => {
    setSelectedSubmenu(submenu)
    setEditSubmenuName(submenu.name)
    setEditNombreVisible(submenu.nombreVisible || "")
    setEditDescription(submenu.description || "")
    setEditImage(submenu.image || "")
    setSelectedImageFile(null)
    setImageToDelete(false)

    // Verificar si tiene imagen existente y configurar preview
    const hasImage = !!(submenu.image && submenu.image !== "https://example.com/mock-image.jpg")
    setHasExistingImage(hasImage)
    setImagePreviewUrl(hasImage && submenu.image ? submenu.image : "")

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
  const handleDragStart = (e: React.DragEvent, submenu: WebsiteSubmenu) => {
    setDraggedSubmenu(submenu)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetSubmenu: WebsiteSubmenu) => {
    e.preventDefault()

    if (!draggedSubmenu || draggedSubmenu.id === targetSubmenu.id) {
      setDraggedSubmenu(null)
      return
    }

    // Reordenar los submenús localmente
    const newSubmenus = [...localSubmenus]
    const draggedIndex = newSubmenus.findIndex(s => s.id === draggedSubmenu.id)
    const targetIndex = newSubmenus.findIndex(s => s.id === targetSubmenu.id)

    // Remover el elemento arrastrado
    const [removed] = newSubmenus.splice(draggedIndex, 1)
    // Insertar en la nueva posición
    newSubmenus.splice(targetIndex, 0, removed)

    // Actualizar el estado local
    setLocalSubmenus(newSubmenus)
    setHasOrderChanged(true)
    setDraggedSubmenu(null)
  }

  const handleDragEnd = () => {
    setDraggedSubmenu(null)
  }

  // Función para guardar el nuevo orden
  const handleSaveOrder = async () => {
    setOrderError(null)
    try {
      const submenuIds = localSubmenus.map(s => s.id)
      const success = await updateSubmenusOrder(submenuIds)

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
    setLocalSubmenus(submenus)
    setHasOrderChanged(false)
    setDraggedSubmenu(null)
    setOrderError(null)
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Submenús de {menu?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cargando submenús...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando submenús...</p>
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
            Submenús de {menu?.name || "..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Error al cargar submenús
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
            Submenús de {menu?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los submenús visibles de este menú
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
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col [&>button]:cursor-pointer">
            <DialogHeader>
              <DialogTitle>Editar Submenú</DialogTitle>
              <DialogDescription>
                Modifica los datos del submenú seleccionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-submenu-name">Submenú de Productos</Label>
                <Input
                  id="edit-submenu-name"
                  value={editSubmenuName}
                  disabled={true}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El nombre del submenú no es editable
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre-visible">Nombre Visible</Label>
                <Input
                  id="edit-nombre-visible"
                  placeholder="Nombre que se mostrará en el sitio web"
                  value={editNombreVisible}
                  onChange={(e) => setEditNombreVisible(e.target.value)}
                  disabled={updatingSubmenuData}
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
                  placeholder="Descripción del submenú para SEO"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updatingSubmenuData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Imagen del Submenú</Label>

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
                      {imagePreviewUrl && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={updatingSubmenuData}
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
                      La imagen se eliminará al presionar "Actualizar Submenú"
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    disabled={updatingSubmenuData}
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
              <Button variant="outline" onClick={handleCloseEditModal} disabled={updatingSubmenuData} className="cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleEditSubmenu} disabled={updatingSubmenuData || !editSubmenuName || !editNombreVisible} className="cursor-pointer">
                {updatingSubmenuData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Submenú"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Submenús</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submenus.length}</div>
            <p className="text-xs text-muted-foreground">
              {submenus.filter(s => s.isActive).length} activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submenus.reduce((acc, submenu) => acc + (submenu.productsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuidos en submenús
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submenus.filter(s => s.image).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Submenús con imagen asignada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submenus Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submenús Configurados de {menu?.name}</CardTitle>
          <CardDescription>
            Arrastra para reordenar los submenús como aparecerán en tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Submenú</TableHead>
                <TableHead>Nombre visible</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localSubmenus.map((submenu) => (
                <TableRow
                  key={submenu.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, submenu)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, submenu)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-all duration-200 ${
                    draggedSubmenu?.id === submenu.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <TableCell>
                    <Button variant="ghost" size="icon" className="cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submenu.name}</div>
                      {submenu.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {submenu.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{submenu.nombreVisible || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{submenu.productsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {submenu.image && submenu.image !== "https://example.com/mock-image.jpg" ? (
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
                        checked={submenu.isActive}
                        onCheckedChange={() => handleToggleActive(submenu.id)}
                        disabled={updatingSubmenu === submenu.id}
                        className="cursor-pointer"
                      />
                      {(() => {
                        if (updatingSubmenu === submenu.id) {
                          return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        }
                        return submenu.isActive ? (
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
                      onClick={() => handleOpenEditModal(submenu)}
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
