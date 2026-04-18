"use client";

import Image from "next/image";
import { useState } from "react";
import { EmailMessage, WhatsappMessage } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { JsonViewer } from "./json-viewer";
import {
  Mail,
  MessageCircle,
  Copy,
  AlertCircle,
  CheckCheck,
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Eye,
  EyeOff,
} from "lucide-react";
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

/**
 * Renders the raw email HTML inside a sandboxed iframe so admins can see
 * exactly what the customer received. Sandbox blocks scripts and
 * same-origin access — the email HTML is treated as untrusted content
 * to avoid any chance of XSS in the dashboard.
 */
function EmailHtmlPreview({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-1 h-8">
          {open ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          <span className="text-xs">
            {open ? "Ocultar" : "Ver"} HTML renderizado
          </span>
          {open ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <iframe
          srcDoc={html}
          sandbox=""
          className="w-full h-96 border-t bg-white"
          title="Email rendered preview"
        />
      </CollapsibleContent>
    </Collapsible>
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
                {e.attachments && e.attachments.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      <span>Adjuntos ({e.attachments.length})</span>
                    </div>
                    <ul className="text-xs space-y-0.5 pl-4">
                      {e.attachments.map((a, i) => (
                        <li key={i} className="font-mono truncate" title={a.filename}>
                          {a.filename}
                          {a.size ? ` · ${(a.size / 1024).toFixed(1)} KB` : ""}
                          {a.contentType ? ` · ${a.contentType}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {e.body_text && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                      Ver texto plano
                    </summary>
                    <pre className="mt-2 p-2 bg-muted/30 rounded border whitespace-pre-wrap break-words font-mono">
                      {e.body_text}
                    </pre>
                  </details>
                )}
                {e.body_html && <EmailHtmlPreview html={e.body_html} />}
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
                {w.header_media_url && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Imagen header</span>
                    <div className="relative h-40 w-40 rounded border overflow-hidden bg-muted">
                      <Image
                        src={w.header_media_url}
                        alt="WhatsApp header"
                        fill
                        sizes="160px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {w.body_text && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Mensaje enviado</span>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-sm whitespace-pre-wrap break-words">
                      {w.body_text}
                    </div>
                  </div>
                )}
                {w.variables && w.variables.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                      Ver variables ({w.variables.length})
                    </summary>
                    <ol className="mt-2 pl-5 list-decimal space-y-0.5 font-mono">
                      {w.variables.map((v, i) => (
                        <li key={i} className="break-all">
                          {v}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                {w.raw_payload != null && (
                  <JsonViewer
                    data={w.raw_payload}
                    title="raw_payload (Meta Graph API)"
                    downloadName={`wa-${w.message_id}.json`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
