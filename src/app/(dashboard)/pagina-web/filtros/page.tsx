"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GripVertical, Edit, Trash2, Copy, Filter, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { DynamicFilter, FilterOrderConfig } from "@/types/filters";
import { WebsiteCategory, WebsiteMenu, WebsiteSubmenu } from "@/types";
import { useCategories } from "@/features/categories/useCategories";
import { useProductColumns } from "@/hooks/use-product-columns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GroupedFilters {
  categoryId: string;
  categoryName: string;
  filters: DynamicFilter[];
  menus: Array<{
    menuId: string;
    menuName: string;
    filters: DynamicFilter[];
    submenus: Array<{
      submenuId: string;
      submenuName: string;
      filters: DynamicFilter[];
    }>;
  }>;
}

export default function FiltrosPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { columns } = useProductColumns();
  const [filters, setFilters] = useState<DynamicFilter[]>([]);
  const [deletingFilter, setDeletingFilter] = useState<DynamicFilter | null>(null);
  const [draggedFilter, setDraggedFilter] = useState<{ filter: DynamicFilter; scopeType: 'category' | 'menu' | 'submenu'; scopeId: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Load filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("dynamicFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        const filtersWithDates = parsed.map((f: any) => ({
          ...f,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
          updatedAt: f.updatedAt ? new Date(f.updatedAt) : new Date(),
          // Migrate old order format to new format if needed
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

  // Save filters to localStorage
  const saveFilters = (newFilters: DynamicFilter[]) => {
    localStorage.setItem("dynamicFilters", JSON.stringify(newFilters));
    setFilters(newFilters);
  };

  // Group filters by category/menu/submenu
  const groupedFilters = useMemo(() => {
    const groups: GroupedFilters[] = [];

    categories.forEach((category) => {
      const categoryFilters = filters.filter(
        (f) => f.scope.categories.includes(category.id)
      );

      const menuGroups: GroupedFilters["menus"] = [];
      category.menus.forEach((menu) => {
        const menuFilters = filters.filter(
          (f) => f.scope.menus.includes(menu.id)
        );

        const submenuGroups: Array<{
          submenuId: string;
          submenuName: string;
          filters: DynamicFilter[];
        }> = [];
        menu.submenus.forEach((submenu) => {
          const submenuFilters = filters.filter(
            (f) => f.scope.submenus.includes(submenu.id)
          );
          if (submenuFilters.length > 0) {
            submenuGroups.push({
              submenuId: submenu.id,
              submenuName: submenu.nombreVisible || submenu.name,
              filters: submenuFilters.sort(
                (a, b) => (a.order.submenus[submenu.id] || 0) - (b.order.submenus[submenu.id] || 0)
              ),
            });
          }
        });

        if (menuFilters.length > 0 || submenuGroups.length > 0) {
          menuGroups.push({
            menuId: menu.id,
            menuName: menu.nombreVisible || menu.name,
            filters: menuFilters.sort(
              (a, b) => (a.order.menus[menu.id] || 0) - (b.order.menus[menu.id] || 0)
            ),
            submenus: submenuGroups,
          });
        }
      });

      if (categoryFilters.length > 0 || menuGroups.length > 0) {
        groups.push({
          categoryId: category.id,
          categoryName: category.nombreVisible || category.name,
          filters: categoryFilters.sort(
            (a, b) => (a.order.categories[category.id] || 0) - (b.order.categories[category.id] || 0)
          ),
          menus: menuGroups,
        });
      }
    });

    return groups;
  }, [filters, categories]);

  const handleCreate = () => {
    router.push("/pagina-web/filtros/crear");
  };

  const handleEdit = (filter: DynamicFilter) => {
    router.push(`/pagina-web/filtros/${filter.id}/editar`);
  };

  const handleDelete = (filter: DynamicFilter) => {
    setDeletingFilter(filter);
  };

  const confirmDelete = () => {
    if (!deletingFilter) return;

    const newFilters = filters.filter((f) => f.id !== deletingFilter.id);
    saveFilters(newFilters);
    setDeletingFilter(null);
    toast.success("Filtro eliminado correctamente");
  };

  const handleDuplicate = (filter: DynamicFilter) => {
    const duplicated: DynamicFilter = {
      ...filter,
      id: `filter-${Date.now()}`,
      sectionName: `${filter.sectionName} (Copia)`,
      order: {
        categories: {},
        menus: {},
        submenus: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newFilters = [...filters, duplicated];
    saveFilters(newFilters);
    toast.success("Filtro duplicado correctamente");
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    filter: DynamicFilter,
    scopeType: 'category' | 'menu' | 'submenu',
    scopeId: string
  ) => {
    setDraggedFilter({ filter, scopeType, scopeId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetFilter: DynamicFilter,
    scopeType: 'category' | 'menu' | 'submenu',
    scopeId: string
  ) => {
    e.preventDefault();

    if (!draggedFilter || draggedFilter.filter.id === targetFilter.id) {
      setDraggedFilter(null);
      return;
    }

    // Only allow reordering within the same scope
    if (draggedFilter.scopeType !== scopeType || draggedFilter.scopeId !== scopeId) {
      setDraggedFilter(null);
      return;
    }

    // Get filters for this scope
    let scopeFilters: DynamicFilter[] = [];
    if (scopeType === 'category') {
      scopeFilters = filters.filter((f) => f.scope.categories.includes(scopeId));
    } else if (scopeType === 'menu') {
      scopeFilters = filters.filter((f) => f.scope.menus.includes(scopeId));
    } else {
      scopeFilters = filters.filter((f) => f.scope.submenus.includes(scopeId));
    }

    // Reorder
    const draggedIndex = scopeFilters.findIndex((f) => f.id === draggedFilter.filter.id);
    const targetIndex = scopeFilters.findIndex((f) => f.id === targetFilter.id);

    const reordered = [...scopeFilters];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Update order values
    const updatedFilters = filters.map((f) => {
      const newOrder = { ...f.order };
      const index = reordered.findIndex((rf) => rf.id === f.id);
      
      if (index !== -1) {
        if (scopeType === 'category') {
          newOrder.categories = { ...newOrder.categories, [scopeId]: index };
        } else if (scopeType === 'menu') {
          newOrder.menus = { ...newOrder.menus, [scopeId]: index };
        } else {
          newOrder.submenus = { ...newOrder.submenus, [scopeId]: index };
        }
        return { ...f, order: newOrder };
      }
      return f;
    });

    saveFilters(updatedFilters);
    setDraggedFilter(null);
    toast.success("Orden actualizado");
  };

  const handleDragEnd = () => {
    setDraggedFilter(null);
  };

  const getColumnLabel = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    return column?.label || columnKey;
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const renderFilterItem = (
    filter: DynamicFilter,
    scopeType: 'category' | 'menu' | 'submenu',
    scopeId: string
  ) => {
    const isDragging = draggedFilter?.filter.id === filter.id;

    return (
      <div
        key={filter.id}
        draggable
        onDragStart={(e) => handleDragStart(e, filter, scopeType, scopeId)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, filter, scopeType, scopeId)}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative p-3 border rounded-lg cursor-move transition-all mb-2",
          "hover:border-primary hover:bg-primary/5",
          isDragging && "opacity-50"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{filter.sectionName}</h4>
                  {filter.isActive ? (
                    <Badge variant="default" className="text-xs">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>{getColumnLabel(filter.column)}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{filter.operator}</Badge>
                    <Badge variant="secondary" className="text-xs">{filter.displayType}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(filter)}
                  title="Editar"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(filter)}
                  title="Duplicar"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(filter)}
                  title="Eliminar"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Configuración de Filtros
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los filtros dinámicos agrupados por categoría, menú y submenú
          </p>
        </div>
        <Button onClick={handleCreate} disabled={categoriesLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Filtro
        </Button>
      </div>

      {/* Grouped Filters */}
      {categoriesLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cargando categorías...
          </CardContent>
        </Card>
      ) : groupedFilters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay filtros configurados
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Crea tu primer filtro dinámico para permitir a los usuarios filtrar
              productos por diferentes criterios
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Filtro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedFilters.map((group) => (
            <Card key={group.categoryId}>
              <CardHeader>
                <Collapsible
                  open={expandedCategories.has(group.categoryId)}
                  onOpenChange={() => toggleCategory(group.categoryId)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {expandedCategories.has(group.categoryId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="text-lg">{group.categoryName}</CardTitle>
                        <Badge variant="secondary">
                          {group.filters.length} filtro(s) directo(s)
                        </Badge>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4">
                      {/* Category-level filters */}
                      {group.filters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                            Filtros de Categoría
                          </h4>
                          <div className="space-y-2">
                            {group.filters.map((filter) =>
                              renderFilterItem(filter, 'category', group.categoryId)
                            )}
                          </div>
                        </div>
                      )}

                      {/* Menu-level filters */}
                      {group.menus.map((menu) => (
                        <div key={menu.menuId} className="border-l-2 pl-4">
                          <Collapsible
                            open={expandedMenus.has(menu.menuId)}
                            onOpenChange={() => toggleMenu(menu.menuId)}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center gap-2">
                                  {expandedMenus.has(menu.menuId) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <h4 className="font-medium">{menu.menuName}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {menu.filters.length} filtro(s)
                                  </Badge>
                                </div>
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 space-y-4">
                                {/* Menu-level filters */}
                                {menu.filters.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium mb-2 text-muted-foreground">
                                      Filtros de Menú
                                    </h5>
                                    <div className="space-y-2">
                                      {menu.filters.map((filter) =>
                                        renderFilterItem(filter, 'menu', menu.menuId)
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Submenu-level filters */}
                                {menu.submenus.map((submenu) => (
                                  <div key={submenu.submenuId} className="border-l-2 pl-4">
                                    <h5 className="text-xs font-medium mb-2 text-muted-foreground">
                                      {submenu.submenuName}
                                      <Badge variant="outline" className="text-xs ml-2">
                                        {submenu.filters.length} filtro(s)
                                      </Badge>
                                    </h5>
                                    <div className="space-y-2">
                                      {submenu.filters.map((filter) =>
                                        renderFilterItem(filter, 'submenu', submenu.submenuId)
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingFilter !== null}
        onOpenChange={(open) => !open && setDeletingFilter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar filtro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el filtro "{deletingFilter?.sectionName}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
