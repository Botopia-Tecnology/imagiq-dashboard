"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  MapPin,
  ShoppingCart,
  DollarSign,
  Calendar,
  Smartphone,
  GitMerge,
} from "lucide-react";

export interface AudienceSegmentationData {
  operator: "AND" | "OR";
  audienceType: string;
  location: {
    countries: string[];
    cities: string[];
  };
  purchases: {
    operator: "less" | "equal" | "greater";
    value: number;
  };
  cartValue: {
    operator: "less" | "equal" | "greater";
    value: number;
  };
  ageRange: {
    min: number;
    max: number;
  };
  deviceType: {
    types: string[];
  };
}

interface AudienceSegmentationProps {
  data?: AudienceSegmentationData;
  onChange?: (data: AudienceSegmentationData) => void;
}

export function AudienceSegmentation({
  data,
  onChange,
}: AudienceSegmentationProps) {
  const [segmentData, setSegmentData] = useState<AudienceSegmentationData>(
    data || {
      operator: "AND",
      audienceType: "all",
      location: { countries: [], cities: [] },
      purchases: { operator: "equal", value: 0 },
      cartValue: { operator: "greater", value: 0 },
      ageRange: { min: 18, max: 65 },
      deviceType: { types: [] },
    }
  );

  const updateSegmentData = (updates: Partial<AudienceSegmentationData>) => {
    const newData = { ...segmentData, ...updates };
    setSegmentData(newData);
    onChange?.(newData);
  };

  return (
    <>
      {/* Tipo de Audiencia */}
      <div className="pr-6 pl-6 overflow-y-auto ">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Tipo de Audiencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={segmentData.audienceType}
              onValueChange={(value) =>
                updateSegmentData({ audienceType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de audiencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="customers">Solo clientes</SelectItem>
                <SelectItem value="leads">Solo leads</SelectItem>
                <SelectItem value="active">Usuarios activos</SelectItem>
                <SelectItem value="inactive">Usuarios inactivos</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <div className="p-6 overflow-y-auto  grid grid-cols-2 gap-6">
        {/* Operador Lógico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitMerge className="h-5 w-5" />
              Operador Lógico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={segmentData.operator}
              onValueChange={(value: "AND" | "OR") =>
                updateSegmentData({ operator: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AND" id="and" />
                <Label htmlFor="and" className="cursor-pointer">
                  Y (AND) - Cumplir todas las condiciones
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="OR" id="or" />
                <Label htmlFor="or" className="cursor-pointer">
                  O (OR) - Cumplir al menos una condición
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Ubicación Geográfica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Ubicación Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>País</Label>
              <Input
                placeholder="Ej: Colombia, México, Argentina..."
                value={segmentData.location.countries.join(", ")}
                onChange={(e) =>
                  updateSegmentData({
                    location: {
                      ...segmentData.location,
                      countries: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input
                placeholder="Ej: Bogotá, CDMX, Buenos Aires..."
                value={segmentData.location.cities.join(", ")}
                onChange={(e) =>
                  updateSegmentData({
                    location: {
                      ...segmentData.location,
                      cities: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Número de Compras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Número de Compras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={segmentData.purchases.operator}
                onValueChange={(value: "less" | "equal" | "greater") =>
                  updateSegmentData({
                    purchases: { ...segmentData.purchases, operator: value },
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less">Menor que</SelectItem>
                  <SelectItem value="equal">Igual a</SelectItem>
                  <SelectItem value="greater">Mayor que</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={segmentData.purchases.value}
                onChange={(e) =>
                  updateSegmentData({
                    purchases: {
                      ...segmentData.purchases,
                      value: parseInt(e.target.value),
                    },
                  })
                }
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Valor del Carrito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Valor del Carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={segmentData.cartValue.operator}
                onValueChange={(value: "less" | "equal" | "greater") =>
                  updateSegmentData({
                    cartValue: { ...segmentData.cartValue, operator: value },
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less">Menor que</SelectItem>
                  <SelectItem value="equal">Igual a</SelectItem>
                  <SelectItem value="greater">Mayor que</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                value={segmentData.cartValue.value}
                onChange={(e) =>
                  updateSegmentData({
                    cartValue: {
                      ...segmentData.cartValue,
                      value: parseFloat(e.target.value),
                    },
                  })
                }
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rango de Edad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Rango de Edad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Label>Edad Mínima</Label>
                <Input
                  type="number"
                  max="120"
                  value={segmentData.ageRange.min}
                  onChange={(e) =>
                    updateSegmentData({
                      ageRange: {
                        ...segmentData.ageRange,
                        min: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <Label>Edad Máxima</Label>
                <Input
                  type="number"
                  max="120"
                  value={segmentData.ageRange.max}
                  onChange={(e) =>
                    updateSegmentData({
                      ageRange: {
                        ...segmentData.ageRange,
                        max: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Dispositivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              Tipo de Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mobile"
                checked={segmentData.deviceType.types.includes("mobile")}
                onCheckedChange={(checked) => {
                  const types = checked
                    ? [...segmentData.deviceType.types, "mobile"]
                    : segmentData.deviceType.types.filter(
                        (t) => t !== "mobile"
                      );
                  updateSegmentData({
                    deviceType: { ...segmentData.deviceType, types },
                  });
                }}
              />
              <Label htmlFor="mobile" className="cursor-pointer">
                Móvil
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tablet"
                checked={segmentData.deviceType.types.includes("tablet")}
                onCheckedChange={(checked) => {
                  const types = checked
                    ? [...segmentData.deviceType.types, "tablet"]
                    : segmentData.deviceType.types.filter(
                        (t) => t !== "tablet"
                      );
                  updateSegmentData({
                    deviceType: { ...segmentData.deviceType, types },
                  });
                }}
              />
              <Label htmlFor="tablet" className="cursor-pointer">
                Tablet
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="desktop"
                checked={segmentData.deviceType.types.includes("desktop")}
                onCheckedChange={(checked) => {
                  const types = checked
                    ? [...segmentData.deviceType.types, "desktop"]
                    : segmentData.deviceType.types.filter(
                        (t) => t !== "desktop"
                      );
                  updateSegmentData({
                    deviceType: { ...segmentData.deviceType, types },
                  });
                }}
              />
              <Label htmlFor="desktop" className="cursor-pointer">
                Escritorio
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
