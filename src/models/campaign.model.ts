import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type { CampaignDto } from "@/shared/api/generated/types.gen";

export const CampaignStatusSchema = z
  .enum(["active", "draft", "paused", "completed", "scheduled"])
  .default("draft");
export const CampaignTypeSchema = z
  .enum(["standard", "ai", "trigger", "recurring"])
  .default("standard");

// Zod schema for the nested content of a campaign
export const CampaignContentSchema = z
  .object({
    title: z.string().optional().default(""),
    body: z.string().optional().default(""),
    templateId: z.string().optional().nullable().default(null),
    variables: z.record(z.any()).default({}),
  })
  .default({});

export const CampaignSchema = BaseModelSchema.extend({
  name: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().optional().nullable().default(""),
  status: CampaignStatusSchema,
  type: CampaignTypeSchema,
  productId: z.string().min(1, "L'espace produit est obligatoire"),
  clientId: z.string().optional().nullable().default(null),
  scheduledAt: z.string().optional().nullable().default(null),
  content: CampaignContentSchema,
  // Delivery stats
  totalRecipients: z.number().default(0),
  successfulSends: z.number().default(0),
  failedSends: z.number().default(0),
});

export type CampaignModel = z.infer<typeof CampaignSchema>;

/**
 * Safely maps a CampaignDto (from API) to our precise CampaignModel.
 */
export function mapToCampaignModel(
  dto: Partial<CampaignDto> | null | undefined,
): CampaignModel {
  if (!dto)
    return CampaignSchema.parse({
      name: "Nouvelle Campagne",
      productId: "",
      status: "draft",
      type: "standard",
      content: {}, // Campaign content is managed via steps/templates, not a direct payload on Dto
    });

  return CampaignSchema.parse({
    ...dto,
    status: dto.status?.toLowerCase() || "draft",
    type: dto.type?.toLowerCase() || "standard",
    content: {}, // Campaign content is managed via steps/templates, not a direct payload on Dto
  });
}

export function mapToCampaignModels(
  dtos: (Partial<CampaignDto> | null | undefined)[],
): CampaignModel[] {
  return (dtos || []).map(mapToCampaignModel);
}
