import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type {
  ChannelDto,
  SearchChannelResponse,
} from "@/shared/api/generated/types.gen";

/**
 * Source DTO accepted by the channel mappers.
 *
 * NOTE: `ChannelModel` represents a *messaging* channel (sms/email/whatsapp),
 * shared with the templates feature. It is mapped from the channel search
 * (`SearchChannelResponse`, structurally identical to `ChannelDto`) — NOT from
 * the product↔channel link entity (`SearchProductChannelResponse`, consumed
 * raw in `useProductChannels`). Both source shapes are accepted here.
 */
export type ChannelSourceDto = SearchChannelResponse | ChannelDto;

export const ChannelSchema = BaseModelSchema.extend({
  name: z.string().default("Nouveau Canal"),
  type: z.string().default("sms"),
  status: z.string().default("active"),
  config: z.record(z.any()).default({}),
});

export type ChannelModel = z.infer<typeof ChannelSchema>;

export function mapToChannelModel(
  dto: Partial<ChannelSourceDto> | null | undefined,
): ChannelModel {
  if (!dto) return ChannelSchema.parse({});
  return ChannelSchema.parse(dto);
}

export function mapToChannelModels(
  dtos: (Partial<ChannelSourceDto> | null | undefined)[],
): ChannelModel[] {
  return (dtos || []).map(mapToChannelModel);
}
