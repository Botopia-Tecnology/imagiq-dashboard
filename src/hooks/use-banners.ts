"use client";

import { useState, useEffect, useCallback } from "react";
import { bannerEndpoints } from "@/lib/api";
import { BackendBanner, BannerPaginationData } from "@/types/banner";

interface UseBannersResult {
  banners: BackendBanner[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => Promise<void>;
}

interface UseBannersOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useBanners(options: UseBannersOptions = {}): UseBannersResult {
  const {
    page: initialPage = 1,
    limit = 10,
    autoFetch = true,
  } = options;

  const [banners, setBanners] = useState<BackendBanner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    total: 0,
    limit,
  });

  const fetchBanners = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bannerEndpoints.getAll({ page, limit });

      if (response.success && response.data) {
        const paginationData: BannerPaginationData = response.data;

        setBanners(paginationData.data || []);
        setPagination({
          currentPage: paginationData.meta.page,
          totalPages: paginationData.meta.totalPages,
          total: paginationData.meta.total,
          limit: paginationData.meta.limit,
        });
      } else {
        setError(response.message || "Error al cargar banners");
        setBanners([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
  }, [pagination.totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pagination.totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const refetch = useCallback(async () => {
    await fetchBanners(currentPage);
  }, [currentPage, fetchBanners]);

  // Fetch banners when page changes
  useEffect(() => {
    if (autoFetch) {
      fetchBanners(currentPage);
    }
  }, [currentPage, autoFetch, fetchBanners]);

  return {
    banners,
    isLoading,
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
}
