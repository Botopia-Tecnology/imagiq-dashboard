"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Building2,
  Calendar,
  ExternalLink,
  Factory,
  Loader2,
  Mail,
  Paperclip,
  Phone,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  CorporateLead,
  CorporateLeadEstado,
  corporateLeadsEndpoints,
  ESTADO_CONFIG,
  ESTADO_OPTIONS,
  getSolutionLabel,
} from "@/features/corporate-leads/api";

interface LeadDetailSheetProps {
  lead: CorporateLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: (lead: CorporateLead) => void;
}

const formatFullDate = (dateString: string) =>
  new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  onLeadUpdated,
}: LeadDetailSheetProps) {
  const [estado, setEstado] = useState<CorporateLeadEstado>("nuevo");
  const [notas, setNotas] = useState("");
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingNotas, setSavingNotas] = useState(false);

  useEffect(() => {
    if (lead) {
      setEstado(lead.estado);
      setNotas(lead.notas ?? "");
    }
  }, [lead?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lead) return null;

  const handleEstadoChange = async (value: string) => {
    const nuevoEstado = value as CorporateLeadEstado;
    const estadoAnterior = estado;
    setEstado(nuevoEstado);
    setSavingEstado(true);
    try {
      const response = await corporateLeadsEndpoints.update(lead.id, {
        estado: nuevoEstado,
      });
      if (response.success && response.data?.data) {
        onLeadUpdated(response.data.data);
        toast.success(
          `Estado actualizado a "${ESTADO_CONFIG[nuevoEstado].label}"`
        );
      } else {
        setEstado(estadoAnterior);
        toast.error(response.message || "No se pudo actualizar el estado");
      }
    } catch {
      setEstado(estadoAnterior);
      toast.error("Error de conexión al actualizar el estado");
    } finally {
      setSavingEstado(false);
    }
  };

  const handleSaveNotas = async () => {
    setSavingNotas(true);
    try {
      const response = await corporateLeadsEndpoints.update(lead.id, {
        notas,
      });
      if (response.success && response.data?.data) {
        onLeadUpdated(response.data.data);
        toast.success("Notas guardadas");
      } else {
        toast.error(response.message || "No se pudieron guardar las notas");
      }
    } catch {
      toast.error("Error de conexión al guardar las notas");
    } finally {
      setSavingNotas(false);
    }
  };

  const estadoConfig = ESTADO_CONFIG[lead.estado];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            {lead.company}
          </SheetTitle>
          <SheetDescription>
            Lead corporativo de {lead.fullName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Estado y fecha */}
          <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
            <Badge className={estadoConfig.badgeClass}>
              {estadoConfig.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatFullDate(lead.createdAt)}
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Contacto
            </p>
            <p className="text-sm font-medium">{lead.fullName}</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`mailto:${lead.email}`}
                className="text-sm text-primary hover:underline break-all"
              >
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{lead.phone || "N/A"}</span>
            </div>
          </div>

          {/* Industria */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Industria
            </p>
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{lead.industry || "Sin especificar"}</span>
            </div>
          </div>

          {/* Soluciones de interés */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Soluciones de interés
            </p>
            {lead.solutionInterest.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {lead.solutionInterest.map((solution) => (
                  <Badge key={solution} variant="secondary">
                    {getSolutionLabel(solution)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin especificar</p>
            )}
          </div>

          {/* Mensaje */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Mensaje
            </p>
            {lead.message ? (
              <p className="text-sm whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">
                {lead.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin mensaje</p>
            )}
          </div>

          {/* Origen */}
          {lead.sourceUrl && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Página de origen
              </p>
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline break-all"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {lead.sourceUrl}
              </a>
            </div>
          )}

          {/* Archivos adjuntos */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Archivos adjuntos
            </p>
            {lead.attachmentNames.length > 0 ? (
              <ul className="space-y-1">
                {lead.attachmentNames.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="break-all">{name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin adjuntos</p>
            )}
            {lead.attachmentNames.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Los archivos fueron enviados en el correo de notificación.
              </p>
            )}
          </div>

          {/* Cambiar estado */}
          <div className="space-y-2 pt-4 border-t">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Estado del lead
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={estado}
                onValueChange={handleEstadoChange}
                disabled={savingEstado}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {savingEstado && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Notas internas
            </p>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe notas de seguimiento..."
              rows={4}
            />
            <Button
              onClick={handleSaveNotas}
              disabled={savingNotas || notas === (lead.notas ?? "")}
              size="sm"
            >
              {savingNotas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar notas
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
