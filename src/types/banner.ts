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
  coordinates_mobile?: string;
  category_id?: string;
  subcategory_id?: string;
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