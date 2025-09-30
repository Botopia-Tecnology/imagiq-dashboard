"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Campaign } from "@/types";
import { mockCampaigns } from "@/lib/mock-data";
import { MoreHorizontal, Mail, MessageSquare, Smartphone, Monitor } from "lucide-react";

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <Smartphone className="h-4 w-4" />;
    case 'whatsapp':
      return <MessageSquare className="h-4 w-4" />;
    case 'in-web':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    case 'whatsapp':
      return 'WhatsApp';
    case 'in-web':
      return 'In-Web';
    default:
      return type;
  }
};

const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="flex items-center gap-2">
          {getTypeIcon(campaign.type)}
          <span className="font-medium">{campaign.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="outline">
          {getTypeLabel(type)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "completed"
              ? "secondary"
              : status === "paused"
              ? "outline"
              : "destructive"
          }
        >
          {status === "active" ? "Activa" :
           status === "completed" ? "Completada" :
           status === "paused" ? "Pausada" : "Borrador"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "reach",
    header: "Alcance",
    cell: ({ row }) => {
      const reach = row.getValue("reach") as number;
      return reach > 0 ? reach.toLocaleString() : "-";
    },
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
    cell: ({ row }) => {
      const clicks = row.getValue("clicks") as number;
      return clicks > 0 ? clicks.toLocaleString() : "-";
    },
  },
  {
    accessorKey: "conversions",
    header: "Conversiones",
    cell: ({ row }) => {
      const conversions = row.getValue("conversions") as number;
      return conversions > 0 ? conversions.toLocaleString() : "-";
    },
  },
  {
    id: "ctr",
    header: "CTR",
    cell: ({ row }) => {
      const campaign = row.original;
      const ctr = campaign.reach > 0 ? (campaign.clicks / campaign.reach * 100) : 0;
      return ctr > 0 ? `${ctr.toFixed(1)}%` : "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const campaign = row.original;

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
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar campaña</DropdownMenuItem>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {campaign.status === 'active' ? 'Pausar' : 'Activar'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const campaignTypes = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "In-Web", value: "in-web" },
];

const campaignStatuses = [
  { label: "Activa", value: "active" },
  { label: "Completada", value: "completed" },
  { label: "Pausada", value: "paused" },
  { label: "Borrador", value: "draft" },
];

export function CampaignsTable() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Campañas</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <DataTable
          columns={campaignColumns}
          data={mockCampaigns}
          searchKey="name"
          filters={[
            {
              id: "type",
              title: "Tipo",
              options: campaignTypes,
            },
            {
              id: "status",
              title: "Estado",
              options: campaignStatuses,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}