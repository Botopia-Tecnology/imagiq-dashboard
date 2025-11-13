"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicFilter } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { useFilters } from "@/hooks/use-filters";
import { filterEndpoints } from "@/lib/api";
import { FilterForm } from "@/components/filters/filter-form";
import { toast } from "sonner";

export default function EditarFiltroPage() {
  const router = useRouter();
  const params = useParams();
  const filterId = params.id as string;
  const { categories, loading: categoriesLoading } = useCategories();
  const { updateFilter } = useFilters();
  const [editingFilter, setEditingFilter] = useState<DynamicFilter | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load filter by ID from API
  useEffect(() => {
    const fetchFilter = async () => {
      setLoading(true);
      try {
        const response = await filterEndpoints.getById(filterId);
        
        if (response.success && response.data) {
          // Convert date strings to Date objects
          const filter: DynamicFilter = {
            ...response.data,
            createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
            updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : new Date(),
          };
          setEditingFilter(filter);
        } else {
          toast.error(response.message || "Filtro no encontrado");
          router.push("/pagina-web/filtros");
        }
      } catch (error) {
        console.error("Error loading filter:", error);
        toast.error("Error al cargar el filtro");
        router.push("/pagina-web/filtros");
      } finally {
        setLoading(false);
      }
    };

    if (filterId) {
      fetchFilter();
    }
  }, [filterId, router]);

  const handleSave = async (filterData: DynamicFilter) => {
    setIsSaving(true);
    try {
      // Preserve existing order config and dates
      const updatePayload: Partial<DynamicFilter> = {
        sectionName: filterData.sectionName,
        column: filterData.column,
        operator: filterData.operator,
        operatorMode: filterData.operatorMode,
        valueConfig: filterData.valueConfig,
        displayType: filterData.displayType,
        scope: filterData.scope,
        isActive: filterData.isActive,
        // Preserve order from existing filter
        order: editingFilter?.order || filterData.order,
      };

      const updatedFilter = await updateFilter(filterId, updatePayload);
      
      if (updatedFilter) {
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

