"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Filter } from "lucide-react";
import { DynamicFilter } from "@/types/filters";
import { WebsiteCategory } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { useProductColumns } from "@/hooks/use-product-columns";
import { filterEndpoints } from "@/lib/api";
import { toast } from "sonner";
import { FilterOperator, FilterDisplayType } from "@/types/filters";
import { DynamicValueConfig, ManualValueConfig, MixedValueConfig } from "@/types/filters";

export default function VerFiltroPage() {
  const router = useRouter();
  const params = useParams();
  const filterId = params.id as string;
  const { categories, loading: categoriesLoading } = useCategories();
  const { columns } = useProductColumns();
  const [viewingFilter, setViewingFilter] = useState<DynamicFilter | undefined>();
  const [loading, setLoading] = useState(true);

  // Load filter by ID from API
  useEffect(() => {
    const fetchFilter = async () => {
      setLoading(true);
      try {
        const response = await filterEndpoints.getById(filterId);
        
        // Handle nested response structure: { success: true, data: {...} }
        // The API client wraps it, so we get: response.data = { success: true, data: {...} }
        let filterData: any = null;
        
        if (response.success && response.data) {
          const responseData = response.data as any;
          // Check if response.data is directly the filter object
          if (responseData.id || responseData.sectionName) {
            filterData = responseData;
          }
          // Check if response.data has a nested data property (backend response structure)
          else if (responseData.data && (responseData.data.id || responseData.data.sectionName)) {
            filterData = responseData.data;
          }
        }
        
        if (filterData) {
          // Convert date strings to Date objects
          const filter: DynamicFilter = {
            ...filterData,
            createdAt: filterData.createdAt ? new Date(filterData.createdAt) : new Date(),
            updatedAt: filterData.updatedAt ? new Date(filterData.updatedAt) : new Date(),
          };
          setViewingFilter(filter);
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

  const getColumnLabel = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    return column?.label || columnKey;
  };

  const getOperatorLabel = (operator: FilterOperator): string => {
    for (const column of columns) {
      const opMeta = column.operators?.find(op => op.value === operator);
      if (opMeta) return opMeta.label;
    }
    return operator;
  };

  const getDisplayTypeLabel = (type: FilterDisplayType): string => {
    return type;
  };

  // Helper function to map scope IDs to names
  const getScopeNames = (filter: DynamicFilter) => {
    const categoryNames: string[] = [];
    const menuNames: string[] = [];
    const submenuNames: string[] = [];

    // Map category IDs to names
    filter.scope.categories.forEach((categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        categoryNames.push(category.nombreVisible || category.name);
      }
    });

    // Map menu IDs to names
    filter.scope.menus.forEach((menuId) => {
      categories.forEach((category) => {
        const menu = category.menus.find((m) => m.id === menuId);
        if (menu) {
          menuNames.push(menu.nombreVisible || menu.name);
        }
      });
    });

    // Map submenu IDs to names
    filter.scope.submenus.forEach((submenuId) => {
      categories.forEach((category) => {
        category.menus.forEach((menu) => {
          const submenu = menu.submenus.find((s) => s.id === submenuId);
          if (submenu) {
            submenuNames.push(submenu.nombreVisible || submenu.name);
          }
        });
      });
    });

    return {
      categories: categoryNames,
      menus: menuNames,
      submenus: submenuNames,
    };
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

  if (!viewingFilter) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Filter className="h-6 w-6" />
              {viewingFilter.sectionName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalles completos del filtro
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/pagina-web/filtros/${filterId}/editar`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Filtro
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre de la Sección</Label>
              <p className="text-sm font-medium mt-1">{viewingFilter.sectionName}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <div className="mt-1">
                {viewingFilter.isActive ? (
                  <Badge variant="default" className="text-xs">Activo</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Columna</Label>
              <p className="text-sm font-medium mt-1">{getColumnLabel(viewingFilter.column)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Modo de Operador</Label>
              <p className="text-sm font-medium mt-1">
                {viewingFilter.operatorMode === "column" ? "Por columna" : "Por valor"}
              </p>
            </div>
            {viewingFilter.operatorMode === "column" && viewingFilter.operator && (
              <div>
                <Label className="text-xs text-muted-foreground">Operador</Label>
                <p className="text-sm font-medium mt-1">{getOperatorLabel(viewingFilter.operator)}</p>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Tipo de Visualización</Label>
              <p className="text-sm font-medium mt-1">{getDisplayTypeLabel(viewingFilter.displayType)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <p className="text-sm font-medium mt-1 capitalize">{viewingFilter.valueConfig.type}</p>
          </div>
          
          {viewingFilter.valueConfig.type === "dynamic" && (
            <div>
              <Label className="text-xs text-muted-foreground">Valores Seleccionados</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(viewingFilter.valueConfig as DynamicValueConfig).selectedValues.map((val, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {val.label || val.value}
                    {viewingFilter.operatorMode === "per-value" && val.operator && (
                      <span className="ml-1 text-muted-foreground">({val.operator})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {viewingFilter.valueConfig.type === "manual" && (
            <>
              {(viewingFilter.valueConfig as ManualValueConfig).values && (viewingFilter.valueConfig as ManualValueConfig).values.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Valores Manuales</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(viewingFilter.valueConfig as ManualValueConfig).values.map((val, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {val.label || val.value}
                        {viewingFilter.operatorMode === "per-value" && val.operator && (
                          <span className="ml-1 text-muted-foreground">({val.operator})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(viewingFilter.valueConfig as ManualValueConfig).ranges && (viewingFilter.valueConfig as ManualValueConfig).ranges.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rangos</Label>
                  <div className="space-y-2 mt-2">
                    {(viewingFilter.valueConfig as ManualValueConfig).ranges.map((range, idx) => (
                      <div key={idx} className="p-2 border rounded text-sm">
                        <span className="font-medium">{range.label}:</span> {range.min} - {range.max}
                        {viewingFilter.operatorMode === "per-value" && range.operator && (
                          <span className="ml-2 text-muted-foreground">({range.operator})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {viewingFilter.valueConfig.type === "mixed" && (
            <>
              {(viewingFilter.valueConfig as MixedValueConfig).dynamicValues && (viewingFilter.valueConfig as MixedValueConfig).dynamicValues.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Valores Dinámicos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(viewingFilter.valueConfig as MixedValueConfig).dynamicValues.map((val, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {val.value}
                        {viewingFilter.operatorMode === "per-value" && val.operator && (
                          <span className="ml-1 text-muted-foreground">({val.operator})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(viewingFilter.valueConfig as MixedValueConfig).manualValues && (viewingFilter.valueConfig as MixedValueConfig).manualValues.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Valores Manuales</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(viewingFilter.valueConfig as MixedValueConfig).manualValues.map((val, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {val.label || val.value}
                        {viewingFilter.operatorMode === "per-value" && val.operator && (
                          <span className="ml-1 text-muted-foreground">({val.operator})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(viewingFilter.valueConfig as MixedValueConfig).ranges && (viewingFilter.valueConfig as MixedValueConfig).ranges.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rangos</Label>
                  <div className="space-y-2 mt-2">
                    {(viewingFilter.valueConfig as MixedValueConfig).ranges.map((range, idx) => (
                      <div key={idx} className="p-2 border rounded text-sm">
                        <span className="font-medium">{range.label}:</span> {range.min} - {range.max}
                        {viewingFilter.operatorMode === "per-value" && range.operator && (
                          <span className="ml-2 text-muted-foreground">({range.operator})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Alcance del Filtro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getScopeNames(viewingFilter).categories.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Categorías</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {getScopeNames(viewingFilter).categories.map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}
          {getScopeNames(viewingFilter).menus.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Menús</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {getScopeNames(viewingFilter).menus.map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}
          {getScopeNames(viewingFilter).submenus.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Submenús</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {getScopeNames(viewingFilter).submenus.map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Creado</Label>
              <p className="text-sm mt-1">
                {viewingFilter.createdAt 
                  ? new Date(viewingFilter.createdAt).toLocaleString() 
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Última Actualización</Label>
              <p className="text-sm mt-1">
                {viewingFilter.updatedAt 
                  ? new Date(viewingFilter.updatedAt).toLocaleString() 
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

