import * as SDK from "@/shared/api/generated/sdk.gen";
import type {
  MessageDto,
  MessageEventDto,
  WebhookEndpointDto,
  WebhookDeliveryDto,
  ChannelDto,
  ConnectorDto,
  ProviderDto,
  ProviderCallbackDto,
  NotificationDto,
  PostApiMessageSearchData,
  PostApiMessageEventSearchData,
  PostApiWebhookEndpointSearchData,
  PostApiWebhookDeliverySearchData,
  PostApiChannelSearchData,
  PostApiConnectorSearchData,
  PostApiProviderSearchData,
  PostApiProviderCallbackSearchData,
  PostApiNotificationSearchData,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import type { ApiResponse } from "@/shared/types/api";

export const MessageService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiMessageById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiMessageDetailById({ path: { id } })),

  search: (body: PostApiMessageSearchData["body"]) =>
    handleRequest<any>(SDK.postApiMessageSearch({ body }) as any),
};

export const MessageEventService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiMessageEventById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiMessageEventDetailById({ path: { id } })),

  search: (body: PostApiMessageEventSearchData["body"]) =>
    handleRequest<any>(SDK.postApiMessageEventSearch({ body }) as any),
};

export const WebhookEndpointService = {
  getById: (id: string) =>
    handleRequest<WebhookEndpointDto>(
      SDK.getApiWebhookEndpointById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiWebhookEndpointDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiWebhookEndpointDropdown() as any),

  search: (body: PostApiWebhookEndpointSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiWebhookEndpointSearch({ body }) as any,
    ),

  create: (body: Partial<WebhookEndpointDto>) =>
    handleRequest<WebhookEndpointDto>(
      SDK.postApiWebhookEndpoint({ body: body as any }),
    ),

  update: (body: Partial<WebhookEndpointDto>) =>
    handleRequest<WebhookEndpointDto>(
      SDK.putApiWebhookEndpoint({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiWebhookEndpointById({ path: { id } })),
};

export const WebhookDeliveryService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiWebhookDeliveryById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiWebhookDeliveryDetailById({ path: { id } })),

  search: (body: PostApiWebhookDeliverySearchData["body"]) =>
    handleRequest<any>(SDK.postApiWebhookDeliverySearch({ body }) as any),
};

export const ChannelService = {
  getById: (id: string) =>
    handleRequest<ChannelDto>(SDK.getApiChannelById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiChannelDropdown() as any),

  search: (body: PostApiChannelSearchData["body"]) =>
    handleRequest<any>(SDK.postApiChannelSearch({ body }) as any),

  create: (body: Partial<ChannelDto>) =>
    handleRequest<ChannelDto>(SDK.postApiChannel({ body: body as any })),

  update: (body: Partial<ChannelDto>) =>
    handleRequest<ChannelDto>(SDK.putApiChannel({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiChannelById({ path: { id } })),
};

export const ConnectorService = {
  getById: (id: string) =>
    handleRequest<ConnectorDto>(SDK.getApiConnectorById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiConnectorDetailById({ path: { id } })),


  search: (body: PostApiConnectorSearchData["body"]) =>
    handleRequest<any>(SDK.postApiConnectorSearch({ body }) as any),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiConnectorById({ path: { id } })),
};

export const ProviderService = {
  getDropdown: () => handleRequest<any>(SDK.getApiProviderDropdown() as any),

  search: (body: PostApiProviderSearchData["body"]) =>
    handleRequest<any>(SDK.postApiProviderSearch({ body }) as any),

  create: (body: any) => handleRequest<any>(SDK.postApiProvider({ body }) as any),

  update: (body: any) => handleRequest<any>(SDK.putApiProvider({ body }) as any),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiProviderById({ path: { id } }) as any),
};

export const ProviderCallbackService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiProviderCallbackById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiProviderCallbackDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiProviderCallbackDropdown() as any),

  search: (body: PostApiProviderCallbackSearchData["body"]) =>
    handleRequest<any>(SDK.postApiProviderCallbackSearch({ body }) as any),

  create: (body: any) =>
    handleRequest<any>(SDK.postApiProviderCallback({ body: body as any })),

  update: (body: any) =>
    handleRequest<any>(SDK.putApiProviderCallback({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiProviderCallbackById({ path: { id } })),
};

export const NotificationService = {
  getById: (id: string) =>
    handleRequest<NotificationDto>(
      SDK.getApiNotificationById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiNotificationDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiNotificationDropdown() as any),

  search: (body: PostApiNotificationSearchData["body"]) =>
    handleRequest<any>(SDK.postApiNotificationSearch({ body }) as any),

  create: (body: Partial<NotificationDto>) =>
    handleRequest<NotificationDto>(
      SDK.postApiNotification({ body: body as any }),
    ),

  update: (body: Partial<NotificationDto>) =>
    handleRequest<NotificationDto>(
      SDK.putApiNotification({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiNotificationById({ path: { id } })),
};
