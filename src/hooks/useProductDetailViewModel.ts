import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiProductDetailByIdOptions,
  getApiProductDetailByIdQueryKey,
  putApiProductMutation,
  postApiProductSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { UpdateProductRequest } from "@/shared/api/generated/types.gen";
import { mapToProductModel } from "@/models/product.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/** Editable fields surfaced by the inline product edit modal. */
export interface ProductEditData {
  name: string;
  description: string;
  status: string;
}

/**
 * Master ViewModel for the Product Detail page.
 * Orchestrates the core product data, the active tab, and inline edit / status
 * actions (PUT /api/Product) calibrated on the real contract.
 */
export function useProductDetailViewModel(productId: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  // ── Edit / status mutation (PUT /api/Product) ───────────────────────────────
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getApiProductDetailByIdQueryKey({ path: { id: productId } }),
    });
    queryClient.invalidateQueries({ queryKey: postApiProductSearchQueryKey() });
  }, [queryClient, productId]);

  const updateMutation = useMutation({
    ...putApiProductMutation(),
    onSuccess: () => {
      invalidate();
      setIsEditOpen(false);
      toast.success("Produit mis à jour");
    },
    onError: createMutationErrorHandler(),
  });

  /** Build a full UpdateProductRequest from the loaded product + a patch. */
  const buildUpdateBody = useCallback(
    (patch: Partial<ProductEditData>): UpdateProductRequest => ({
      id: productId,
      name: patch.name ?? product?.name,
      description: patch.description ?? product?.description,
      status: patch.status ?? product?.status,
      // Preserve the opaque settings blob (sub-resources own attributes/mapping).
      settings: product?.settings || undefined,
    }),
    [productId, product],
  );

  const handleUpdate = useCallback(
    (data: ProductEditData) => {
      updateMutation.mutate({ body: buildUpdateBody(data) });
    },
    [updateMutation, buildUpdateBody],
  );

  /** Quick status flip from the settings tab (pause ↔ activate). */
  const handleChangeStatus = useCallback(
    (status: string) => {
      updateMutation.mutate({ body: buildUpdateBody({ status }) });
    },
    [updateMutation, buildUpdateBody],
  );

  return {
    product,
    isLoading: productQuery.isLoading,
    activeTab,
    setActiveTab,
    statusVariant,

    // edit / status
    isEditOpen,
    openEdit: useCallback(() => setIsEditOpen(true), []),
    closeEdit: useCallback(() => setIsEditOpen(false), []),
    handleUpdate,
    handleChangeStatus,
    isUpdatePending: updateMutation.isPending,
  };
}
