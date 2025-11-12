"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryEndpoints.getVisibleCompletas();

        if (response.success && response.data) {
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

  const selectedCategory = categories.find((cat) => cat.uuid === categoryId);

  const handleCategoryChange = (newCategoryId: string) => {
    const category = categories.find((cat) => cat.uuid === newCategoryId);
    const categoryName = category?.nombreVisible || category?.nombre || "";
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
        <Select value={categoryId} onValueChange={handleCategoryChange}>
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
            value={subcategoryId}
            onValueChange={(value) => {
              const menu = selectedCategory.menus.find((m) => m.uuid === value);
              const menuName = menu?.nombreVisible || menu?.nombre || "";
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
