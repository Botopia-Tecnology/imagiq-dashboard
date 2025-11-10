import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { BackendBanner } from "@/types/banner";

interface BannerDeleteDialogsProps {
  // Estado para eliminación individual
  bannerToDelete: BackendBanner | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;

  // Estado para eliminación masiva
  bannersToDelete: BackendBanner[];
  onCancelBulkDelete: () => void;
  onConfirmBulkDelete: () => void;

  // Estado de carga
  isDeleting: boolean;
}

/**
 * Componente que contiene los diálogos de confirmación de eliminación
 * - Diálogo individual: para eliminar un solo banner
 * - Diálogo masivo: para eliminar múltiples banners
 */
export function BannerDeleteDialogs({
  bannerToDelete,
  onCancelDelete,
  onConfirmDelete,
  bannersToDelete,
  onCancelBulkDelete,
  onConfirmBulkDelete,
  isDeleting,
}: BannerDeleteDialogsProps) {
  return (
    <>
      {/* Diálogo de eliminación individual */}
      <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && onCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el banner{" "}
              <span className="font-semibold">{bannerToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de eliminación masiva */}
      <AlertDialog
        open={bannersToDelete.length > 0}
        onOpenChange={(open) => !open && onCancelBulkDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente{" "}
              <span className="font-semibold">{bannersToDelete.length} banner(s)</span>{" "}
              seleccionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                `Eliminar ${bannersToDelete.length} banner(s)`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
