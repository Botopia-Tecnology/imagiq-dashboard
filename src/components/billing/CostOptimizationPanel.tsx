'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Lightbulb,
  TrendingDown,
  Clock,
  Zap,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  Cpu,
  Database,
  Cloud,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface Recommendation {
  id: number;
  service: string;
  type: 'rightsizing' | 'usage' | 'reserved' | 'scheduling' | 'storage';
  title: string;
  description: string;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

interface CostOptimizationPanelProps {
  recommendations: Recommendation[];
}

export function CostOptimizationPanel({ recommendations }: CostOptimizationPanelProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [implementedRecommendations, setImplementedRecommendations] = useState<Set<number>>(new Set());

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);
  const implementedSavings = recommendations
    .filter(rec => implementedRecommendations.has(rec.id))
    .reduce((sum, rec) => sum + rec.potentialSavings, 0);

  const getTypeIcon = (type: string) => {
    const icons = {
      rightsizing: <Cpu className="h-4 w-4" />,
      usage: <BarChart3 className="h-4 w-4" />,
      reserved: <Calendar className="h-4 w-4" />,
      scheduling: <Clock className="h-4 w-4" />,
      storage: <Database className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Target className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      rightsizing: 'Redimensionamiento',
      usage: 'Optimización de Uso',
      reserved: 'Instancias Reservadas',
      scheduling: 'Programación',
      storage: 'Almacenamiento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  };

  const getEffortColor = (effort: string) => {
    if (effort === 'high') return 'text-red-600';
    if (effort === 'medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-green-600';
    if (impact === 'medium') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const markAsImplemented = (id: number) => {
    setImplementedRecommendations(prev => new Set([...prev, id]));
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] -
           priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ahorro Total Potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPotentialSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {recommendations.length} oportunidades
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ahorros Implementados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${implementedSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {implementedRecommendations.size} de {recommendations.length} aplicadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ROI Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {((totalPotentialSavings * 12) / 2847.35 * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Retorno anual proyectado
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Acciones Rápidas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Auto-optimización AWS</div>
                <div className="text-xs text-muted-foreground">
                  Aplicar recomendaciones automáticamente
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Análisis de Tendencias</div>
                <div className="text-xs text-muted-foreground">
                  Identificar patrones de uso
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Alertas Proactivas</div>
                <div className="text-xs text-muted-foreground">
                  Configurar notificaciones
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>Recomendaciones de Optimización</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{recommendation.title}</h3>
                      <Badge variant="secondary" className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority === 'high' ? 'Alta' :
                         recommendation.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(recommendation.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-medium text-green-600">
                          ${recommendation.potentialSavings.toLocaleString()}/mes
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={getEffortColor(recommendation.effort)}>
                          Esfuerzo {recommendation.effort === 'low' ? 'bajo' :
                                  recommendation.effort === 'medium' ? 'medio' : 'alto'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className={getImpactColor(recommendation.impact)}>
                          Impacto {recommendation.impact === 'high' ? 'alto' :
                                  recommendation.impact === 'medium' ? 'medio' : 'bajo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {implementedRecommendations.has(recommendation.id) ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Implementado
                    </Badge>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecommendation(recommendation)}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAsImplemented(recommendation.id)}
                      >
                        Implementar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Implementation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Guías de Implementación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Antes de implementar cualquier optimización,
              asegúrate de hacer un backup y probar en un entorno de desarrollo.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Pasos Recomendados:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Revisar el impacto potencial</li>
                <li>Validar en entorno de prueba</li>
                <li>Implementar gradualmente</li>
                <li>Monitorear resultados</li>
                <li>Documentar cambios</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Métricas a Monitorear:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Reducción de costos mensual</li>
                <li>Impacto en rendimiento</li>
                <li>Tiempo de respuesta</li>
                <li>Disponibilidad del servicio</li>
                <li>Uso de recursos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}