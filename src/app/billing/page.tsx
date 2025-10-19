'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Cloud,
  Database,
  Cpu,
  Zap,
  MessageSquare,
  CreditCard,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  Bell,
  Filter
} from 'lucide-react';

import { CostBreakdownChart } from '@/components/billing/CostBreakdownChart';
import { ServiceCostTable } from '@/components/billing/ServiceCostTable';
import { CostOptimizationPanel } from '@/components/billing/CostOptimizationPanel';
import { BudgetManagement } from '@/components/billing/BudgetManagement';
import { UsageAnalytics } from '@/components/billing/UsageAnalytics';
import { BillingAlerts } from '@/components/billing/BillingAlerts';

// Type definitions
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

// Mock data for demonstration
const currentMonthTotal = 2847.35;
const lastMonthTotal = 2631.22;
const monthlyChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

const servicesCosts: Service[] = [
  {
    service: 'AWS',
    icon: <Cloud className="h-5 w-5" />,
    cost: 1247.83,
    usage: 85,
    trend: 'up',
    change: 12.5,
    category: 'Cloud Infrastructure',
    description: 'EC2, S3, RDS, CloudFront'
  },
  {
    service: 'OpenAI API',
    icon: <MessageSquare className="h-5 w-5" />,
    cost: 567.42,
    usage: 73,
    trend: 'up',
    change: 28.3,
    category: 'AI/ML Services',
    description: 'GPT-4, GPT-3.5, Embeddings'
  },
  {
    service: 'Epayco',
    icon: <CreditCard className="h-5 w-5" />,
    cost: 342.18,
    usage: 68,
    trend: 'down',
    change: -5.2,
    category: 'Payment Processing',
    description: 'Transaction fees, Gateway'
  },
  {
    service: 'Database (MongoDB)',
    icon: <Database className="h-5 w-5" />,
    cost: 298.67,
    usage: 92,
    trend: 'up',
    change: 8.7,
    category: 'Database',
    description: 'Atlas cluster, Backup'
  },
  {
    service: 'Vercel Hosting',
    icon: <Zap className="h-5 w-5" />,
    cost: 189.45,
    usage: 45,
    trend: 'stable',
    change: 1.2,
    category: 'Hosting',
    description: 'Pro plan, Bandwidth'
  },
  {
    service: 'Datadog',
    icon: <BarChart3 className="h-5 w-5" />,
    cost: 156.80,
    usage: 78,
    trend: 'up',
    change: 15.6,
    category: 'Monitoring',
    description: 'APM, Logs, Metrics'
  },
  {
    service: 'Auth0',
    icon: <Cpu className="h-5 w-5" />,
    cost: 45.00,
    usage: 34,
    trend: 'stable',
    change: 0,
    category: 'Authentication',
    description: 'MAU, Enterprise features'
  }
];

const optimizationRecommendations: Recommendation[] = [
  {
    id: 1,
    service: 'AWS',
    type: 'rightsizing',
    title: 'Optimizar instancias EC2',
    description: 'Se detectaron 3 instancias t3.large subutilizadas que podrían reducirse a t3.medium',
    potentialSavings: 186.40,
    effort: 'low',
    impact: 'medium',
    priority: 'high'
  },
  {
    id: 2,
    service: 'OpenAI API',
    type: 'usage',
    title: 'Implementar caché de respuestas',
    description: 'El 23% de las consultas son repetitivas y podrían almacenarse en caché',
    potentialSavings: 130.51,
    effort: 'medium',
    impact: 'high',
    priority: 'high'
  },
  {
    id: 3,
    service: 'AWS',
    type: 'reserved',
    title: 'Comprar instancias reservadas',
    description: 'Para cargas de trabajo estables, las instancias reservadas ofrecen 40% descuento',
    potentialSavings: 249.57,
    effort: 'low',
    impact: 'high',
    priority: 'medium'
  }
];

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showOptimizations, setShowOptimizations] = useState(true);

  const totalPotentialSavings = optimizationRecommendations.reduce(
    (sum, rec) => sum + rec.potentialSavings, 0
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación y Costos</h1>
          <p className="text-muted-foreground">
            Gestiona y optimiza los costos de tus servicios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mes Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthTotal.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              )}
              {Math.abs(monthlyChange).toFixed(1)}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Potencial</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPotentialSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {optimizationRecommendations.length} oportunidades detectadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCosts.length}</div>
            <div className="text-xs text-muted-foreground">
              {servicesCosts.filter(s => s.trend === 'up').length} en crecimiento
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-xs text-muted-foreground">
              2 presupuesto, 1 uso inusual
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Banner */}
      {showOptimizations && (
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Oportunidades de Optimización Detectadas
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Puedes ahorrar hasta ${totalPotentialSavings.toLocaleString()}
                    implementando las recomendaciones sugeridas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Ver Recomendaciones
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptimizations(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="optimization">Optimización</TabsTrigger>
          <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CostBreakdownChart services={servicesCosts} />
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Costos (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Gráfico de tendencia de costos
                </div>
              </CardContent>
            </Card>
          </div>

          <ServiceCostTable services={servicesCosts} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceCostTable services={servicesCosts} detailed={true} />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <CostOptimizationPanel recommendations={optimizationRecommendations} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <UsageAnalytics services={servicesCosts} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <BillingAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}