"use client";

import { useSearchParams } from "next/navigation";
import { BannerFormPage } from "@/components/banners/forms/banner-form-page";

/**
 * Página para crear un nuevo banner
 * Usa el componente compartido BannerFormPage en modo "create"
 */
export default function CrearBannerPage() {
  const searchParams = useSearchParams();
  const placementFromUrl = searchParams.get("type") || "home";

  return <BannerFormPage mode="create" initialPlacement={placementFromUrl} />;
}
