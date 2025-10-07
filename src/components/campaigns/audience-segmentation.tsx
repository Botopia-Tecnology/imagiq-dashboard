"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Users, X } from "lucide-react";

export interface AudienceSegmentationData {
  targetAudience?: string;
  selectedCities: string[];
  purchaseOperator: string;
  purchaseCount: number;
  minAge: number;
  maxAge: number;
}

interface AudienceSegmentationProps {
  data: AudienceSegmentationData;
  onChange: (data: AudienceSegmentationData) => void;
  cities?: { value: string; label: string }[];
}

export function AudienceSegmentation({
  data,
  onChange,
  cities = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Cali", label: "Cali" },
    { value: "Medellín", label: "Medellín" },
    { value: "Barranquilla", label: "Barranquilla" },
    { value: "Cartagena", label: "Cartagena" },
  ],
}: AudienceSegmentationProps) {
  const [cityInput, setCityInput] = useState("");

  const handleAddCity = (city: string) => {
    if (city && !data.selectedCities.includes(city)) {
      onChange({
        ...data,
        selectedCities: [...data.selectedCities, city],
      });
      setCityInput("");
    }
  };

  const handleRemoveCity = (city: string) => {
    onChange({
      ...data,
      selectedCities: data.selectedCities.filter((c) => c !== city),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Segmentación de Audiencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audience Selector */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Audiencia</Label>
          <Select
            value={data.targetAudience}
            onValueChange={(value) => onChange({ ...data, targetAudience: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar audiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <SelectItem value="subscribers">Solo suscriptores</SelectItem>
              <SelectItem value="customers">Solo clientes</SelectItem>
              <SelectItem value="visitors">Visitantes nuevos</SelectItem>
              <SelectItem value="returning">Usuarios recurrentes</SelectItem>
              <SelectItem value="inactive">Usuarios inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cities */}
        <div className="space-y-2">
          <Label htmlFor="citySelector">Ciudades</Label>
          <Select
            value={cityInput}
            onValueChange={(value) => {
              setCityInput(value);
              handleAddCity(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ciudad" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.selectedCities.map((city) => (
                <Badge key={city} variant="secondary" className="flex items-center gap-1">
                  {city}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveCity(city);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Count */}
        <div className="space-y-2">
          <Label>Número de Compras</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={data.purchaseOperator}
              onValueChange={(value) =>
                onChange({
                  ...data,
                  purchaseOperator: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Operador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greater">Mayor que (&gt;)</SelectItem>
                <SelectItem value="greaterEqual">Mayor o igual (≥)</SelectItem>
                <SelectItem value="equal">Igual a (=)</SelectItem>
                <SelectItem value="lessEqual">Menor o igual (≤)</SelectItem>
                <SelectItem value="less">Menor que (&lt;)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              
              placeholder="Cantidad"
              value={data.purchaseCount}
              onChange={(e) =>
                onChange({
                  ...data,
                  purchaseCount: parseInt(e.target.value) ,
                })
              }
            />
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>
            Rango de Edad: {data.minAge} - {data.maxAge} años
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Edad mínima</Label>
              <Slider
                value={[data.minAge]}
                onValueChange={(value) => {
                  const newMin = value[0];
                  onChange({
                    ...data,
                    minAge: newMin,
                    maxAge: Math.max(newMin, data.maxAge),
                  });
                }}
                max={100}
                min={13}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Edad máxima</Label>
              <Slider
                value={[data.maxAge]}
                onValueChange={(value) => {
                  const newMax = value[0];
                  onChange({
                    ...data,
                    maxAge: newMax,
                    minAge: Math.min(data.minAge, newMax),
                  });
                }}
                max={100}
                min={13}
                step={1}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
