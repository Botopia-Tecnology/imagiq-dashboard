"use client";

import { EmailMessage, WhatsappMessage } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Copy, AlertCircle, CheckCheck, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  whatsapp: WhatsappMessage[];
  emails: EmailMessage[];
}

function prettyTemplate(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function whatsappDeliveryBadge(w: WhatsappMessage) {
  if (w.failed_at) {
    return (
      <Badge variant="destructive" className="text-xs gap-1">
        <AlertCircle className="h-3 w-3" />
        Fallido
      </Badge>
    );
  }
  if (w.read_at) {
    return (
      <Badge variant="default" className="text-xs gap-1">
        <CheckCheck className="h-3 w-3" />
        Leído
      </Badge>
    );
  }
  if (w.delivered_at) {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <Check className="h-3 w-3" />
        Entregado
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <Clock className="h-3 w-3" />
      Enviado
    </Badge>
  );
}

function emailStatusBadge(e: EmailMessage) {
  if (e.status === "failed") {
    return (
      <Badge variant="destructive" className="text-xs gap-1">
        <AlertCircle className="h-3 w-3" />
        Fallido
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <Check className="h-3 w-3" />
      Enviado
    </Badge>
  );
}

export function CommunicationsTimeline({ whatsapp, emails }: Props) {
  const total = whatsapp.length + emails.length;

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No se han enviado comunicaciones para esta orden.
      </p>
    );
  }

  const copy = (label: string, value: string) => () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  };

  return (
    <div className="space-y-4">
      {emails.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="font-medium uppercase tracking-wide">
              Correos ({emails.length})
            </span>
          </div>
          <div className="space-y-2">
            {emails.map((e) => (
              <div key={e.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {prettyTemplate(e.template_name)}
                      </span>
                      {emailStatusBadge(e)}
                    </div>
                    {e.subject && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {e.subject}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {format(new Date(e.sent_at), "dd MMM yyyy, HH:mm:ss", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-muted-foreground shrink-0">Para:</span>
                    <span className="truncate">{e.recipient_email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={copy("Email", e.recipient_email)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {e.cc && (
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-muted-foreground shrink-0">CC:</span>
                      <span className="truncate" title={e.cc}>
                        {e.cc}
                      </span>
                    </div>
                  )}
                  {e.message_id && (
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-muted-foreground shrink-0">SES ID:</span>
                      <span className="truncate font-mono" title={e.message_id}>
                        {e.message_id}
                      </span>
                    </div>
                  )}
                </div>
                {e.error_message && (
                  <p className="text-xs text-destructive">{e.error_message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {whatsapp.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span className="font-medium uppercase tracking-wide">
              WhatsApp ({whatsapp.length})
            </span>
          </div>
          <div className="space-y-2">
            {whatsapp.map((w) => (
              <div key={w.message_id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {prettyTemplate(w.template_name)}
                      </span>
                      {whatsappDeliveryBadge(w)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      A: {w.recipient_phone}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {format(new Date(w.sent_at), "dd MMM yyyy, HH:mm:ss", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {w.delivered_at && (
                    <div>
                      <span className="text-muted-foreground">Entregado: </span>
                      {format(new Date(w.delivered_at), "HH:mm:ss", {
                        locale: es,
                      })}
                    </div>
                  )}
                  {w.read_at && (
                    <div>
                      <span className="text-muted-foreground">Leído: </span>
                      {format(new Date(w.read_at), "HH:mm:ss", { locale: es })}
                    </div>
                  )}
                  {w.error_code != null && (
                    <div className="col-span-2 sm:col-span-4 text-destructive">
                      Error {w.error_code}: {w.error_title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
