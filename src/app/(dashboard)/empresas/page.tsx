"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Factory,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  CorporateLead,
  CorporateLeadsStats,
  corporateLeadsEndpoints,
  ESTADO_CONFIG,
  ESTADO_OPTIONS,
} from "@/features/corporate-leads/api";
import { LeadDetailSheet } from "./components/lead-detail-sheet";

const PAGE_SIZE = 20;

const formatDateShort = (dateString: string) =>
  new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));

const formatTime = (dateString: string) =>
  new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

export default function EmpresasPage() {
  const [leads, setLeads] = useState<CorporateLead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<CorporateLeadsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  const [selectedLead, setSelectedLead] = useState<CorporateLead | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await corporateLeadsEndpoints.stats();
      if (response.success && response.data?.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching corporate leads stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await corporateLeadsEndpoints.list({
        page: currentPage,
        limit: PAGE_SIZE,
        estado: estadoFilter === "all" ? "" : estadoFilter,
        industry: industryFilter === "all" ? "" : industryFilter,
        search: debouncedSearch,
      });
      if (response.success && response.data?.data) {
        setLeads(response.data.data.items || []);
        setTotal(response.data.data.total || 0);
        setTotalPages(response.data.data.pages || 0);
      } else {
        setLeads([]);
        setError(response.message || "Error al cargar los leads");
      }
    } catch (err) {
      console.error("Error fetching corporate leads:", err);
      setLeads([]);
      setError("Error de conexión al cargar los leads");
    } finally {
      setLoading(false);
    }
  }, [currentPage, estadoFilter, industryFilter, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Industria top a partir de porIndustria
  const topIndustry = stats?.porIndustria
    ? Object.entries(stats.porIndustria).sort((a, b) => b[1] - a[1])[0]
    : undefined;

  const industryOptions = stats?.porIndustria
    ? Object.keys(stats.porIndustria).sort((a, b) => a.localeCompare(b, "es"))
    : [];

  const handleRowClick = (lead: CorporateLead) => {
    setSelectedLead(lead);
    setShowDetail(true);
  };

  const handleLeadUpdated = (updated: CorporateLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updated.id ? updated : lead))
    );
    setSelectedLead(updated);
    // El cambio de estado afecta los contadores
    fetchStats();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">
            Leads B2B de Ventas Corporativas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "—" : stats?.total ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Nuevos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "—" : stats?.nuevos ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "—" : stats?.mes ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              Industria top
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">—</div>
            ) : topIndustry ? (
              <>
                <div className="text-lg font-bold truncate" title={topIndustry[0]}>
                  {topIndustry[0]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topIndustry[1]} lead{topIndustry[1] === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, empresa o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={estadoFilter}
                onValueChange={(value) => {
                  setEstadoFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {ESTADO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={industryFilter}
                onValueChange={(value) => {
                  setIndustryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por industria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las industrias</SelectItem>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Industria</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Cargando leads...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchLeads}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reintentar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No se encontraron leads
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => {
                    const estadoConfig = ESTADO_CONFIG[lead.estado];
                    return (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(lead)}
                      >
                        <TableCell className="py-2">
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span className="whitespace-nowrap">
                              {formatDateShort(lead.createdAt)}
                            </span>
                            <span className="text-[10px]">
                              {formatTime(lead.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="font-medium text-xs">
                            {lead.fullName}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs">{lead.company}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs text-muted-foreground">
                            {lead.industry || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {lead.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              {lead.phone || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge className={estadoConfig.badgeClass}>
                            {estadoConfig.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(currentPage * PAGE_SIZE, total)} de {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer de detalle */}
      <LeadDetailSheet
        lead={selectedLead}
        open={showDetail}
        onOpenChange={setShowDetail}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  );
}
