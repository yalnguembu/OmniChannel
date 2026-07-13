import { z } from "zod";
import { BaseModelSchema } from "./base.model";
import type {
  SearchClientResponse,
  SearchClientSegmentResponse,
  SearchClientSegmentMemberResponse,
  ClientSegmentDto,
} from "@/shared/api/generated/types.gen";

// The backend owns the status vocabulary (active / inactive / blocked /
// opted_out / …). We don't validate it against a fixed list — an unknown value
// must pass through, not throw. Case is normalized in the mapper; empty →
// "active" purely for display.
export const ClientStatusSchema = z.string().default("active");

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
  dto: Partial<SearchClientResponse> | null | undefined,
): ClientModel {
  if (!dto) return ClientSchema.parse({});
  return ClientSchema.parse({
    ...dto,
    status: dto.status?.toLowerCase() || "active",
  });
}

export function mapToClientModels(
  dtos: (Partial<SearchClientResponse> | null | undefined)[],
): ClientModel[] {
  return (dtos || []).map(mapToClientModel);
}

// --- Segment Model ---

export const SegmentSchema = BaseModelSchema.extend({
  name: z.string().default("Segment sans nom"),
  description: z.string().optional().nullable().default(""),
  productId: z.string().optional().nullable().default(null),
  productName: z.string().optional().nullable().default(null),
  criteria: z.string().optional().nullable().default(null),
  isDynamic: z.boolean().default(false),
  lastCalculatedAt: z.string().optional().nullable().default(null),
  clientCount: z.number().default(0),
});

export type SegmentModel = z.infer<typeof SegmentSchema>;

/**
 * Maps a segment DTO (search row or detail/by-id payload) to the strict UI
 * model. Both wire shapes are accepted; missing fields fall back to safe
 * defaults via Zod.
 */
export function mapToSegmentModel(
  dto:
    | Partial<SearchClientSegmentResponse>
    | Partial<ClientSegmentDto>
    | null
    | undefined,
): SegmentModel {
  if (!dto) return SegmentSchema.parse({});
  return SegmentSchema.parse(dto);
}

export function mapToSegmentModels(
  dtos: (
    | Partial<SearchClientSegmentResponse>
    | Partial<ClientSegmentDto>
    | null
    | undefined
  )[],
): SegmentModel[] {
  return (dtos || []).map(mapToSegmentModel);
}

// --- Segment member → Client model ---
// A segment-member search row carries the client's identity under prefixed
// fields (clientFirstName, clientEmail…). We project it onto ClientModel so the
// members list can reuse the same client columns/components.

function normalizeStatus(status?: string | null): ClientModel["status"] {
  // Pass the backend value through (lowercased); only fall back when absent.
  return (status ?? "").toLowerCase() || "active";
}

export function mapSegmentMemberToClient(
  dto: Partial<SearchClientSegmentMemberResponse> | null | undefined,
): ClientModel {
  if (!dto) return ClientSchema.parse({});
  return ClientSchema.parse({
    id: dto.clientId || dto.id || "",
    firstName: dto.clientFirstName ?? "",
    lastName: dto.clientLastName ?? "",
    email: dto.clientEmail ?? null,
    phone: "", // not returned by the segment-member search
    status: normalizeStatus(dto.clientStatus),
    createdAt: dto.addedAt ?? dto.createdAt ?? null,
  });
}

export function mapSegmentMembersToClients(
  dtos: (Partial<SearchClientSegmentMemberResponse> | null | undefined)[],
): ClientModel[] {
  return (dtos || []).map(mapSegmentMemberToClient);
}
