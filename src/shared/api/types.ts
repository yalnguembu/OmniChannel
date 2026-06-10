export interface ProductDto {
  id: string;
  createdAt: string;
  companyId: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "paused" | "draft";
  settings?: Record<string, unknown>;
  clientAttributes?: Record<string, unknown>;
  clientMappingConfiguration?: Record<string, unknown>;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface ClientDto {
  id: string;
  createdAt: string;
  productId: string;
  externalId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  language?: string;
  timezone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status: "active" | "inactive" | "blocked";
  customData?: Record<string, unknown>;
  updatedAt?: string;
  createdBy?: string;
  isDeleted?: boolean;
}

export interface CampaignDto {
  id: string;
  createdAt: string;
  productId: string;
  name: string;
  description?: string;
  type: "standard" | "ai" | "trigger" | "recurring";
  status: "draft" | "active" | "scheduled" | "completed" | "paused" | "failed";
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  recurrencePattern?: string;
  totalRecipients?: number;
  successfulSends?: number;
  failedSends?: number;
  updatedAt?: string;
  createdBy?: string;
  isDeleted?: boolean;
}

export interface TemplateDto {
  id: string;
  createdAt: string;
  productId: string;
  name: string;
  description?: string;
  status: "active" | "draft" | "archived";
  subject?: string;
  content: string;
  language?: string;
  category?: string;
  version?: number;
  updatedAt?: string;
  createdBy?: string;
  isDeleted?: boolean;
}

export interface MessageDto {
  id: string;
  createdAt: string;
  campaignId?: string;
  clientId?: string;
  templateId?: string;
  channelId?: string;
  connectorId?: string;
  externalMessageId?: string;
  clientFirstName?: string;
  clientLastName?: string;
  direction?: string;
  messageType?: string;
  connectorName?: string;
  recipientAddress?: string;
  subject?: string;
  content?: string;
  status:
    | "queued"
    | "sent"
    | "delivered"
    | "failed"
    | "pending"
    | "opened"
    | "read"
    | "received"
    | "clicked"
    | "bounced";
  attemptCount?: number;
  maxAttempts?: number;
  nextRetryAt?: string;
  errorCode?: string;
  errorMessage?: string;
  queuedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cost?: number;
  count?: number;
  isApiCall?: boolean;
  channelCode?: string;
  productId?: string;
}

export interface ChannelDto {
  id: string;
  createdAt: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  maxContentLength?: number;
  supportsRichContent?: boolean;
  supportsAttachments?: boolean;
  requiresOptIn?: boolean;
  updatedAt?: string;
}

export interface ConnectorDto {
  id: string;
  createdAt: string;
  providerId: string;
  productId?: string;
  companyId?: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  configuration?: Record<string, unknown>;
  priority?: number;
  lastTestAt?: string;
  lastTestStatus?: string;
  updatedAt?: string;
}

export interface ProviderDto {
  id: string;
  createdAt: string;
  name: string;
  code: string;
  isGlobal: boolean;
  isActive: boolean;
  baseUrl?: string;
  documentationUrl?: string;
  updatedAt?: string;
}

export interface InvoiceDto {
  id: string;
  createdAt: string;
  companyId: string;
  invoiceNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subTotal: number;
  taxRate?: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate?: string;
  paidAt?: string;
  taxAmount?: number;
  currency?: string;
  updatedAt?: string;
}

export interface WalletDto {
  id: string;
  createdAt: string;
  companyId: string;
  balance: number;
  minimumBalance?: number;
  lowBalanceThreshold?: number;
  isBlocked?: boolean;
  blockedAt?: string;
  blockReason?: string;
  currency?: string;
  updatedAt?: string;
}

export interface WalletTransactionDto {
  id: string;
  createdAt: string;
  walletId: string;
  referenceId?: string;
  type: "credit" | "debit";
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
  referenceType?: string;
  amount: number;
  createdBy?: string;
}

export interface SubscriptionDto {
  id: string;
  createdAt: string;
  companyId: string;
  planId: string;
  paymentId?: string;
  status: "active" | "cancelled" | "expired" | "pending";
  billingCycle: "monthly" | "yearly";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  usedQuota?: number;
  autoRenew?: boolean;
  cancelledAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlanDto {
  id: string;
  createdAt: string;
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  monthlyQuota?: number;
  maxProducts?: number;
  maxUsers?: number;
  features?: string[];
  isActive: boolean;
  updatedAt?: string;
}

export interface PaymentMethodDto {
  id: string;
  createdAt: string;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  requiresPhoneNumber?: boolean;
  settlementPeriod?: number;
  isActive: boolean;
  sortOrder?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  updatedAt?: string;
}

export interface PaymentDto {
  id: string;
  createdAt: string;
  companyId: string;
  invoiceId?: string;
  paymentMethodId?: string;
  externalTransactionId?: string;
  finalTransactionId?: string;
  method?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata?: Record<string, unknown>;
  processedAt?: string;
  failureReason?: string;
  amount: number;
  currency?: string;
  updatedAt?: string;
}

export interface WebhookEndpointDto {
  id: string;
  createdAt: string;
  companyId: string;
  url: string;
  description?: string;
  isActive: boolean;
  secretKey?: string;
  events?: string[];
  timeoutSeconds?: number;
  maxRetries?: number;
  retryDelaySeconds?: number;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface WebhookDeliveryDto {
  id: string;
  createdAt: string;
  webhookEndpointId: string;
  eventType: string;
  payload?: Record<string, unknown>;
  status: "pending" | "success" | "failed";
  httpStatusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  attemptCount?: number;
  nextRetryAt?: string;
  sentAt?: string;
}

export interface CompanyApiKeyDto {
  id: string;
  createdAt: string;
  companyId: string;
  name: string;
  keyHash?: string;
  keyPrefix?: string;
  isActive: boolean;
  scopes?: string[];
  ipWhitelist?: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface IntegrationSyncLogDto {
  id: string;
  createdAt: string;
  integrationId: string;
  syncType: string;
  status: "success" | "error" | "running";
  recordsProcessed?: number;
  recordsSucceeded?: number;
  recordsFailed?: number;
  errorLog?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TagDto {
  id: string;
  createdAt: string;
  companyId: string;
  name: string;
  color?: string;
  updatedAt?: string;
}

export interface BlocklistDto {
  id: string;
  createdAt: string;
  companyId: string;
  blockType: "phone" | "email";
  value: string;
  reason?: string;
  updatedAt?: string;
}

export interface NotificationDto {
  id: string;
  createdAt: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  alertType?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface CompanyDto {
  id: string;
  createdAt: string;
  countryId?: string;
  name: string;
  legalName?: string;
  taxNumber?: string;
  status: "active" | "inactive" | "suspended" | "pending";
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  billingMode?: string;
  timezone?: string;
  defaultLanguage?: string;
  isSandbox?: boolean;
  isEmailVerified?: boolean;
  isKycVerified?: boolean;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface UserDto {
  id: string;
  createdAt: string;
  companyId?: string;
  profileId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: "SYSTEM_ADMIN" | "COMPANY_ADMIN" | "COMPANY_USER" | "SYSTEM_USER";
  status: "active" | "inactive" | "suspended";
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface UserProfileDto {
  id: string;
  createdAt: string;
  name: string;
  description?: string;
  permissions?: string;
  isSystemProfile?: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export interface ClientSegmentDto {
  id: string;
  createdAt: string;
  productId: string;
  name: string;
  description?: string;
  criteria?: Record<string, unknown>;
  isDynamic?: boolean;
  lastCalculatedAt?: string;
  clientCount?: number;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface MessageEventDto {
  id: string;
  createdAt: string;
  messageId: string;
  eventType:
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed"
    | "unsubscribed";
  eventData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export interface ClientChannelPreferenceDto {
  id: string;
  createdAt: string;
  clientId: string;
  channelId: string;
  isOptedIn: boolean;
  optedInAt?: string;
  optedOutAt?: string;
  optOutReason?: string;
  updatedAt?: string;
}

export interface CampaignStatisticDto {
  id: string;
  createdAt: string;
  campaignId: string;
  totalRecipients?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalFailed?: number;
  totalBounced?: number;
  totalOpened?: number;
  totalClicked?: number;
  deliveryRate?: number;
  openRate?: number;
  clickRate?: number;
  bounceRate?: number;
  totalCost?: number;
  updatedAt?: string;
}

export interface ProductChannelDto {
  id: string;
  createdAt: string;
  productId: string;
  channelId: string;
  isActive: boolean;
  priority?: number;
  updatedAt?: string;
}

export interface ClientImportDto {
  id: string;
  createdAt: string;
  productId: string;
  fileName: string;
  fileSize?: number;
  fileUrl?: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalRows?: number;
  successfulRows?: number;
  failedRows?: number;
  duplicateRows?: number;
  mappingConfiguration?: Record<string, unknown>;
  errorLog?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy?: string;
}

export interface AuditLogDto {
  id: string;
  createdAt: string;
  companyId?: string;
  userId?: string;
  entityId?: string;
  action?: string;
  entityType?: string;
  entityName?: string;
  entityDisplayName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changedColumn?: string;
  changeReason?: string;
  ipAddress?: string;
  userAgent?: string;
  riskLevel?: string;
}

export interface SysLogDto {
  id: string;
  createdAt: string;
  correlationId?: string;
  logLevel?: string;
  message?: string;
  exceptionMessage?: string;
  requestUri?: string;
  httpStatusCode?: number;
  amount?: number;
  currency?: string;
  durationMs?: number;
  userId?: string;
}

export interface PricingDto {
  id: string;
  createdAt: string;
  channelId: string;
  providerId?: string;
  companyId?: string;
  unitPrice: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  currency?: string;
  platformFee?: number;
  platformFeeType?: string;
  updatedAt?: string;
}

export interface CountryDto {
  id: string;
  createdAt: string;
  code: string;
  name: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface CurrencyDto {
  id: string;
  createdAt: string;
  code: string;
  name: string;
  symbol?: string;
  decimalPlaces?: number;
  exchangeRate?: number;
  isBaseCurrency?: boolean;
  isActive: boolean;
  lastUpdated?: string;
  updatedAt?: string;
}

export interface JobDto {
  id: string;
  createdAt: string;
  jobType: string;
  status: "pending" | "running" | "completed" | "failed";
  payload?: Record<string, unknown>;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  errorMessage?: string;
  attemptCount?: number;
  maxAttempts?: number;
}

export interface CampaignChannelDto {
  id: string;
  createdAt: string;
  campaignId: string;
  channelId: string;
  templateId?: string;
  priority?: number;
  updatedAt?: string;
}

export interface CampaignSegmentDto {
  id: string;
  createdAt: string;
  campaignId: string;
  segmentId: string;
  updatedAt?: string;
}

export interface CampaignStepDto {
  id: string;
  createdAt: string;
  campaignId: string;
  templateId?: string;
  channelId?: string;
  stepOrder: number;
  name: string;
  delayInMinutes?: number;
  conditions?: Record<string, unknown>;
  updatedAt?: string;
}

export interface TemplateChannelDto {
  id: string;
  createdAt: string;
  templateId: string;
  channelId: string;
  updatedAt?: string;
}

export interface CompanyChannelDto {
  id: string;
  createdAt: string;
  companyId: string;
  channelId: string;
  isActive: boolean;
  settings?: Record<string, unknown>;
  updatedAt?: string;
}

export interface ProductChannelStatisticDto {
  id: string;
  createdAt: string;
  productId: string;
  channelId: string;
  periodStart: string;
  periodEnd: string;
  messagesSent?: number;
  messagesDelivered?: number;
  messagesFailed?: number;
  totalCost?: number;
  updatedAt?: string;
}

export interface IntegrationDto {
  id: string;
  createdAt: string;
  name: string;
  type: string;
  isActive: boolean;
  syncDirection?: string;
  lastSyncAt?: string;
  settings?: Record<string, unknown>;
  companyId?: string;
  updatedAt?: string;
}

export interface ClientSegmentMemberDto {
  id: string;
  createdAt: string;
  clientId: string;
  segmentId: string;
  addedAt?: string;
}

export interface SettingDto {
  id: string;
  createdAt: string;
  key: string;
  value?: string;
  category?: string;
  dataType?: string;
  isReadOnly?: boolean;
  isEncrypted?: boolean;
  updatedAt?: string;
}

export interface SecureSettingDto {
  id: string;
  createdAt: string;
  systemName: string;
  value?: string;
  salt?: string;
  description: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
