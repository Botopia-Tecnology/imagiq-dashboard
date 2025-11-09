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

// Backend Banner Interface (API Response)
export interface BackendBanner {
  id: string;
  name: string;
  placement: string;
  desktop_image_url?: string;
  desktop_video_url?: string;
  mobile_image_url?: string;
  mobile_video_url?: string;
  link_url?: string;
  status: 'draft' | 'active' | 'inactive';
  title?: string;
  description?: string;
  cta?: string;
  color_font?: string;
  coordinates?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Pagination Response
export interface BannerPaginationData {
  data: BackendBanner[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BannerApiResponse {
  data: BannerPaginationData;
  success: boolean;
  message?: string;
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  topPerformingBanner: HeroBanner;
}