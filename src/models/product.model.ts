import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type {
  ProductDto,
  SearchProductResponse,
} from "@/shared/api/generated/types.gen";

/**
 * Source DTO accepted by the product mappers.
 * The list endpoint returns `SearchProductResponse`, while the detail endpoint
 * (`GET /api/Product/detail/{id}`) returns `ProductDto`. Both share the fields
 * the mapper reads (name, description, status, …).
 */
export type ProductSourceDto = SearchProductResponse | ProductDto;

export const ProductStatusSchema = z
  .enum(["active", "inactive", "paused", "draft"])
  .default("draft");

export const ProductSchema = BaseModelSchema.extend({
  name: z.string().default("Produit sans nom"),
  description: z.string().optional().nullable().default(""),
  status: ProductStatusSchema,
  companyId: z.string().optional().nullable().default(""),
  settings: z.string().optional().nullable().default(""),
});

export type ProductModel = z.infer<typeof ProductSchema>;

/**
 * Safely maps a ProductDto / SearchProductResponse (from the API) to our
 * precise ProductModel, normalizing the status casing.
 */
export function mapToProductModel(
  dto: Partial<ProductSourceDto> | null | undefined,
): ProductModel {
  if (!dto) return ProductSchema.parse({});

  return ProductSchema.parse({
    ...dto,
    status:
      dto.status?.toLowerCase() === "active"
        ? "active"
        : dto.status?.toLowerCase() || "draft",
  });
}

export function mapToProductModels(
  dtos: (Partial<ProductSourceDto> | null | undefined)[],
): ProductModel[] {
  return (dtos || []).map(mapToProductModel);
}
