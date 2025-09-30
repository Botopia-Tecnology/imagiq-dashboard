export interface HeroBanner {
  id: string;
  name: string;
  type: 'image' | 'video' | 'component';
  status: 'active' | 'inactive' | 'draft' | 'scheduled';
  order: number;
  startDate: Date;
  endDate?: Date;

  // Para banners de imagen/video
  mediaUrl?: string;

  // Para banners de componente personalizado
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  offerText?: string;
  buttonText?: string;
  gifSrc?: string;
  bgColor?: string;

  // Métricas
  impressions: number;
  clicks: number;
  ctr: number;

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  topPerformingBanner: HeroBanner;
}