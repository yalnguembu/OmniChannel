import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ConversationStatusSchema = z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const MessageDirectionSchema = z.enum(['INBOUND', 'OUTBOUND']);
export type MessageDirection = z.infer<typeof MessageDirectionSchema>;

export const MessageStatusSchema = z.enum([
  'QUEUED', 'PENDING', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED',
]);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const MessageTypeSchema = z.enum([
  'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'CONTACT', 'TEMPLATE', 'FLOW',
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const FilterSchema = z.enum(['ALL', 'OPEN', 'PENDING', 'RESOLVED', 'UNREAD']);
export type Filter = z.infer<typeof FilterSchema>;

// ─── Media ────────────────────────────────────────────────────────────────────

export const MediaSchema = z.object({
  id: z.string(),
  mediaType: z.string().optional(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
  caption: z.string().optional(),
  internalStorageUrl: z.string().optional(),
});
export type Media = z.infer<typeof MediaSchema>;

// ─── Message ─────────────────────────────────────────────────────────────────

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string().optional(),
  externalMessageId: z.string().optional(),
  direction: MessageDirectionSchema.optional(),
  messageType: MessageTypeSchema.optional(),
  status: MessageStatusSchema.optional(),
  content: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  sentAt: z.string().optional().nullable(),
  receivedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  deliveredAt: z.string().optional().nullable(),
  readAt: z.string().optional().nullable(),
  sentByName: z.string().optional().nullable(),
  sentByUserFirstName: z.string().optional().nullable(),
  sentByUserLastName: z.string().optional().nullable(),
  replyToMessageId: z.string().optional().nullable(),
  replyToMessageContent: z.string().optional().nullable(),
  medias: z.array(MediaSchema).optional().default([]),
});
export type Message = z.infer<typeof MessageSchema>;

// ─── Conversation ─────────────────────────────────────────────────────────────

export const ConversationSchema = z.object({
  id: z.string(),
  contactAddress: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  status: ConversationStatusSchema.optional().default('OPEN'),
  channelName: z.string().optional().nullable(),
  channelCode: z.string().optional().nullable(),
  senderName: z.string().optional().nullable(),
  senderAddress: z.string().optional().nullable(),
  lastMessageAt: z.string().optional().nullable(),
  lastMessageContent: z.string().optional().nullable(),
  lastMessageSubject: z.string().optional().nullable(),
  lastMessageMessageType: z.string().optional().nullable(),
  unreadCount: z.number().optional().default(0),
  assignedToUserId: z.string().optional().nullable(),
  assignedToUserFirstName: z.string().optional().nullable(),
  assignedToUserLastName: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

// ─── Stats ────────────────────────────────────────────────────────────────────

export const StatsSchema = z.object({
  open: z.number().optional().default(0),
  pending: z.number().optional().default(0),
  resolved: z.number().optional().default(0),
  closed: z.number().optional().default(0),
  totalUnread: z.number().optional().default(0),
});
export type Stats = z.infer<typeof StatsSchema>;

// ─── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});
export type User = z.infer<typeof UserSchema>;

// ─── API Response wrappers ────────────────────────────────────────────────────

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.union([
      z.object({ items: z.array(itemSchema), total: z.number().optional() }),
      z.array(itemSchema),
    ]).optional().nullable(),
  });

export const SingleResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional().nullable(),
  });

// ─── Forms ────────────────────────────────────────────────────────────────────

export const SendMessageFormSchema = z.object({
  content: z.string().min(1, 'Le message ne peut pas être vide'),
});
export type SendMessageForm = z.infer<typeof SendMessageFormSchema>;

export const SendFlowFormSchema = z.object({
  flowToken: z.string().min(1, 'Le token du flow est requis'),
});
export type SendFlowForm = z.infer<typeof SendFlowFormSchema>;

export const BulkSendFormSchema = z.object({
  type: z.enum(['j0', 'j3']),
  // Note: File input is handled outside of React Hook Form since Zod + File can be tricky.
});
export type BulkSendForm = z.infer<typeof BulkSendFormSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const AV_COLORS = [
  '#1565c0','#2e7d32','#c62828','#6a1b9a',
  '#00838f','#558b2f','#4527a0','#ad1457',
  '#e65100','#37474f',
] as const;

export function avatarColor(id: string): string {
  if (!id) return '#607d8b';
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h * 31 + id.charCodeAt(i)) >>> 0);
  return AV_COLORS[h % AV_COLORS.length];
}

export function getInitials(s: string): string {
  const parts = (s || '').replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (s[0] || '?').toUpperCase();
}

export function fmtTime(dt: string | null | undefined): string {
  if (!dt) return '';
  const d = new Date(dt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Hier';
  if (diff < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function fmtTimeFull(dt: string | null | undefined): string {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleString('fr-FR');
}

export function fmtTimeShort(dt: string | null | undefined): string {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function convPreview(c: Conversation): string {
  const t = (c.lastMessageMessageType || '').toUpperCase();
  if (t === 'IMAGE') return '📷 Photo';
  if (t === 'VIDEO') return '🎥 Vidéo';
  if (t === 'AUDIO') return '🎵 Audio';
  if (t === 'DOCUMENT') return '📄 Document';
  if (t === 'CONTACT') return '👤 Contact';
  return c.lastMessageContent || c.lastMessageSubject || '';
}
