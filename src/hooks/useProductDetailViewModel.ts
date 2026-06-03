import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiProductDetailByIdOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToProductModel, type ProductModel } from "@/models/product.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Master ViewModel for the Product Detail page.
 * Orchestrates the core product data and the active tab state.
 */
export function useProductDetailViewModel(productId: string) {
  const { handleRequestError } = useErrorHandling();
  const [activeTab, setActiveTab] = useState("overview");

  // Core Product Data
  const productQuery = useQuery({
    ...getApiProductDetailByIdOptions({
      path: { id: productId },
    }),
    select: (res) => (res?.data ? mapToProductModel(res.data) : undefined),
    enabled: !!productId,
  });

  useEffect(() => {
    if (productQuery.isError && productQuery.error) {
      handleRequestError(productQuery.error);
    }
  }, [productQuery.isError, productQuery.error, handleRequestError]);

  const product = productQuery.data;

  // Simple KPI calculations or derived info
  const statusVariant = useMemo(():
    | "success"
    | "warning"
    | "neutral"
    | "error" => {
    if (!product) return "neutral";
    if (product.status === "active") return "success";
    if (product.status === "paused") return "warning";
    return "neutral";
  }, [product]);

  return {
    product,
    isLoading: productQuery.isLoading,
    activeTab,
    setActiveTab,
    statusVariant,
  };
}
