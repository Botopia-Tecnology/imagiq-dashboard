"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicFilter, FilterOrderConfig } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { FilterForm } from "@/components/filters/filter-form";
import { toast } from "sonner";

export default function CrearFiltroPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const [filters, setFilters] = useState<DynamicFilter[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing filters to calculate next order
  useEffect(() => {
    const savedFilters = localStorage.getItem("dynamicFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        const filtersWithDates = parsed.map((f: any) => ({
          ...f,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
          updatedAt: f.updatedAt ? new Date(f.updatedAt) : new Date(),
          order: f.order && typeof f.order === 'number' 
            ? { categories: {}, menus: {}, submenus: {} }
            : (f.order || { categories: {}, menus: {}, submenus: {} }),
        }));
        setFilters(filtersWithDates);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    }
  }, []);

  const saveFilters = (newFilters: DynamicFilter[]) => {
    localStorage.setItem("dynamicFilters", JSON.stringify(newFilters));
    setFilters(newFilters);
  };

  const handleSave = async (filterData: DynamicFilter) => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Initialize order config for all scopes
      const orderConfig: FilterOrderConfig = {
        categories: {},
        menus: {},
        submenus: {},
      };

      // Set initial order for each scope
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

      const newFilter: DynamicFilter = {
        ...filterData,
        order: orderConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newFilters = [...filters, newFilter];
      saveFilters(newFilters);
      toast.success("Filtro creado correctamente");
      router.push("/pagina-web/filtros");
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
          {categoriesLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando categorías...
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

