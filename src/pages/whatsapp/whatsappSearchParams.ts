import { z } from 'zod';

/**
 * Search params carried by `/wa/$senderId`.
 *
 * Keys are short because they end up in a URL people paste to each other:
 * `c` is the open conversation (so a reload — or a shared link — lands back on
 * it), the rest mirror the sidebar filters.
 */
export const whatsappSearchSchema = z.object({
  /** Open conversation id. */
  c: z.string().optional(),
  /** Status / unread quick filter. */
  f: z.enum(['ALL', 'OPEN', 'PENDING', 'RESOLVED', 'UNREAD']).optional(),
  /** Sidebar search term. */
  q: z.string().optional(),
  /** Assigned agent id. */
  agent: z.string().optional(),
  /** Direction of the last message. */
  dir: z.enum(['INBOUND', 'OUTBOUND']).optional(),
  /** Inclusive `yyyy-mm-dd` bounds on the last message date. */
  from: z.string().optional(),
  to: z.string().optional(),
});

export type WhatsappSearch = z.infer<typeof whatsappSearchSchema>;

/** Never throw on a hand-edited URL — fall back to "no filters". */
export function parseWhatsappSearch(search: Record<string, unknown>): WhatsappSearch {
  const result = whatsappSearchSchema.safeParse(search);
  return result.success ? result.data : {};
}
