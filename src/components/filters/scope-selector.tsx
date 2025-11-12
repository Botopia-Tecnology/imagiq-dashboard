"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FilterScope } from "@/types/filters";
import { WebsiteCategory } from "@/types";

interface ScopeSelectorProps {
  value: FilterScope;
  onValueChange: (scope: FilterScope) => void;
  categories: WebsiteCategory[];
  disabled?: boolean;
}

export function ScopeSelector({
  value,
  onValueChange,
  categories,
  disabled = false,
}: ScopeSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Debug: Log categories when they change
  useEffect(() => {
    if (categories && categories.length > 0) {
      console.log("ScopeSelector: Categories loaded", categories.length);
    } else {
      console.log("ScopeSelector: No categories available");
    }
  }, [categories]);

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

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const newScope = { ...value };
    if (checked) {
      if (!newScope.categories.includes(categoryId)) {
        newScope.categories = [...newScope.categories, categoryId];
      }
    } else {
      newScope.categories = newScope.categories.filter((id) => id !== categoryId);
    }
    onValueChange(newScope);
  };

  const handleMenuToggle = (menuId: string, checked: boolean) => {
    const newScope = { ...value };
    if (checked) {
      if (!newScope.menus.includes(menuId)) {
        newScope.menus = [...newScope.menus, menuId];
      }
    } else {
      newScope.menus = newScope.menus.filter((id) => id !== menuId);
    }
    onValueChange(newScope);
  };

  const handleSubmenuToggle = (submenuId: string, checked: boolean) => {
    const newScope = { ...value };
    if (checked) {
      if (!newScope.submenus.includes(submenuId)) {
        newScope.submenus = [...newScope.submenus, submenuId];
      }
    } else {
      newScope.submenus = newScope.submenus.filter((id) => id !== submenuId);
    }
    onValueChange(newScope);
  };

  const selectedCount =
    value.categories.length + value.menus.length + value.submenus.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>Alcance del Filtro</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona categorías, menús o submenús de forma independiente
          </p>
        </div>
        {selectedCount > 0 && (
          <Badge variant="secondary">{selectedCount} seleccionado(s)</Badge>
        )}
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {!categories || categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  No hay categorías disponibles
                </p>
                <p className="text-xs text-muted-foreground">
                  Asegúrate de tener categorías creadas en{" "}
                  <span className="font-medium">Página Web → Categorías</span>
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  {/* Category Row */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={value.categories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category.id, checked === true)
                      }
                      disabled={disabled}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {category.nombreVisible || category.name}
                    </Label>
                    {category.menus.length > 0 && (
                      <Collapsible
                        open={expandedCategories.has(category.id)}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="p-1 hover:bg-muted rounded"
                            disabled={disabled}
                          >
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    )}
                  </div>
                  
                  {/* Menus Accordion */}
                  {category.menus.length > 0 && (
                    <Collapsible
                      open={expandedCategories.has(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleContent>
                        <div className="ml-4 mt-1 space-y-2">
                          {category.menus.map((menu) => (
                            <div key={menu.id} className="space-y-1">
                              {/* Menu Row */}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`menu-${menu.id}`}
                                  checked={value.menus.includes(menu.id)}
                                  onCheckedChange={(checked) =>
                                    handleMenuToggle(menu.id, checked === true)
                                  }
                                  disabled={disabled}
                                />
                                <Label
                                  htmlFor={`menu-${menu.id}`}
                                  className="flex-1 cursor-pointer text-sm"
                                >
                                  {menu.nombreVisible || menu.name}
                                </Label>
                                {menu.submenus.length > 0 && (
                                  <Collapsible
                                    open={expandedMenus.has(menu.id)}
                                    onOpenChange={() => toggleMenu(menu.id)}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <button
                                        type="button"
                                        className="p-1 hover:bg-muted rounded"
                                        disabled={disabled}
                                      >
                                        {expandedMenus.has(menu.id) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </button>
                                    </CollapsibleTrigger>
                                  </Collapsible>
                                )}
                              </div>
                              
                              {/* Submenus Accordion */}
                              {menu.submenus.length > 0 && (
                                <Collapsible
                                  open={expandedMenus.has(menu.id)}
                                  onOpenChange={() => toggleMenu(menu.id)}
                                >
                                  <CollapsibleContent>
                                    <div className="ml-4 mt-1 space-y-1">
                                      {menu.submenus.map((submenu) => (
                                        <div
                                          key={submenu.id}
                                          className="flex items-center gap-2"
                                        >
                                          <Checkbox
                                            id={`submenu-${submenu.id}`}
                                            checked={value.submenus.includes(
                                              submenu.id
                                            )}
                                            onCheckedChange={(checked) =>
                                              handleSubmenuToggle(
                                                submenu.id,
                                                checked === true
                                              )
                                            }
                                            disabled={disabled}
                                          />
                                          <Label
                                            htmlFor={`submenu-${submenu.id}`}
                                            className="flex-1 cursor-pointer text-sm text-muted-foreground"
                                          >
                                            {submenu.nombreVisible ||
                                              submenu.name}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {selectedCount === 0 && categories && categories.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selecciona al menos una categoría, menú o submenú para aplicar el
          filtro. Puedes seleccionar múltiples opciones de forma independiente.
        </p>
      )}
    </div>
  );
}

