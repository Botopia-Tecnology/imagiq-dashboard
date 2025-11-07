"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Mail, CheckCircle2, Send, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ProductCardProps } from "@/features/products/useProducts"
import { GroupedNotificationsResponse, NotificationProducto } from "@/lib/api"

// Componente separado para la celda de acciones que usa useRouter
function ActionsCell({ 
  product, 
  notificationData 
}: { 
  product: ProductCardProps
  notificationData?: NotificationProducto | null
}) {
  const router = useRouter()
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showSentModal, setShowSentModal] = useState(false)
  const [showSendEmailModal, setShowSendEmailModal] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(product.id)}
          >
            Copiar ID del producto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/productos/${product.id}`)}>
            Ver/Editar detalles
          </DropdownMenuItem>
          <DropdownMenuItem>Ver órdenes</DropdownMenuItem>
          
          {notificationData && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Notificaciones
              </DropdownMenuLabel>
              {notificationData.notificacionesPendientes > 0 && (
                <>
                  <DropdownMenuItem onClick={() => setShowPendingModal(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Correos pendientes ({notificationData.notificacionesPendientes})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedEmails([])
                    setSendToAll(false)
                    setShowSendEmailModal(true)
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar notificaciones
                  </DropdownMenuItem>
                </>
              )}
              {notificationData.notificacionesEnviadas > 0 && (
                <DropdownMenuItem onClick={() => setShowSentModal(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Correos enviados ({notificationData.notificacionesEnviadas})
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal para correos pendientes */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Correos Pendientes</DialogTitle>
            <DialogDescription>
              Clientes esperando notificación de disponibilidad para {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {notificationData?.emails.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total: {notificationData?.notificacionesPendientes} pendientes
            </p>
            <Button onClick={() => setShowPendingModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para correos enviados */}
      <Dialog open={showSentModal} onOpenChange={setShowSentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Correos Enviados</DialogTitle>
            <DialogDescription>
              Notificaciones ya enviadas para {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {notificationData?.emails.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
                <Badge variant="default" className="bg-green-600">Enviado</Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total: {notificationData?.notificacionesEnviadas} enviados
            </p>
            <Button onClick={() => setShowSentModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para enviar notificaciones */}
      <Dialog open={showSendEmailModal} onOpenChange={setShowSendEmailModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificaciones
            </DialogTitle>
            <DialogDescription>
              Selecciona los usuarios a los que deseas enviar la notificación de disponibilidad para {product.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Opción para enviar a todos */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Enviar a todos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar a todos los usuarios en la lista ({notificationData?.emails.length || 0} usuarios)
                  </p>
                </div>
              </div>
              <Checkbox
                checked={sendToAll}
                onCheckedChange={(checked) => {
                  setSendToAll(!!checked)
                  if (checked) {
                    setSelectedEmails(notificationData?.emails || [])
                  } else {
                    setSelectedEmails([])
                  }
                }}
              />
            </div>

            {/* Lista de usuarios */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Seleccionar usuarios individualmente</p>
              <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-3">
                {notificationData?.emails.map((email, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{email}</span>
                    </div>
                    <Checkbox
                      checked={selectedEmails.includes(email)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmails([...selectedEmails, email])
                        } else {
                          setSelectedEmails(selectedEmails.filter(e => e !== email))
                          setSendToAll(false)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedEmails.length} usuario{selectedEmails.length !== 1 ? 's' : ''} seleccionado{selectedEmails.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSendEmailModal(false)}>
                Cancelar
              </Button>
              <Button 
                disabled={selectedEmails.length === 0}
                onClick={() => {
                  // TODO: Implementar lógica de envío
                  console.log('Enviar correos a:', selectedEmails)
                  setShowSendEmailModal(false)
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Notificaciones
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const createProductColumns = (
  onSortChange?: (field: string, direction:  "desc" | "asc" ) => void,
  notificationsData?: GroupedNotificationsResponse | null
): ColumnDef<ProductCardProps>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="w-16 h-16 relative overflow-hidden rounded-lg">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            const isAsc = column.getIsSorted() === "asc"
            const newDirection = isAsc ? "desc" : "asc"
            column.toggleSorting(isAsc)
            onSortChange?.("name", newDirection)
          }}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const product = row.original
      return (
        <TooltipProvider>
          <div className="max-w-[200px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium truncate cursor-default">{product.name}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{product.name}</p>
              </TooltipContent>
            </Tooltip>
            <div className="text-sm text-muted-foreground truncate">
              {product.description}
            </div>
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit">
            {product.category || "Sin categoría"}
          </Badge>
          {/* {product.menu && (
            <span className="text-xs text-muted-foreground">
              {product.menu}
            </span>
          )} */}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "menu",
    header: "Menú",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex flex-col gap-1">
          {product.menu }
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const menuValue = row.getValue(id) as string
      return value.includes(menuValue)
    },
    enableSorting: false,
    enableHiding: false,
    size: 0, // Tamaño 0 para que no ocupe espacio
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            const isAsc = column.getIsSorted() === "asc"
            const newDirection = isAsc ? "desc" : "asc"
            column.toggleSorting(isAsc)
            onSortChange?.("price", newDirection)
          }}
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as string
      return <div className="font-medium">{price || "N/A"}</div>
    },
  },
  {
    accessorKey: "stockTotal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          // onClick={() => {
          //   const currentSort = column.getIsSorted()
          //   // Si está en desc, cambiar a asc. Si no está ordenado o está en asc, ir a desc
          //   const isDesc = currentSort === "desc"
          //   const newDirection = isDesc ? "asc" : "desc"
          //   // toggleSorting(true) = desc, toggleSorting(false) = asc
          //   column.toggleSorting(!isDesc)
          //   onSortChange?.("stock", newDirection)
          // }}
        >
          Stock
          {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = row.getValue("stockTotal") as number | undefined

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{stock ?? 0}</span>
          {stock !== undefined && stock <= 10 && (
            <Badge variant="destructive">
              Bajo
            </Badge>
          )}
        </div>
      )
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Estado",
  //   cell: ({ row }) => {
  //     const stock = row.original.stock
  //     const status = (stock ?? 0) > 0 ? "active" : "inactive"
  //     return (
  //       <Badge
  //         variant={
  //           status === "active"
  //             ? "default"
  //             : "secondary"
  //         }
  //       >
  //         {status === "active" ? "Activo" : "Inactivo"}
  //       </Badge>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     const stock = row.original.stock
  //     const status = (stock ?? 0) > 0 ? "active" : "inactive"
  //     return value.includes(status)
  //   },
  // },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original
      
      // Buscar datos de notificaciones para este producto
      let notificationData: NotificationProducto | null = null
      if (notificationsData) {
        // Buscar en todos los grupos de notificaciones
        for (const group of notificationsData.notificaciones) {
          // Buscar el producto por SKU en los productos del grupo
          const foundProduct = group.productos.find(p => 
            product.sku && p.sku === product.sku
          )
          if (foundProduct) {
            notificationData = foundProduct
            break
          }
        }
      }
      
      return <ActionsCell product={product} notificationData={notificationData} />
    },
  },
]