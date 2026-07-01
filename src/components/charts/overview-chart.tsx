"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "hsl(142, 76%, 36%)", // Verde más vibrante
  },
};

interface OverviewChartProps {
  data: Array<{
    month: string;
    sales: number;
  }>;
}

const currencyCOP = (value: number | string) =>
  Intl.NumberFormat("es-CO", {
    currency: "COP",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export function OverviewChart({ data }: Readonly<OverviewChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] sm:h-[300px] lg:h-[350px] w-full items-center justify-center text-sm text-muted-foreground">
        Sin datos para el período seleccionado
      </div>
    );
  }
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[250px] sm:h-[300px] lg:h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fontSize: 10 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            width={45}
            tick={{ fontSize: 10 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [currencyCOP(value as number), " Ventas"]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="hsl(142, 76%, 36%)"
            fill="hsl(142, 76%, 36%)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
