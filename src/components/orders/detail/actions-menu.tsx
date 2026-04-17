"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AdminOrderDetail } from "@/types/orders";
import {
  MoreHorizontal,
  Copy,
  Send,
  ExternalLink,
  Download,
  Mail,
  Ban,
  Undo2,
  FileX,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ActionsMenuProps {
  detail: AdminOrderDetail;
}

const POSTHOG_BASE_URL =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_URL ||
  "https://us.posthog.com/project/274592";

export function ActionsMenu({ detail }: ActionsMenuProps) {
  const { order, customer, shippingAddress, payment, transactionAttempts, session } = detail;
  const lastPse = transactionAttempts.pse[transactionAttempts.pse.length - 1];
  const lastCard = transactionAttempts.card[transactionAttempts.card.length - 1];
  const refPayco = lastPse?.ref_payco || lastCard?.ref_payco || order.referencia;
  const rawResponse = lastPse?.raw_response ?? lastCard?.raw_response ?? null;
  const bankUrl = lastPse?.urlbanco || null;
  const posthogSessionUrl = session.posthogSessionId
    ? `${POSTHOG_BASE_URL}/replay/${session.posthogSessionId}`
    : null;

  const copy = (label: string, value: string | null | undefined) => async () => {
    if (!value) {
      toast.error(`${label} no disponible`);
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  };

  const downloadJson = () => {
    if (!rawResponse) {
      toast.error("No hay respuesta ePayco para descargar");
      return;
    }
    const blob = new Blob([JSON.stringify(rawResponse, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `epayco-${order.serialId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shippingLine = shippingAddress
    ? [shippingAddress.linea_uno, shippingAddress.complemento, shippingAddress.barrio, shippingAddress.ciudad]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <TooltipProvider delayDuration={150}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Acciones seguras</DropdownMenuLabel>

          <DropdownMenuItem onClick={copy("# orden", String(order.serialId))}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar # orden
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copy("Orden ID", order.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar orden ID
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copy("Ref ePayco", refPayco)}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar ref ePayco
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copy("Email cliente", customer.email)}>
            <Mail className="mr-2 h-4 w-4" />
            Copiar email cliente
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copy("Dirección de envío", shippingLine)} disabled={!shippingLine}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar dirección envío
          </DropdownMenuItem>

          <DropdownMenuItem onClick={downloadJson} disabled={!rawResponse}>
            <Download className="mr-2 h-4 w-4" />
            Descargar JSON ePayco
          </DropdownMenuItem>

          {posthogSessionUrl && (
            <DropdownMenuItem asChild>
              <Link href={posthogSessionUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir sesión en PostHog
              </Link>
            </DropdownMenuItem>
          )}

          {bankUrl && (
            <DropdownMenuItem asChild>
              <Link href={bankUrl} target="_blank" rel="noopener noreferrer">
                <Building2 className="mr-2 h-4 w-4" />
                Abrir URL del banco
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground">
            Próximamente
          </DropdownMenuLabel>

          {payment.method === "PSE" && (
            <DisabledAction icon={Send} label="Reenviar link PSE" />
          )}
          <DisabledAction icon={Undo2} label="Reembolsar" />
          <DisabledAction icon={ShieldCheck} label="Forzar aprobación manual" />
          <DisabledAction icon={FileX} label="Anular guía de envío" />
          <DisabledAction icon={Ban} label="Eliminar orden" />
          <DisabledAction icon={Send} label="Reenviar con monto distinto" />
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

function DisabledAction({
  icon: Icon,
  label,
}: {
  icon: typeof Copy;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full">
          <DropdownMenuItem
            disabled
            onSelect={(e) => e.preventDefault()}
            className="opacity-50 cursor-not-allowed"
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">Pronto estará disponible</TooltipContent>
    </Tooltip>
  );
}
