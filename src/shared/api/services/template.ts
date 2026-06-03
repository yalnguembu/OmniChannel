import * as SDK from "@/shared/api/generated/sdk.gen";
import type {
  TemplateDto,
  TemplateChannelDto,
  PostApiTemplateSearchData,
  PostApiTemplateChannelSearchData,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import type { ApiResponse } from "@/shared/types/api";

export const TemplateService = {
  getById: (id: string) =>
    handleRequest<TemplateDto>(SDK.getApiTemplateById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiTemplateDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiTemplateDropdown() as any),

  search: (body: PostApiTemplateSearchData["body"]) =>
    handleRequest<any>(SDK.postApiTemplateSearch({ body }) as any),

  create: (body: Partial<TemplateDto>) =>
    handleRequest<TemplateDto>(SDK.postApiTemplate({ body: body as any })),

  update: (body: Partial<TemplateDto>) =>
    handleRequest<TemplateDto>(SDK.putApiTemplate({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiTemplateById({ path: { id } })),
};

export const TemplateChannelService = {
  getById: (id: string) =>
    handleRequest<TemplateChannelDto>(
      SDK.getApiTemplateChannelById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiTemplateChannelDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiTemplateChannelDropdown() as any),

  search: (body: PostApiTemplateChannelSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiTemplateChannelSearch({ body }) as any,
    ),

  create: (body: Partial<TemplateChannelDto>) =>
    handleRequest<TemplateChannelDto>(
      SDK.postApiTemplateChannel({ body: body as any }),
    ),

  update: (body: Partial<TemplateChannelDto>) =>
    handleRequest<TemplateChannelDto>(
      SDK.putApiTemplateChannel({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiTemplateChannelById({ path: { id } })),
};
