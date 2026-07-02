import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type {
  CampaignDto,
  SearchCampaignResponse,
} from "@/shared/api/generated/types.gen";

// Backend statuses: Draft / Scheduled / Running / Completed / Failed / WaitingToken
// (+ legacy active/paused). Normalized to lowercase.
export const CampaignStatusSchema = z
  .enum([
    "active",
    "draft",
    "paused",
    "completed",
    "scheduled",
    "running",
    "failed",
    "waitingtoken",
  ])
  .default("draft");
// New contract: campaigns are OneTime or Recurring (cron-driven).
export const CampaignTypeSchema = z
  .enum(["onetime", "recurring"])
  .default("onetime");

export const CampaignSchema = BaseModelSchema.extend({
  name: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().optional().nullable().default(""),
  status: CampaignStatusSchema,
  type: CampaignTypeSchema,
  productId: z.string().min(1, "L'espace produit est obligatoire"),
  productName: z.string().optional().nullable().default(null),
  scheduledAt: z.string().optional().nullable().default(null),
  startedAt: z.string().optional().nullable().default(null),
  completedAt: z.string().optional().nullable().default(null),
  // Cron scheduling model.
  isRecurring: z.boolean().default(false),
  cronExpression: z.string().optional().nullable().default(null),
  nextRunAt: z.string().optional().nullable().default(null),
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
  dto:
    | Partial<CampaignDto>
    | Partial<SearchCampaignResponse>
    | null
    | undefined,
): CampaignModel {
  if (!dto)
    return CampaignSchema.parse({
      name: "Nouvelle Campagne",
      productId: "",
      status: "draft",
      type: "onetime",
    });

  return CampaignSchema.parse({
    ...dto,
    status: dto.status?.toLowerCase() || "draft",
    type: dto.type?.toLowerCase() || "onetime",
  });
}

export function mapToCampaignModels(
  dtos: (Partial<SearchCampaignResponse> | null | undefined)[],
): CampaignModel[] {
  return (dtos || []).map(mapToCampaignModel);
}
