'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Bell,
  BarChart3
} from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  service: string;
  budgetAmount: number;
  currentSpend: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  alertThresholds: number[];
  status: 'on-track' | 'warning' | 'exceeded';
  createdAt: Date;
  lastUpdated: Date;
}

const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'AWS Infrastructure',
    service: 'AWS',
    budgetAmount: 1500,
    currentSpend: 1247.83,
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    status: 'warning',
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'OpenAI API Usage',
    service: 'OpenAI',
    budgetAmount: 600,
    currentSpend: 567.42,
    period: 'monthly',
    alertThresholds: [80, 95, 100],
    status: 'on-track',
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'Payment Processing',
    service: 'Epayco',
    budgetAmount: 400,
    currentSpend: 342.18,
    period: 'monthly',
    alertThresholds: [70, 85, 100],
    status: 'on-track',
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  {
    id: '4',
    name: 'Total Monthly Budget',
    service: 'All',
    budgetAmount: 3000,
    currentSpend: 2847.35,
    period: 'monthly',
    alertThresholds: [80, 90, 95],
    status: 'warning',
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  }
];

export function BudgetManagement() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    service: '',
    budgetAmount: 0,
    period: 'monthly' as const,
    alertThresholds: [75, 90, 100]
  });

  const getStatusColor = (status: string) => {
    if (status === 'exceeded') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'exceeded') return 'Excedido';
    if (status === 'warning') return 'Advertencia';
    return 'En rango';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculateUsagePercentage = (current: number, budget: number) => {
    return Math.min((current / budget) * 100, 100);
  };

  const createBudget = () => {
    const budget: Budget = {
      id: Date.now().toString(),
      ...newBudget,
      currentSpend: 0,
      status: 'on-track',
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setBudgets([...budgets, budget]);
    setIsCreateDialogOpen(false);
    setNewBudget({
      name: '',
      service: '',
      budgetAmount: 0,
      period: 'monthly',
      alertThresholds: [75, 90, 100]
    });
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpend = budgets.reduce((sum, budget) => sum + budget.currentSpend, 0);
  const budgetsOnTrack = budgets.filter(b => b.status === 'on-track').length;
  const budgetsExceeded = budgets.filter(b => b.status === 'exceeded').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {budgets.length} presupuestos activos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gasto Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((totalSpend / totalBudget) * 100).toFixed(1)}% del presupuesto
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Rango</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{budgetsOnTrack}</div>
            <div className="text-xs text-muted-foreground">
              Presupuestos saludables
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{budgetsExceeded}</div>
            <div className="text-xs text-muted-foreground">
              Requieren atención
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Presupuestos</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Presupuesto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
                  <DialogDescription>
                    Define un presupuesto para controlar los gastos de un servicio específico
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-name">Nombre del Presupuesto</Label>
                    <Input
                      id="budget-name"
                      placeholder="Ej: AWS Production Environment"
                      value={newBudget.name}
                      onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-service">Servicio</Label>
                    <Select
                      value={newBudget.service}
                      onValueChange={(value) => setNewBudget({...newBudget, service: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AWS">AWS</SelectItem>
                        <SelectItem value="OpenAI">OpenAI API</SelectItem>
                        <SelectItem value="Epayco">Epayco</SelectItem>
                        <SelectItem value="MongoDB">MongoDB</SelectItem>
                        <SelectItem value="Vercel">Vercel</SelectItem>
                        <SelectItem value="Datadog">Datadog</SelectItem>
                        <SelectItem value="All">Todos los servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget-amount">Monto ($)</Label>
                      <Input
                        id="budget-amount"
                        type="number"
                        placeholder="1000"
                        value={newBudget.budgetAmount}
                        onChange={(e) => setNewBudget({...newBudget, budgetAmount: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget-period">Período</Label>
                      <Select
                        value={newBudget.period}
                        onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') =>
                          setNewBudget({...newBudget, period: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createBudget}>
                      Crear Presupuesto
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Budget List */}
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const usagePercentage = calculateUsagePercentage(budget.currentSpend, budget.budgetAmount);
          const remaining = budget.budgetAmount - budget.currentSpend;

          return (
            <Card key={budget.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{budget.name}</h3>
                        <Badge variant="secondary" className={getStatusColor(budget.status)}>
                          {getStatusLabel(budget.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {budget.service} • {budget.period === 'monthly' ? 'Mensual' :
                         budget.period === 'quarterly' ? 'Trimestral' : 'Anual'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso del presupuesto</span>
                      <span className="font-medium">
                        ${budget.currentSpend.toLocaleString()} / ${budget.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={usagePercentage}
                      className="h-3"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{usagePercentage.toFixed(1)}% utilizado</span>
                      <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                        {remaining >= 0 ? `$${remaining.toLocaleString()} restante` :
                         `$${Math.abs(remaining).toLocaleString()} excedido`}
                      </span>
                    </div>
                  </div>

                  {budget.status !== 'on-track' && (
                    <Alert className={budget.status === 'exceeded' ? 'border-red-200' : 'border-yellow-200'}>
                      {budget.status === 'exceeded' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {budget.status === 'exceeded'
                          ? `Este presupuesto ha sido excedido por $${Math.abs(remaining).toLocaleString()}`
                          : `Este presupuesto está cerca del límite establecido`
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Última actualización: {budget.lastUpdated.toLocaleDateString()}</span>
                    <div className="flex items-center gap-4">
                      <span>Alertas: {budget.alertThresholds.join('%, ')}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}