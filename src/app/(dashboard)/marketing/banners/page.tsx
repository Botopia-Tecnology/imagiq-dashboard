"use client";

import { BannerStatsCard } from "@/components/banners/stats/banner-stats-card";
import { BannersTable } from "@/components/banners/tables/banners-table";
import { Button } from "@/components/ui/button";
import { Plus, Eye, MousePointer, TrendingUp, Image } from "lucide-react";
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

      {/* Banners Table */}
      <BannersTable />
    </div>
  );
}