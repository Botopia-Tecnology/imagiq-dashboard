"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicFilter } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { FilterForm } from "@/components/filters/filter-form";
import { toast } from "sonner";

export default function EditarFiltroPage() {
  const router = useRouter();
  const params = useParams();
  const filterId = params.id as string;
  const { categories, loading: categoriesLoading } = useCategories();
  const [filters, setFilters] = useState<DynamicFilter[]>([]);
  const [editingFilter, setEditingFilter] = useState<DynamicFilter | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load filters and find the one to edit
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

        const filter = filtersWithDates.find((f: DynamicFilter) => f.id === filterId);
        if (filter) {
          setEditingFilter(filter);
        } else {
          toast.error("Filtro no encontrado");
          router.push("/pagina-web/filtros");
        }
      } catch (error) {
        console.error("Error loading filters:", error);
        toast.error("Error al cargar los filtros");
        router.push("/pagina-web/filtros");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("No se encontraron filtros");
      router.push("/pagina-web/filtros");
      setLoading(false);
    }
  }, [filterId, router]);

  const saveFilters = (newFilters: DynamicFilter[]) => {
    localStorage.setItem("dynamicFilters", JSON.stringify(newFilters));
    setFilters(newFilters);
  };

  const handleSave = async (filterData: DynamicFilter) => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Preserve existing order config
      const existingFilter = filters.find((f) => f.id === filterId);
      const updatedFilter: DynamicFilter = {
        ...filterData,
        id: filterId,
        order: existingFilter?.order || filterData.order,
        createdAt: existingFilter?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      const newFilters = filters.map((f) =>
        f.id === filterId ? updatedFilter : f
      );
      saveFilters(newFilters);
      toast.success("Filtro actualizado correctamente");
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

  if (loading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center text-muted-foreground">
          Cargando...
        </div>
      </div>
    );
  }

  if (!editingFilter) {
    return null;
  }

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
            Editar Filtro
          </h1>
          <p className="text-sm text-muted-foreground">
            Modifica la configuración del filtro
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Filtro</CardTitle>
          <CardDescription>
            Modifica los campos que desees cambiar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterForm
            filter={editingFilter}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}

