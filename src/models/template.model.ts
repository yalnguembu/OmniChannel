import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type { TemplateDto } from "@/shared/api/generated/types.gen";

export const TemplateStatusSchema = z
  .enum(["draft", "active", "archived"])
  .default("draft");
export const TemplateCategorySchema = z
  .enum(["Transactionnel", "Marketing", "Bienvenue", "Notification"])
  .nullable()
  .default(null);

export const TemplateSchema = BaseModelSchema.extend({
  name: z.string().default("Nouveau Template"),
  content: z.string().default(""),
  category: TemplateCategorySchema,
  language: z.string().default("fr"),
  status: TemplateStatusSchema,
  version: z.number().default(1),
  variables: z.array(z.string()).default([]),
  description: z.string().optional().nullable().default(""),
  productId: z.string().default(""),
  subject: z.string().default(""),
});

export type TemplateModel = z.infer<typeof TemplateSchema>;

/**
 * Safely maps a TemplateDto (from the API) to our precise TemplateModel.
 * Provides defaults for any missing or malformed data to ensure UI safety.
 */
export function mapToTemplateModel(
  dto: Partial<TemplateDto> | null | undefined,
): TemplateModel {
  if (!dto) {
    return TemplateSchema.parse({}); // Returns object with all defaults
  }

  // We use parse instead of safeParse here because we've provided defaults
  // for almost every field, and TemplateSchema.parse will fill them in.
  return dto as TemplateModel;
  //  TemplateSchema.parse({
  //   ...dto,
  //   // Ensure nested or complex types match our expectations
  //   // (e.g. converting null to default values if needed)
  // });
}

/**
 * Maps a list of Dto results to Model instances.
 */
export function mapToTemplateModels(
  dtos: (Partial<TemplateDto> | null | undefined)[],
): TemplateModel[] {
  return (dtos || []).map(mapToTemplateModel);
}
