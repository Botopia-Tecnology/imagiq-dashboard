"use client";

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryEndpoints } from "@/lib/api";
import { BackendCategory } from "@/types";
import { Loader2 } from "lucide-react";

interface BannerCategoryFieldsProps {
  categoryId?: string;
  subcategoryId?: string;
  onCategoryChange: (categoryId: string, categoryName: string) => void;
  onSubcategoryChange: (subcategoryId: string, subcategoryName: string) => void;
}

export function BannerCategoryFields({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: Readonly<BannerCategoryFieldsProps>) {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategoryUuid, setCurrentCategoryUuid] = useState<string>("");
  const [currentSubcategoryUuid, setCurrentSubcategoryUuid] = useState<string>("");
  const initializedRef = useRef<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryEndpoints.getVisibleCompletas();

        if (response.success && response.data) {
          console.log("Categorías cargadas:", response.data.length, "categorías");
          console.log("UUIDs de categorías:", response.data.map(c => ({ uuid: c.uuid, nombre: c.nombreVisible || c.nombre })));
          setCategories(response.data);
        } else {
          setError("Error al cargar categorías");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Cuando se cargan las categorías y hay un categoryId (nombre), buscar por nombre y notificar con UUID
  useEffect(() => {
    // Evitar reinicializar si ya se procesó este categoryId
    const currentKey = `${categoryId}-${subcategoryId}`;
    if (initializedRef.current === currentKey) return;

    if (categories.length === 0 || !categoryId || categoryId === "") return;

    // Buscar categoría por nombre (categoryId es el nombre de la categoría)
    const category = categories.find((cat) => {
      const catName = cat.nombreVisible || cat.nombre || "";
      return catName === categoryId;
    });

    if (!category) {
      console.warn("Categoría no encontrada por nombre:", categoryId);
      return;
    }

    console.log("Inicializando categoría:", category.nombreVisible || category.nombre, "UUID:", category.uuid);

    // Actualizar estado interno con UUID
    setCurrentCategoryUuid(category.uuid);

    // Notificar con el UUID y el nombre de categoría
    const categoryName = category.nombreVisible || category.nombre || "";
    if (categoryName) {
      onCategoryChange(category.uuid, categoryName);
    }

    // Buscar subcategoría por nombre si existe
    if (subcategoryId && subcategoryId !== "none" && category.menus) {
      const menu = category.menus.find((m) => {
        const menuName = m.nombreVisible || m.nombre || "";
        return menuName === subcategoryId;
      });

      if (menu) {
        const menuName = menu.nombreVisible || menu.nombre || "";
        console.log("Inicializando subcategoría:", menuName, "UUID:", menu.uuid);
        setCurrentSubcategoryUuid(menu.uuid);
        if (menuName) {
          onSubcategoryChange(menu.uuid, menuName);
        }
      }
    }

    // Marcar como inicializado para este par específico
    initializedRef.current = currentKey;
  }, [categories, categoryId, subcategoryId, onCategoryChange, onSubcategoryChange]);

  // Usar el UUID interno si está disponible, sino buscar por nombre
  const selectedCategory = categories.find((cat) =>
    cat.uuid === currentCategoryUuid ||
    (cat.nombreVisible || cat.nombre) === categoryId
  );

  const handleCategoryChange = (newCategoryId: string) => {
    const category = categories.find((cat) => cat.uuid === newCategoryId);
    const categoryName = category?.nombreVisible || category?.nombre || "";
    setCurrentCategoryUuid(newCategoryId);
    setCurrentSubcategoryUuid("");
    onCategoryChange(newCategoryId, categoryName);
    onSubcategoryChange("none", "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoría *</Label>
        <Select value={currentCategoryUuid || categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.uuid} value={category.uuid}>
                {category.nombreVisible || category.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory?.menus && selectedCategory.menus.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoría (Opcional)</Label>
          <Select
            value={currentSubcategoryUuid || subcategoryId}
            onValueChange={(value) => {
              const menu = selectedCategory.menus.find((m) => m.uuid === value);
              const menuName = menu?.nombreVisible || menu?.nombre || "";
              setCurrentSubcategoryUuid(value);
              onSubcategoryChange(value, menuName);
            }}
          >
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Selecciona una subcategoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="none" value="none">Ninguna (mostrar en toda la categoría)</SelectItem>
              {selectedCategory.menus.map((menu) => (
                <SelectItem key={menu.uuid} value={menu.uuid}>
                  {menu.nombreVisible || menu.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
