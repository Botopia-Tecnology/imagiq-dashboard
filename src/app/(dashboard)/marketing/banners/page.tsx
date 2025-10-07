"use client";

import { BannerStatsCard } from "@/components/banners/stats/banner-stats-card";
import { BannersTable } from "@/components/banners/tables/banners-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, MousePointer, TrendingUp, Image, Play, Smartphone, Component } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BannersPage() {
  const router = useRouter();

  const handleCreateBanner = () => {
    router.push('/marketing/banners/crear/seleccionar-tipo');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners Hero</h1>
          <p className="text-muted-foreground">
            Gestiona los banners del hero section de tu tienda
          </p>
        </div>
        <Button onClick={handleCreateBanner}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Banner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BannerStatsCard
          title="Total Impresiones"
          value="105,780"
          subtitle="Último mes"
          progress={82}
          icon={Eye}
          trend={{ value: "15.3%", isPositive: true }}
        />
        <BannerStatsCard
          title="Total Clicks"
          value="3,540"
          subtitle="Último mes"
          progress={89}
          icon={MousePointer}
          trend={{ value: "9.7%", isPositive: true }}
        />
        <BannerStatsCard
          title="CTR Promedio"
          value="3.35%"
          subtitle="Click-through rate"
          progress={85}
          icon={TrendingUp}
          trend={{ value: "0.2%", isPositive: true }}
        />
        <BannerStatsCard
          title="Banners Activos"
          value="2"
          subtitle="De 5 totales"
          progress={40}
          icon={Image}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Banners Table */}
        <div className="col-span-5">
          <BannersTable />
        </div>

        {/* Types Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tipos de Banner Hero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Image className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-medium">Imagen</div>
                    <div className="text-sm text-muted-foreground">1 banner inactivo</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/marketing/banners/crear?type=image')}>
                  Crear
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Play className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">Video</div>
                    <div className="text-sm text-muted-foreground">1 banner activo</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/marketing/banners/crear?type=video')}>
                  Crear
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Component className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-medium">Componente</div>
                    <div className="text-sm text-muted-foreground">3 banners (1 activo)</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/marketing/banners/crear?type=component')}>
                  Crear
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Orden de visualización:</strong>
                </div>
                <div className="text-xs text-muted-foreground">
                  Los banners se muestran según su orden numérico en el hero section.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}