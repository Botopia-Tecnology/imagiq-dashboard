"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicFilter, FilterOrderConfig } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { useFilters } from "@/hooks/use-filters";
import { FilterForm } from "@/components/filters/filter-form";
import { toast } from "sonner";

export default function CrearFiltroPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { filters, createFilter, isLoading: filtersLoading } = useFilters();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (filterData: DynamicFilter) => {
    setIsSaving(true);
    try {
      // Initialize order config for all scopes
      const orderConfig: FilterOrderConfig = {
        categories: {},
        menus: {},
        submenus: {},
      };

      // Set initial order for each scope based on existing filters
      filterData.scope.categories.forEach((categoryId) => {
        const categoryFilters = filters.filter((f) =>
          f.scope.categories.includes(categoryId)
        );
        orderConfig.categories[categoryId] = categoryFilters.length;
      });

      filterData.scope.menus.forEach((menuId) => {
        const menuFilters = filters.filter((f) =>
          f.scope.menus.includes(menuId)
        );
        orderConfig.menus[menuId] = menuFilters.length;
      });

      filterData.scope.submenus.forEach((submenuId) => {
        const submenuFilters = filters.filter((f) =>
          f.scope.submenus.includes(submenuId)
        );
        orderConfig.submenus[submenuId] = submenuFilters.length;
      });

      // Prepare filter data for API
      const filterPayload = {
        sectionName: filterData.sectionName,
        column: filterData.column,
        operator: filterData.operator,
        operatorMode: filterData.operatorMode,
        valueConfig: filterData.valueConfig,
        displayType: filterData.displayType,
        scope: filterData.scope,
        order: orderConfig,
        isActive: filterData.isActive,
      };

      const newFilter = await createFilter(filterPayload);
      
      if (newFilter) {
        router.push("/pagina-web/filtros");
      }
    } catch (error) {
      toast.error("Error al guardar el filtro");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/pagina-web/filtros");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/pagina-web/filtros")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Crear Nuevo Filtro
          </h1>
          <p className="text-sm text-muted-foreground">
            Configura un nuevo filtro dinámico para productos
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Filtro</CardTitle>
          <CardDescription>
            Completa todos los campos para crear el filtro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading || filtersLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : (
            <FilterForm
              categories={categories}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isSaving}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

