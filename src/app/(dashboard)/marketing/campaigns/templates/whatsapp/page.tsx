"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Edit, Trash2, MessageSquare, Eye, TrendingUp, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { WhatsAppTemplate } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappTemplateEndpoints } from "@/lib/api";
import { mapBackendArrayToFrontend } from "@/lib/whatsappTemplateMapper";
import { toast } from "sonner";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Activa</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactiva</Badge>;
    case 'pending':
      return <Badge variant="outline" className="border-yellow-300 text-yellow-800 dark:border-yellow-700 dark:text-yellow-300">Pendiente</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rechazada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'MARKETING':
      return <Badge variant="outline" className="border-blue-300 text-blue-800 dark:border-blue-700 dark:text-blue-300">Marketing</Badge>;
    case 'UTILITY':
      return <Badge variant="outline" className="border-purple-300 text-purple-800 dark:border-purple-700 dark:text-purple-300">Utilidad</Badge>;
    case 'AUTHENTICATION':
      return <Badge variant="outline" className="border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-300">Autenticación</Badge>;
    default:
      return <Badge variant="secondary">{category}</Badge>;
  }
};

const MetricCard = ({ label, value, change, icon: Icon, compact = false }: {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  compact?: boolean;
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-2 border rounded bg-background/50">
        <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <div className="text-xs">
          <div className="font-medium truncate">{value}</div>
          <div className="text-muted-foreground truncate">{label}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            <span className="text-xs">{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default function WhatsAppTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await whatsappTemplateEndpoints.getAll();
        
        if (response.success && response.data) {
          const mappedTemplates = mapBackendArrayToFrontend(response.data);
          setTemplates(mappedTemplates);
        } else {
          console.error("Error fetching templates:", response.message);
          toast.error("Error al cargar las plantillas");
          setTemplates([]);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Error al conectar con el servidor");
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const columns: ColumnDef<WhatsAppTemplate>[] = [
    {
      accessorKey: "name",
      header: "Plantilla",
      size: 200,
      minSize: 160,
      maxSize: 200,
      cell: ({ row }) => {
        const template = row.original;
        // Procesar el texto para reemplazar placeholders con badges inline
        const renderBodyWithVariables = () => {
          if (!template.body) return null;
          
          // Normalizar espacios múltiples a uno solo
          let processedText = template.body.replace(/\s+/g, ' ').trim();
          
          // Si no hay variables, retornar el texto directamente
          if (!template.variables || template.variables.length === 0) {
            return <span>{processedText}</span>;
          }
          
          // Dividir el texto por los placeholders {{número}}
          const parts: (string | number)[] = [];
          let lastIndex = 0;
          const placeholderRegex = /\{\{(\d+)\}\}/g;
          let match;
          let foundPlaceholders = false;
          
          while ((match = placeholderRegex.exec(processedText)) !== null) {
            foundPlaceholders = true;
            // Agregar texto antes del placeholder
            if (match.index > lastIndex) {
              parts.push(processedText.substring(lastIndex, match.index));
            }
            
            // Agregar el índice de la variable (restar 1 porque los placeholders empiezan en 1)
            const varIndex = parseInt(match[1], 10) - 1;
            parts.push(varIndex);
            
            lastIndex = match.index + match[0].length;
          }
          
          // Agregar el texto restante
          if (lastIndex < processedText.length) {
            parts.push(processedText.substring(lastIndex));
          }
          
          // Si no se encontraron placeholders, retornar el texto original
          if (!foundPlaceholders) {
            return <span>{processedText}</span>;
          }
          
          // Si parts está vacío, retornar el texto original
          if (parts.length === 0) {
            return <span>{processedText}</span>;
          }
          
          // Renderizar con badges inline
          return (
            <span>
              {parts.map((part, index) => {
                if (typeof part === 'number') {
                  // Es un índice de variable
                  const variable = template.variables?.[part];
                  if (variable) {
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 inline-flex align-middle mx-0.5 bg-muted/50 border-muted-foreground/30"
                      >
                        {variable}
                      </Badge>
                    );
                  }
                  return null;
                }
                // Es texto normal
                return <span key={index}>{part}</span>;
              })}
            </span>
          );
        };
        
        return (
          <div className="space-y-1.5 py-2" style={{ maxWidth: '200px', wordBreak: 'break-word' }}>
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="font-medium truncate">{template.name}</span>
            </div>
            <div className="text-xs text-muted-foreground" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
              {renderBodyWithVariables()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categoría",
      size: 120,
      minSize: 100,
      cell: ({ row }) => getCategoryBadge(row.getValue("category")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      size: 100,
      minSize: 80,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "metrics",
      header: "Métricas",
      size: 350,
      minSize: 280,
      accessorFn: (row) => {
        // Calcular rendimiento basado en CTR
        const ctr = row.metrics.ctr;
        if (ctr >= 20) return "high";
        if (ctr >= 10) return "medium";
        return "low";
      },
      cell: ({ row }) => {
        const template = row.original;
        return (
          <TooltipProvider>
            {/* Layout responsivo: compacto en pantallas medianas, normal en grandes */}
            <div className="w-full max-w-[320px]">
              {/* Layout compacto para pantallas medianas (md:900px-lg:1024px) */}
              <div className="block xl:hidden">
                <div className="space-y-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MetricCard
                        label="Enviados"
                        value={template.metrics.sent.toLocaleString()}
                        icon={MessageSquare}
                        compact
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de mensajes enviados</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MetricCard
                          label="Tasa apertura"
                          value={`${template.metrics.openRate}%`}
                          change={template.status === 'active' ? Number.parseFloat((Math.random() * 10 - 5).toFixed(1)) : undefined}
                          icon={Eye}
                          compact
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Porcentaje de mensajes leídos</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MetricCard
                          label="CTR"
                          value={`${template.metrics.ctr}%`}
                          change={template.status === 'active' ? Number.parseFloat((Math.random() * 8 - 4).toFixed(1)) : undefined}
                          icon={TrendingUp}
                          compact
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tasa de clics sobre mensajes enviados</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Layout normal para pantallas grandes (xl:1280px+) */}
              <div className="hidden xl:block">
                <div className="grid grid-cols-1 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MetricCard
                        label="Enviados"
                        value={template.metrics.sent.toLocaleString()}
                        icon={MessageSquare}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de mensajes enviados</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MetricCard
                        label="Tasa apertura"
                        value={`${template.metrics.openRate}%`}
                        change={template.status === 'active' ? Number.parseFloat((Math.random() * 10 - 5).toFixed(1)) : undefined}
                        icon={Eye}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Porcentaje de mensajes leídos</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MetricCard
                        label="CTR"
                        value={`${template.metrics.ctr}%`}
                        change={template.status === 'active' ? Number.parseFloat((Math.random() * 8 - 4).toFixed(1)) : undefined}
                        icon={TrendingUp}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tasa de clics sobre mensajes enviados</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </TooltipProvider>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "lastUsed",
      header: "Último uso",
      size: 120,
      minSize: 100,
      cell: ({ row }) => {
        const date = row.getValue("lastUsed") as Date;
        return date ? date.toLocaleDateString() : "Nunca";
      },
    },
    {
      id: "actions",
      enableHiding: false,
      size: 60,
      minSize: 50,
      cell: ({ row }) => {
        const template = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/marketing/campaigns/templates/whatsapp/${template.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar plantilla
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Vista previa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implementar duplicación
                  console.log('Duplicating template:', template.id);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar plantilla
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La plantilla "{template.name}" será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const statusOptions = [
    { label: "Activa", value: "active" },
    { label: "Inactiva", value: "inactive" },
    { label: "Pendiente", value: "pending" },
    { label: "Rechazada", value: "rejected" },
  ];

  const categoryOptions = [
    { label: "Marketing", value: "MARKETING" },
    { label: "Utilidad", value: "UTILITY" },
    { label: "Autenticación", value: "AUTHENTICATION" },
  ];

  const performanceOptions = [
    { label: "Alto rendimiento", value: "high" },
    { label: "Rendimiento medio", value: "medium" },
    { label: "Bajo rendimiento", value: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plantillas de WhatsApp</h1>
          <p className="text-muted-foreground">
            Gestiona y monitorea tus plantillas de mensajes de WhatsApp
          </p>
        </div>
        <Link href="/marketing/campaigns/crear/whatsapp/template">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva plantilla
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total plantillas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {templates.filter(t => t.status === 'active').length} activas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes enviados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {templates.reduce((acc, t) => acc + t.metrics.sent, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa apertura promedio</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {templates.length > 0 
                    ? (templates.reduce((acc, t) => acc + t.metrics.openRate, 0) / templates.length).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <p className="text-xs text-green-600">
                  +2.1% vs mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {templates.length > 0
                    ? (templates.reduce((acc, t) => acc + t.metrics.ctr, 0) / templates.length).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <p className="text-xs text-green-600">
                  +1.8% vs mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={templates}
            searchKey="name"
            loading={isLoading}
            filters={[
              {
                id: "status",
                title: "Estado",
                options: statusOptions,
              },
              {
                id: "category",
                title: "Categoría",
                options: categoryOptions,
              },
              {
                id: "metrics",
                title: "Rendimiento",
                options: performanceOptions,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}