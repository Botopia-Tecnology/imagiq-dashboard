"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
import { ProductCardProps } from "@/features/products/useProducts"

// Componente separado para la celda de acciones que usa useRouter
function ActionsCell({ product }: { product: ProductCardProps }) {
  const router = useRouter()

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createProductColumns = (
  onSortChange?: (field: string, direction:  "desc" | "asc" ) => void
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
          onClick={() => {
            const currentSort = column.getIsSorted()
            // Si no está ordenado, empezar con desc. Si es desc, cambiar a asc. Si es asc, cambiar a desc.
            const newDirection = currentSort === "desc" ? "asc" : "desc"
            column.toggleSorting(currentSort === "asc")
            onSortChange?.("stock", newDirection)
          }}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = row.getValue("stockTotal") as number | undefined
      return (
        <div className="flex items-center">
          <span className="font-medium">{stock ?? 0}</span>
          {stock !== undefined && stock <= 10 && (
            <Badge variant="destructive" className="ml-2">
              Bajo
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const stock = row.original.stock
      const status = (stock ?? 0) > 0 ? "active" : "inactive"
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : "secondary"
          }
        >
          {status === "active" ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const stock = row.original.stock
      const status = (stock ?? 0) > 0 ? "active" : "inactive"
      return value.includes(status)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
]