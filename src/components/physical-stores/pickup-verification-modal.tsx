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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhysicalStore, PickupOrder, PickupVerificationResult } from "@/types/physical-stores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  Key,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const verificationFormSchema = z.object({
  orderNumber: z.string().min(1, "Número de orden requerido"),
  verificationCode: z.string().min(6, "Código debe tener al menos 6 caracteres"),
  customerPresent: z.boolean(),
  idVerified: z.boolean(),
  notes: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

interface PickupVerificationModalProps {
  open: boolean;
  onClose: () => void;
  store: PhysicalStore;
  onVerify: (data: VerificationFormValues) => Promise<PickupVerificationResult>;
}

export function PickupVerificationModal({
  open,
  onClose,
  store,
  onVerify,
}: PickupVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PickupVerificationResult | null>(null);
  const [foundOrder, setFoundOrder] = useState<PickupOrder | null>(null);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      orderNumber: "",
      verificationCode: "",
      customerPresent: false,
      idVerified: false,
      notes: "",
    },
  });

  const onSubmit = async (values: VerificationFormValues) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await onVerify(values);
      setVerificationResult(result);

      if (result.success) {
        setFoundOrder(result.order || null);
        toast.success("Verificación exitosa");
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error durante la verificación");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setVerificationResult(null);
    setFoundOrder(null);
    onClose();
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      in_store: "Recogida en tienda",
      curbside: "Recogida en bordillo",
      locker: "Recogida en locker",
      drive_thru: "Recogida en auto"
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Verificación de Recogida - {store.location.name}
          </DialogTitle>
          <DialogDescription>
            Verificar código de recogida y completar la entrega del pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Información de la Tienda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Código:</span> {store.code}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {store.contact.phone}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Dirección:</span> {store.location.address}, {store.location.city}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Orden</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="ORD-2024-001"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Ingrese el número de orden del cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Verificación</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="ABC123"
                            className="pl-9 font-mono"
                            {...field}
                            style={{ textTransform: 'uppercase' }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Código de 6 caracteres del cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verificaciones de Seguridad
                </h4>

                <FormField
                  control={form.control}
                  name="customerPresent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Cliente presente
                        </FormLabel>
                        <FormDescription>
                          Confirmar que el cliente está presente para recoger el pedido
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Identidad verificada
                        </FormLabel>
                        <FormDescription>
                          Se ha verificado la identidad del cliente
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones sobre la entrega..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <Card className={verificationResult.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {verificationResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${verificationResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {verificationResult.message}
                      </span>
                    </div>

                    {verificationResult.success && foundOrder && (
                      <div className="space-y-3 pt-3 border-t">
                        <h4 className="font-medium">Detalles del Pedido</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Cliente:</span>
                            <div>{foundOrder.customerName}</div>
                            <div className="text-muted-foreground">{foundOrder.customerEmail}</div>
                          </div>
                          <div>
                            <span className="font-medium">Método:</span>
                            <div>{getMethodLabel(foundOrder.pickupMethod)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Total:</span>
                            <div className="font-mono">€{foundOrder.totalAmount.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Productos:</span>
                            <div>{foundOrder.products.length} artículo(s)</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="min-w-[120px]"
                >
                  {isVerifying ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verificar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}