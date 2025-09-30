'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Settings,
  BarChart3
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

interface ServiceCostTableProps {
  services: Service[];
  detailed?: boolean;
}

export function ServiceCostTable({ services, detailed = false }: ServiceCostTableProps) {
  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-red-600';
    if (trend === 'down') return 'text-green-600';
    return 'text-gray-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Cloud Infrastructure': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'AI/ML Services': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      'Payment Processing': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'Database': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'Hosting': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      'Monitoring': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      'Authentication': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Costos por Servicio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detalle de gastos y tendencias por servicio
            </p>
          </div>
          {detailed && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Análisis
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Costo Mensual</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Tendencia</TableHead>
              {detailed && <TableHead>Descripción</TableHead>}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.service}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {service.icon}
                    </div>
                    <div>
                      <div className="font-medium">{service.service}</div>
                      {detailed && (
                        <div className="text-xs text-muted-foreground">
                          Última actualización: hace 2 horas
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(service.category)}>
                    {service.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    ${service.cost.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={service.usage} className="w-16" />
                    <span className="text-sm text-muted-foreground">
                      {service.usage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(service.trend, service.change)}
                    <span className={`text-sm ${getTrendColor(service.trend)}`}>
                      {service.change > 0 ? '+' : ''}{service.change}%
                    </span>
                  </div>
                </TableCell>
                {detailed && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs">
                      {service.description}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}