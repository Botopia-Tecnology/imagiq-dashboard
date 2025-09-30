"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { OperatorProfile } from "@/types/warehouse";
import {
  Users,
  Crown,
  Shield,
  Settings,
  Eye,
  Target,
  Zap,
  TrendingUp
} from "lucide-react";

interface OperatorsPanelProps {
  operators: OperatorProfile[];
  currentShift: 'morning' | 'afternoon' | 'night';
}

export function OperatorsPanel({ operators, currentShift }: OperatorsPanelProps) {
  const activeOperators = operators.filter(op => op.isActive && op.shift === currentShift);
  const topPerformer = activeOperators.reduce((top, op) =>
    op.performance.unitsPerHour > top.performance.unitsPerHour ? op : top,
    activeOperators[0]
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coordinator':
        return <Crown className="h-4 w-4" />;
      case 'supervisor':
        return <Shield className="h-4 w-4" />;
      case 'quality_controller':
        return <Target className="h-4 w-4" />;
      case 'operator':
        return <Settings className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'text-purple-600 dark:text-purple-400';
      case 'supervisor':
        return 'text-blue-600 dark:text-blue-400';
      case 'quality_controller':
        return 'text-green-600 dark:text-green-400';
      case 'operator':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      coordinator: 'Coordinadora',
      supervisor: 'Supervisor',
      quality_controller: 'Control Calidad',
      operator: 'Operario'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getPerformanceLevel = (uph: number) => {
    if (uph >= 85) return { level: 'Excelente', color: 'bg-green-500', progress: 100 };
    if (uph >= 75) return { level: 'Bueno', color: 'bg-blue-500', progress: 80 };
    if (uph >= 65) return { level: 'Regular', color: 'bg-yellow-500', progress: 60 };
    return { level: 'Bajo', color: 'bg-red-500', progress: 40 };
  };

  const shiftLabels = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Operarios - Turno {shiftLabels[currentShift]} ({activeOperators.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top Performer Highlight */}
        {topPerformer && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{topPerformer.name}</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Mejor Rendimiento
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {topPerformer.performance.unitsPerHour} UPH • {topPerformer.performance.accuracy}% precisión
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operators List */}
        <div className="space-y-3">
          {activeOperators.map((operator) => {
            const performance = getPerformanceLevel(operator.performance.unitsPerHour);

            return (
              <div key={operator.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{operator.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{operator.name}</span>
                      <div className={`flex items-center gap-1 ${getRoleColor(operator.role)}`}>
                        {getRoleIcon(operator.role)}
                        <span className="text-xs">{getRoleLabel(operator.role)}</span>
                      </div>
                      {operator.zone && operator.zone !== 'ALL' && (
                        <Badge variant="outline" className="text-xs">
                          Zona {operator.zone}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{operator.performance.unitsPerHour} UPH</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{operator.performance.accuracy}% precisión</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{operator.performance.ordersCompleted} órdenes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">Errores: {operator.performance.errorRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="mb-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        performance.level === 'Excelente' ? 'bg-green-100 text-green-800 border-green-300' :
                        performance.level === 'Bueno' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        performance.level === 'Regular' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {performance.level}
                    </Badge>
                  </div>
                  <Progress
                    value={performance.progress}
                    className="w-16 h-2"
                  />
                </div>
              </div>
            );
          })}

          {activeOperators.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay operarios activos en este turno
            </div>
          )}
        </div>

        {/* Shift Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {activeOperators.reduce((sum, op) => sum + op.performance.ordersCompleted, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Órdenes Completadas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(activeOperators.reduce((sum, op) => sum + op.performance.unitsPerHour, 0) / activeOperators.length || 0)}
              </div>
              <div className="text-xs text-muted-foreground">UPH Promedio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(activeOperators.reduce((sum, op) => sum + op.performance.accuracy, 0) / activeOperators.length * 10) / 10 || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Precisión Media</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}