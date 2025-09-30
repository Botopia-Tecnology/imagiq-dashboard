'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Clock,
  Target
} from 'lucide-react';

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

interface UsageAnalyticsProps {
  services: Service[];
}

// Mock data for analytics
const monthlyTrendData = [
  { month: 'Ene', AWS: 1150, OpenAI: 420, Epayco: 380, MongoDB: 280, Vercel: 160, Datadog: 140 },
  { month: 'Feb', AWS: 1200, OpenAI: 450, Epayco: 360, MongoDB: 290, Vercel: 170, Datadog: 145 },
  { month: 'Mar', AWS: 1180, OpenAI: 480, Epayco: 340, MongoDB: 285, Vercel: 175, Datadog: 150 },
  { month: 'Abr', AWS: 1220, OpenAI: 510, Epayco: 355, MongoDB: 295, Vercel: 180, Datadog: 152 },
  { month: 'May', AWS: 1190, OpenAI: 540, Epayco: 345, MongoDB: 292, Vercel: 185, Datadog: 155 },
  { month: 'Jun', AWS: 1248, OpenAI: 567, Epayco: 342, MongoDB: 299, Vercel: 189, Datadog: 157 }
];

const dailyUsageData = [
  { day: '1', requests: 1250, cost: 45.20 },
  { day: '2', requests: 1180, cost: 42.80 },
  { day: '3', requests: 1420, cost: 51.30 },
  { day: '4', requests: 1320, cost: 47.90 },
  { day: '5', requests: 1580, cost: 57.20 },
  { day: '6', requests: 1280, cost: 46.40 },
  { day: '7', requests: 1150, cost: 41.70 },
  { day: '8', requests: 1380, cost: 49.90 },
  { day: '9', requests: 1450, cost: 52.60 },
  { day: '10', requests: 1520, cost: 55.10 }
];

const usageByTimeData = [
  { hour: '00', usage: 15 },
  { hour: '02', usage: 12 },
  { hour: '04', usage: 8 },
  { hour: '06', usage: 25 },
  { hour: '08', usage: 85 },
  { hour: '10', usage: 95 },
  { hour: '12', usage: 100 },
  { hour: '14', usage: 90 },
  { hour: '16', usage: 88 },
  { hour: '18', usage: 75 },
  { hour: '20', usage: 65 },
  { hour: '22', usage: 45 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function UsageAnalytics({ services }: UsageAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('cost');
  const [selectedService, setSelectedService] = useState('all');

  const totalRequests = dailyUsageData.reduce((sum, day) => sum + day.requests, 0);
  const avgDailyCost = dailyUsageData.reduce((sum, day) => sum + day.cost, 0) / dailyUsageData.length;
  const peakUsageHour = usageByTimeData.reduce((max, hour) => hour.usage > max.usage ? hour : max, usageByTimeData[0]);

  const getServiceTrend = (serviceName: string) => {
    const currentMonth = monthlyTrendData[monthlyTrendData.length - 1];
    const previousMonth = monthlyTrendData[monthlyTrendData.length - 2];
    const current = currentMonth[serviceName as keyof typeof currentMonth] as number;
    const previous = previousMonth[serviceName as keyof typeof previousMonth] as number;
    const change = ((current - previous) / previous) * 100;
    return { current, previous, change };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Análisis de Uso y Rendimiento</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  <SelectItem value="AWS">AWS</SelectItem>
                  <SelectItem value="OpenAI">OpenAI API</SelectItem>
                  <SelectItem value="Epayco">Epayco</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Costo Promedio Diario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDailyCost.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3.2% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hora Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakUsageHour.hour}:00</div>
            <div className="text-xs text-muted-foreground">
              {peakUsageHour.usage}% de uso máximo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-xs text-muted-foreground">
              Optimización de recursos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Costos por Servicio</CardTitle>
            <p className="text-sm text-muted-foreground">Evolución mensual de gastos</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, '']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Line type="monotone" dataKey="AWS" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="OpenAI" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="Epayco" stroke="#FFBB28" strokeWidth={2} />
                  <Line type="monotone" dataKey="MongoDB" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patrón de Uso Diario</CardTitle>
            <p className="text-sm text-muted-foreground">Actividad por hora del día</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageByTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Uso']}
                    labelFormatter={(label) => `${label}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Servicio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Análisis detallado de uso y eficiencia
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.slice(0, 4).map((service) => {
              const trend = getServiceTrend(service.service);
              return (
                <div key={service.service} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {service.icon}
                      <div>
                        <h3 className="font-medium">{service.service}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${trend.current.toLocaleString()}</div>
                      <div className={`text-sm flex items-center ${
                        trend.change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {trend.change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(trend.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Uso Actual</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={service.usage} className="flex-1 h-2" />
                        <span className="font-medium">{service.usage}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Eficiencia</div>
                      <div className="font-medium mt-1">
                        {Math.floor(Math.random() * 20) + 80}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Predicción</div>
                      <div className="font-medium mt-1">
                        ${(trend.current * 1.05).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests vs Costo (Últimos 10 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="requests" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Uso por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={services.slice(0, 6).map((service, index) => ({
                      name: service.service,
                      value: service.usage,
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {services.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}