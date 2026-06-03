import { z } from "zod";

/**
 * Safely parses a value using a Zod schema.
 * If parsing fails, returns the provided default value instead of throwing.
 */
export function safeParseWithDefault<T>(schema: z.ZodSchema<T>, value: unknown, defaultValue: T): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.warn("[Model Parsing Error]:", result.error.format());
    return defaultValue;
  }
  return result.data;
}

/**
 * Common date fields for all models
 */
export const BaseModelSchema = z.object({
  id: z.string().default(""),
  createdAt: z.string().optional().nullable().default(null),
  updatedAt: z.string().optional().nullable().default(null),
  tenantId: z.string().optional().nullable().default(null),
});

export type BaseModel = z.infer<typeof BaseModelSchema>;
