"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, UserRole, Permission } from "@/types/users";
import { rolePermissions } from "@/lib/mock-data/users";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Key,
  Save,
  X
} from "lucide-react";

const userFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["super_admin", "admin", "manager", "editor", "viewer"]),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  twoFactorEnabled: z.boolean(),
  customPermissions: z.array(z.string()).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  onSave: (user: UserFormValues) => void;
}

export function UserFormModal({ open, onClose, user, onSave }: UserFormModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'viewer');
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(
    user?.permissions || rolePermissions[selectedRole]
  );

  const isEditing = !!user;
  const title = isEditing ? "Editar Usuario" : "Crear Nuevo Usuario";
  const description = isEditing
    ? "Modifica la información y permisos del usuario."
    : "Completa la información para crear un nuevo usuario.";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "viewer",
      status: user?.status || "pending",
      department: user?.department || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      timezone: user?.timezone || "Europe/Madrid",
      twoFactorEnabled: user?.twoFactorEnabled || false,
      customPermissions: user?.permissions || [],
    },
  });

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const rolePerms = rolePermissions[newRole];
    setCustomPermissions(rolePerms);
    form.setValue('role', newRole);
    form.setValue('customPermissions', rolePerms);
  };

  const handlePermissionToggle = (permission: Permission) => {
    const newPermissions = customPermissions.includes(permission)
      ? customPermissions.filter(p => p !== permission)
      : [...customPermissions, permission];

    setCustomPermissions(newPermissions);
    form.setValue('customPermissions', newPermissions);
  };

  const onSubmit = (values: UserFormValues) => {
    onSave({
      ...values,
      customPermissions: customPermissions,
    });
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      editor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      viewer: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300'
    };
    return colors[role];
  };

  const permissionCategories = {
    "Usuarios": ["users.create", "users.read", "users.update", "users.delete"],
    "Campañas": ["campaigns.create", "campaigns.read", "campaigns.update", "campaigns.delete"],
    "Productos": ["products.create", "products.read", "products.update", "products.delete"],
    "Órdenes": ["orders.read", "orders.update"],
    "Clientes": ["customers.read", "customers.update"],
    "Sistema": ["analytics.read", "settings.read", "settings.update"],
  };

  const permissionLabels: Record<Permission, string> = {
    "users.create": "Crear usuarios",
    "users.read": "Ver usuarios",
    "users.update": "Editar usuarios",
    "users.delete": "Eliminar usuarios",
    "campaigns.create": "Crear campañas",
    "campaigns.read": "Ver campañas",
    "campaigns.update": "Editar campañas",
    "campaigns.delete": "Eliminar campañas",
    "products.create": "Crear productos",
    "products.read": "Ver productos",
    "products.update": "Editar productos",
    "products.delete": "Eliminar productos",
    "orders.read": "Ver órdenes",
    "orders.update": "Editar órdenes",
    "customers.read": "Ver clientes",
    "customers.update": "Editar clientes",
    "analytics.read": "Ver analytics",
    "settings.read": "Ver configuración",
    "settings.update": "Editar configuración",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {form.watch("name") ? getInitials(form.watch("name")) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className={getRoleColor(selectedRole)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {selectedRole === 'super_admin' ? 'Super Admin' :
                       selectedRole === 'admin' ? 'Administrador' :
                       selectedRole === 'manager' ? 'Manager' :
                       selectedRole === 'editor' ? 'Editor' : 'Visualizador'}
                    </Badge>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Nombre del usuario" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="usuario@ejemplo.com"
                              className="pl-9"
                              {...field}
                              disabled={isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select
                            onValueChange={(value: UserRole) => {
                              handleRoleChange(value);
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="suspended">Suspendido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej: Marketing, Ventas..." className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+34 600 123 456" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Madrid, España" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Autenticación de dos factores (2FA)
                          </FormLabel>
                          <FormDescription>
                            Habilitar 2FA para mayor seguridad
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column - Permissions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Permisos del Usuario
                    </h3>

                    <div className="space-y-4">
                      {Object.entries(permissionCategories).map(([category, perms]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {perms.map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission}
                                  checked={customPermissions.includes(permission as Permission)}
                                  onCheckedChange={() => handlePermissionToggle(permission as Permission)}
                                />
                                <label
                                  htmlFor={permission}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permissionLabels[permission as Permission]}
                                </label>
                              </div>
                            ))}
                          </div>
                          {category !== "Sistema" && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Total de permisos:</strong> {customPermissions.length} seleccionados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}