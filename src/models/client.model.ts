import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type {
  ClientDto,
  ClientSegmentDto,
} from "@/shared/api/generated/types.gen";

export const ClientStatusSchema = z
  .enum(["active", "inactive", "blocked"])
  .default("active");

export const ClientSchema = BaseModelSchema.extend({
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  email: z.string().nullable().optional(),
  phone: z.string().default(""),
  city: z.string().optional().nullable().default(""),
  country: z.string().optional().nullable().default(""),
  gender: z.string().optional().nullable().default(""),
  status: ClientStatusSchema,
  externalId: z.string().optional().nullable().default(null),
  metadata: z.record(z.any()).default({}),
});

export type ClientModel = z.infer<typeof ClientSchema>;

export function mapToClientModel(
  dto: Partial<ClientDto> | null | undefined,
): ClientModel {
  if (!dto) return ClientSchema.parse({});
  return ClientSchema.parse({
    ...dto,
    status: dto.status?.toLowerCase() || "active",
  });
}

export function mapToClientModels(
  dtos: (Partial<ClientDto> | null | undefined)[],
): ClientModel[] {
  return (dtos || []).map(mapToClientModel);
}

// --- Segment Model ---

export const SegmentSchema = BaseModelSchema.extend({
  name: z.string().default("Segment sans nom"),
  description: z.string().optional().nullable().default(""),
  clientCount: z.number().default(0),
});

export type SegmentModel = z.infer<typeof SegmentSchema>;

export function mapToSegmentModel(
  dto: Partial<ClientSegmentDto> | null | undefined,
): SegmentModel {
  if (!dto) return SegmentSchema.parse({});
  return SegmentSchema.parse(dto);
}

export function mapToSegmentModels(
  dtos: (Partial<ClientSegmentDto> | null | undefined)[],
): SegmentModel[] {
  return (dtos || []).map(mapToSegmentModel);
}
