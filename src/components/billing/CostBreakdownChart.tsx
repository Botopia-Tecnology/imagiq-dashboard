'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Service {
  service: string;
  icon: React.ReactNode;
  cost: number;
  usage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: string;
  description: string;
}

interface CostBreakdownChartProps {
  services: Service[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
];

export function CostBreakdownChart({ services }: CostBreakdownChartProps) {
  const chartData = services.map((service, index) => ({
    name: service.service,
    value: service.cost,
    percentage: (service.cost / services.reduce((sum, s) => sum + s.cost, 0) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-col gap-2 text-sm">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1">{entry.value}</span>
            <span className="font-medium">
              ${chartData[index]?.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Costos por Servicio</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribución del gasto mensual
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Section */}
          <div className="flex flex-col justify-center">
            <h4 className="font-medium mb-4">Servicios</h4>
            <div className="space-y-3">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      ${entry.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}