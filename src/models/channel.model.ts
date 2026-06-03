import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type { ChannelDto } from "@/shared/api/generated/types.gen";

export const ChannelSchema = BaseModelSchema.extend({
  name: z.string().default("Nouveau Canal"),
  type: z.string().default("sms"),
  status: z.string().default("active"),
  config: z.record(z.any()).default({}),
});

export type ChannelModel = z.infer<typeof ChannelSchema>;

export function mapToChannelModel(
  dto: Partial<ChannelDto> | null | undefined,
): ChannelModel {
  if (!dto) return ChannelSchema.parse({});
  return ChannelSchema.parse(dto);
}

export function mapToChannelModels(
  dtos: (Partial<ChannelDto> | null | undefined)[],
): ChannelModel[] {
  return (dtos || []).map(mapToChannelModel);
}
