import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(5, 'Mot de passe trop court'),
})

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(1, 'Téléphone requis'),
  city: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  // Not constrained to a fixed list — the backend owns the status vocabulary
  // (e.g. opted_out), so an existing contact's status must load without being
  // rejected. The edit form's <select> still offers the common values.
  status: z.string().optional(),
})

export const campaignSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  productId: z.string().min(1, 'Produit requis'),
  type: z.enum(['standard', 'ai', 'trigger', 'recurring']),
  description: z.string().optional(),
})

export const templateSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  content: z.string().min(1, 'Contenu requis'),
  subject: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']),
})

export const webhookSchema = z.object({
  url: z.string().url('URL invalide'),
  description: z.string().optional(),
  events: z.array(z.string()).min(1, 'Au moins un événement requis'),
  timeoutSeconds: z.number().min(1).max(120).optional(),
  maxRetries: z.number().min(0).max(10).optional(),
})

export const apiKeySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  scopes: z.array(z.string()).min(1, 'Au moins un scope requis'),
  expiresAt: z.string().optional(),
})

export const tagSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  color: z.string().optional(),
})

export const blocklistSchema = z.object({
  blockType: z.enum(['phone', 'email']),
  value: z.string().min(1, 'Valeur requise'),
  reason: z.string().optional(),
})

export const connectorSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  providerId: z.string().min(1, 'Provider requis'),
  priority: z.number().optional(),
  isDefault: z.boolean().optional(),
})
