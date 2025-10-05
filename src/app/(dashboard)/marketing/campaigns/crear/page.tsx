"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, MessageSquare, Mail, Smartphone, Globe, Monitor, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandIcon } from "@/components/icons/BrandIcon";

export default function CrearCampañaPage() {
  const router = useRouter();

  const handleCreateCampaign = (type: string) => {
    if (type === 'event-driven') {
      router.push('/marketing/campaigns/event-driven');
    } else {
      router.push(`/marketing/campaigns/crear/${type}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campañas
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Campaña</h1>
            <p className="text-muted-foreground">
              Selecciona el tipo de campaña que mejor se adapte a tus objetivos
            </p>
          </div>
        </div>
      </div>

      {/* All Campaign Types */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Tipos de Campañas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona el tipo de campaña que mejor se adapte a tus objetivos de marketing
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Button
              variant="outline"
              className="h-32 flex-col gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
              onClick={() => handleCreateCampaign('event-driven')}
            >
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="text-center">
                <div className="font-medium">Event-Driven</div>
                <div className="text-xs text-muted-foreground">Automatización inteligente</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-32 flex-col gap-3 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all"
              onClick={() => handleCreateCampaign('whatsapp')}
            >
              <BrandIcon brand="WhatsApp" size={32} className="text-green-600 dark:text-green-400" />
              <div className="text-center">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Mensajes directos personalizados</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-32 flex-col gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
              onClick={() => handleCreateCampaign('email')}
            >
              <BrandIcon brand="Gmail" size={32} className="text-blue-600 dark:text-blue-400" />
              <div className="text-center">
                <div className="font-medium">Email</div>
                <div className="text-xs text-muted-foreground">Newsletters y promociones</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-32 flex-col gap-3 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all"
              onClick={() => handleCreateCampaign('sms')}
            >
              <Smartphone className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="text-center">
                <div className="font-medium">SMS</div>
                <div className="text-xs text-muted-foreground">Mensajes de texto cortos</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-32 flex-col gap-3 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
              onClick={() => handleCreateCampaign('inweb')}
            >
              <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="text-center">
                <div className="font-medium">In-Web</div>
                <div className="text-xs text-muted-foreground">Notificaciones en sitio web</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="opacity-75">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            Próximamente
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Nuevos canales de comunicación en desarrollo
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              disabled
              className="h-32 flex-col gap-3 opacity-50 cursor-not-allowed"
            >
              <div className="relative">
                <Monitor className="h-8 w-8 text-gray-400" />
                <Ban className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-400">In-App</div>
                <div className="text-xs text-muted-foreground">Notificaciones móviles</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="h-32 flex-col gap-3 opacity-50 cursor-not-allowed"
            >
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-gray-400" />
                <Ban className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-400">Telegram</div>
                <div className="text-xs text-muted-foreground">Bot de Telegram</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="h-32 flex-col gap-3 opacity-50 cursor-not-allowed"
            >
              <div className="relative">
                <Mail className="h-8 w-8 text-gray-400" />
                <Ban className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-400">Push</div>
                <div className="text-xs text-muted-foreground">Notificaciones push</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="h-32 flex-col gap-3 opacity-50 cursor-not-allowed"
            >
              <div className="relative">
                <Globe className="h-8 w-8 text-gray-400" />
                <Ban className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-400">Social Media</div>
                <div className="text-xs text-muted-foreground">Facebook, Instagram</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}