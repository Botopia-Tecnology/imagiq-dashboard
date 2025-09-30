"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignFormProps {
  previewData: any;
  setPreviewData: (data: any) => void;
}

export function CampaignForm({ previewData, setPreviewData }: CampaignFormProps) {
  const handleInputChange = (field: string, value: string) => {
    setPreviewData({
      ...previewData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Campaña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campaign-name">Nombre de campaña</Label>
              <Input
                id="campaign-name"
                placeholder="Ej: Black Friday 2024"
              />
            </div>
            <div>
              <Label htmlFor="segment">Segmento de audiencia</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  <SelectItem value="vip">Clientes VIP</SelectItem>
                  <SelectItem value="new">Clientes nuevos</SelectItem>
                  <SelectItem value="inactive">Clientes inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business-name">Nombre del negocio</Label>
            <Input
              id="business-name"
              value={previewData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Nombre de tu tienda"
            />
          </div>
          <div>
            <Label htmlFor="phone-number">Número de teléfono</Label>
            <Input
              id="phone-number"
              value={previewData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+57 300 123 4567"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="product-name">Nombre del producto</Label>
            <Input
              id="product-name"
              value={previewData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>
          <div>
            <Label htmlFor="product-description">Descripción del producto</Label>
            <Textarea
              id="product-description"
              value={previewData.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              placeholder="Describe las características principales..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="original-price">Precio original</Label>
              <Input
                id="original-price"
                value={previewData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                placeholder="$1.200.000"
              />
            </div>
            <div>
              <Label htmlFor="discount-price">Precio con descuento</Label>
              <Input
                id="discount-price"
                value={previewData.discountPrice}
                onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                placeholder="$999.000"
              />
            </div>
            <div>
              <Label htmlFor="discount">Descuento</Label>
              <Input
                id="discount"
                value={previewData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
                placeholder="-20%"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido del Mensaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="header-text">Texto del encabezado</Label>
            <Input
              id="header-text"
              value={previewData.headerText}
              onChange={(e) => handleInputChange('headerText', e.target.value)}
              placeholder="🔥 ¡Oferta especial solo hoy!"
            />
          </div>
          <div>
            <Label htmlFor="body-text">Texto del cuerpo</Label>
            <Textarea
              id="body-text"
              value={previewData.bodyText}
              onChange={(e) => handleInputChange('bodyText', e.target.value)}
              placeholder="Escribe aquí el mensaje principal..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="button-1">Texto botón 1</Label>
              <Input
                id="button-1"
                value={previewData.buttonText1}
                onChange={(e) => handleInputChange('buttonText1', e.target.value)}
                placeholder="🛒 Comprar Ahora"
              />
            </div>
            <div>
              <Label htmlFor="button-2">Texto botón 2</Label>
              <Input
                id="button-2"
                value={previewData.buttonText2}
                onChange={(e) => handleInputChange('buttonText2', e.target.value)}
                placeholder="ℹ️ Más Información"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cta-text">Llamada a la acción</Label>
            <Textarea
              id="cta-text"
              value={previewData.ctaText}
              onChange={(e) => handleInputChange('ctaText', e.target.value)}
              placeholder="Texto de llamada a la acción..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          Guardar como borrador
        </Button>
        <Button className="flex-1">
          Enviar campaña
        </Button>
      </div>
    </div>
  );
}