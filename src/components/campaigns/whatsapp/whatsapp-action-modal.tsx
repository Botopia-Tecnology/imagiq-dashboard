"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Send, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WhatsAppActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppActionModal({ isOpen, onClose }: WhatsAppActionModalProps) {
  const router = useRouter();

  const handleCreateTemplate = () => {
    onClose();
    router.push('/marketing/campaigns/templates/whatsapp');
  };

  const handleLaunchCampaign = () => {
    onClose();
    router.push('/marketing/campaigns/crear/whatsapp');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">¿Qué deseas hacer con WhatsApp?</DialogTitle>
          <DialogDescription>
            Selecciona si quieres crear una nueva plantilla o lanzar una campaña con plantillas existentes
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card
            className="p-6 cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all group"
            onClick={handleCreateTemplate}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Gestionar Plantillas
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Administra tus plantillas de WhatsApp: crea nuevas, edita existentes o revisa métricas
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Ver todas las plantillas existentes</li>
                  <li>• Crear nuevas plantillas</li>
                  <li>• Editar o eliminar plantillas</li>
                  <li>• Revisar métricas de rendimiento</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
            onClick={handleLaunchCampaign}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Lanzar Campaña
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Crea y envía una campaña de WhatsApp utilizando plantillas previamente creadas
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Selecciona una plantilla existente</li>
                  <li>• Define tu audiencia objetivo</li>
                  <li>• Programa el envío</li>
                  <li>• Monitorea resultados en tiempo real</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
