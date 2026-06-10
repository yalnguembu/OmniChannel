import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiCampaignSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToCampaignModels } from "@/models/campaign.model";
import type { SearchCampaignResponse } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the Campaigns tab of a specific product.
 */
export function useProductCampaigns(productId: string) {
  const { handleRequestError } = useErrorHandling();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const query = useQuery({
    ...postApiCampaignSearchOptions({
      body: {
        productId,
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
        status: filter !== "all" ? filter : undefined,
      },
    }),
    select: (res) => ({
      items: mapToCampaignModels(
        (res?.data?.items as SearchCampaignResponse[]) || [],
      ),
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!productId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilter = useCallback((val: string) => {
    setFilter(val);
    setPage(1);
  }, []);

  return {
    campaigns: query.data?.items || [],
    totalCount: query.data?.totalCount || 0,
    search,
    filter,
    page,
    pageSize,
    isLoading: query.isLoading,
    handleSearch,
    handleFilter,
    setPage,
  };
}
