"use client";

import { useParams } from "next/navigation";
import { BannerFormPage } from "@/components/banners/forms/banner-form-page";

/**
 * Página para editar un banner existente
 * Usa el componente compartido BannerFormPage en modo "edit"
 */
export default function EditarBannerPage() {
  const params = useParams();
  const bannerId = params.id as string;

  return <BannerFormPage mode="edit" bannerId={bannerId} initialPlacement="home" />;
}
