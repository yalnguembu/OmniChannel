import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type { ProductDto } from "@/shared/api/generated/types.gen";

export const ProductStatusSchema = z
  .enum(["active", "inactive", "paused", "draft"])
  .default("draft");

export const ProductSchema = BaseModelSchema.extend({
  name: z.string().default("Produit sans nom"),
  description: z.string().optional().nullable().default(""),
  status: ProductStatusSchema,
  companyId: z.string().optional().nullable().default(""),
  clientAttributes: z.string().optional().nullable().default("[]"),
  clientMappingConfiguration: z.string().optional().nullable().default("{}"),
  // Computed helpers for the UI (parsed fields)
  attributes: z.array(z.any()).default([]),
  mapping: z.record(z.any()).default({}),
});

export type ProductModel = z.infer<typeof ProductSchema>;

/**
 * Safely maps a ProductDto (from the API) to our precise ProductModel.
 * Deserializes JSON strings to prevent UI parsing logic.
 */
export function mapToProductModel(
  dto: Partial<ProductDto> | null | undefined,
): ProductModel {
  if (!dto) return ProductSchema.parse({});

  // Safely parse JSON strings from the API
  let parsedAttributes = [];
  let parsedMapping = {};

  try {
    if (dto.clientAttributes) {
      parsedAttributes = JSON.parse(dto.clientAttributes);
    }
  } catch (e) {
    console.warn("Failed to parse product clientAttributes", e);
  }

  try {
    if (dto.clientMappingConfiguration) {
      parsedMapping = JSON.parse(dto.clientMappingConfiguration);
    }
  } catch (e) {
    console.warn("Failed to parse product clientMappingConfiguration", e);
  }

  return ProductSchema.parse({
    ...dto,
    status:
      dto.status?.toLowerCase() === "active"
        ? "active"
        : dto.status?.toLowerCase() || "draft",
    attributes: Array.isArray(parsedAttributes) ? parsedAttributes : [],
    mapping:
      parsedMapping && typeof parsedMapping === "object" ? parsedMapping : {},
  });
}

export function mapToProductModels(
  dtos: (Partial<ProductDto> | null | undefined)[],
): ProductModel[] {
  return (dtos || []).map(mapToProductModel);
}
