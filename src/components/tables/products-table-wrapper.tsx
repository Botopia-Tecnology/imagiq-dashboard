"use client";

import { useMemo, useCallback, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { createProductColumns } from "@/components/tables/columns/products-columns";
import { useProducts } from "@/features/products/useProducts";

const categories = [
  { label: "Smartphones", value: "Celulares" },
  { label: "Tablets", value: "Tablets" },
  { label: "Relojes", value: "Wearables" },
  { label: "Accesorios", value: "Accesorios" },
  { label: "Galaxy buds falta buds", value: "buds" },

  { label: "Televisores", value: "Televisores" },
  { label: "Barras de sonido", value: "Barras de sonido" },
  { label: "Sistemas de audio", value: "Sistemas de audio" },

  { label: "Refrigeradores", value: "Neveras,Nevecon" },
  { label: "Lavadora", value: "Lavadora,Secadora" },
  { label: "Lavavajillas", value: "Lavavajillas" },
  { label: "Aire acondicionado", value: "Aire Acondicionado" },
  { label: "Microondas", value: "Microondas" },
  { label: "Aspiradoras", value: "Aspiradoras" },
  { label: "Hornos", value: "Hornos" },
];

const statuses = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Borrador", value: "draft" },
];

export function ProductsTableWrapper() {
  const [pageSize, setPageSize] = useState(10);
  const [currentFilters, setCurrentFilters] = useState<
    Record<string, string[]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

  const initialFilters = useMemo(() => ({ limit: 10 }), []);

  const {
    products,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    filterProducts,
  } = useProducts(initialFilters);

  const handleSortChange = useCallback(
    (field: string, direction: "asc" | "desc") => {
      setSortBy(field);
      setSortOrder(direction);

      const filters: Record<string, any> = {
        limit: pageSize,
        page: 1,
        sortBy: field,
        sortOrder: direction,
      };

      // Aplicar filtros de categoría/subcategoría
      if (currentFilters.subcategory && currentFilters.subcategory.length > 0) {
        const hasBuds = currentFilters.subcategory.includes("buds");

        if (hasBuds) {
          const budsValues = currentFilters.subcategory.filter(v => v === "buds");
          const otherValues = currentFilters.subcategory.filter(v => v !== "buds");

          if (budsValues.length > 0) {
            filters.name = budsValues.join(", ");
          }

          if (otherValues.length > 0) {
            filters.subcategory = otherValues.join(", ");
          }
        } else {
          filters.subcategory = currentFilters.subcategory.join(", ");
        }
      }

      // Aplicar búsqueda solo si no se sobreescribió con buds
      if (searchQuery && !filters.name) {
        filters.name = searchQuery;
      }

      filterProducts(filters);
    },
    [filterProducts, currentFilters, searchQuery, pageSize]
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      const newPage = pagination.pageIndex + 1;
      setPageSize(pagination.pageSize);

      const filters: Record<string, any> = {
        limit: pagination.pageSize,
        page: newPage,
      };

      // Aplicar filtros de categoría/subcategoría (separados por comas)
      if (currentFilters.subcategory && currentFilters.subcategory.length > 0) {
        const hasBuds = currentFilters.subcategory.includes("buds");

        if (hasBuds) {
          const budsValues = currentFilters.subcategory.filter(v => v === "buds");
          const otherValues = currentFilters.subcategory.filter(v => v !== "buds");

          if (budsValues.length > 0) {
            filters.name = budsValues.join(", ");
          }

          if (otherValues.length > 0) {
            filters.subcategory = otherValues.join(", ");
          }
        } else {
          filters.subcategory = currentFilters.subcategory.join(", ");
        }
      }

      // Aplicar búsqueda solo si no se sobreescribió con buds
      if (searchQuery && !filters.name) {
        filters.name = searchQuery;
      }

      // Mantener ordenamiento actual
      if (sortBy) {
        filters.sortBy = sortBy;
        filters.sortOrder = sortOrder;
      }

      filterProducts(filters);
    },
    [filterProducts, currentFilters, searchQuery, sortBy, sortOrder]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      setSearchQuery(search);
      const filters: Record<string, any> = {
        name: search,
        limit: pageSize,
        page: 1,
      };

      if (currentFilters.subcategory && currentFilters.subcategory.length > 0) {
        const hasBuds = currentFilters.subcategory.includes("buds");

        if (hasBuds) {
          const budsValues = currentFilters.subcategory.filter(v => v === "buds");
          const otherValues = currentFilters.subcategory.filter(v => v !== "buds");

          // Combinar búsqueda con buds
          if (budsValues.length > 0) {
            filters.name = search ? `${search}, ${budsValues.join(", ")}` : budsValues.join(", ");
          }

          if (otherValues.length > 0) {
            filters.subcategory = otherValues.join(", ");
          }
        } else {
          filters.subcategory = currentFilters.subcategory.join(", ");
        }
      }

      // Mantener ordenamiento
      if (sortBy) {
        filters.sortBy = sortBy;
        filters.sortOrder = sortOrder;
      }

      filterProducts(filters);
    },
    [filterProducts, pageSize, currentFilters, sortBy, sortOrder]
  );

  const handleFilterChange = useCallback(
    (filterId: string, value: string[]) => {
      const newFilters = { ...currentFilters, [filterId]: value };
      console.log(newFilters);
      setCurrentFilters(newFilters);

      const filters: Record<string, any> = {
        limit: pageSize,
        page: 1,
      };

      // Validar si alguno de los valores es "buds"
      if (value.length > 0) {
        const hasBuds = value.includes("buds");

        if (hasBuds) {
          // Si contiene "buds", separar entre buds y otras categorías
          const budsValues = value.filter(v => v === "buds");
          const otherValues = value.filter(v => v !== "buds");

          // Enviar buds como name
          if (budsValues.length > 0) {
            filters.name = searchQuery
              ? `${searchQuery}, ${budsValues.join(", ")}`
              : budsValues.join(", ");
          }

          // Enviar otras categorías como subcategory
          if (otherValues.length > 0) {
            filters[filterId] = otherValues.join(", ");
          }
        } else {
          // Si no hay buds, enviar normalmente como subcategory
          filters[filterId] = value.join(", ");
        }
      }

      // Mantener la búsqueda existente solo si no se incluyó con buds
      if (searchQuery && !filters.name) {
        filters.name = searchQuery;
      }

      // Mantener ordenamiento
      if (sortBy) {
        filters.sortBy = sortBy;
        filters.sortOrder = sortOrder;
      }

      filterProducts(filters);
    },
    [filterProducts, pageSize, searchQuery, currentFilters, sortBy, sortOrder]
  );

  const tableFilters = useMemo(
    () => [
      {
        id: "subcategory",
        title: "Categoría",
        options: categories,
      },
      // {
      //   id: "status",
      //   title: "Estado",
      //   options: statuses,
      // },
    ],
    []
  );

  const columns = useMemo(
    () => createProductColumns(handleSortChange),
    [handleSortChange]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={products}
      searchKey="name"
      filters={tableFilters}
      pageCount={totalPages}
      pageIndex={currentPage - 1}
      pageSize={pageSize}
      totalItems={totalItems}
      onPaginationChange={handlePaginationChange}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      loading={loading}
    />
  );
}
