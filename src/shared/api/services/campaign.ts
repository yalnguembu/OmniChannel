import type {
  CampaignDto,
  CampaignChannelDto,
  CampaignSegmentDto,
  CampaignStepDto,
  CampaignStatisticDto,
  PostApiCampaignSearchData,
  PostApiCampaignChannelSearchData,
  PostApiCampaignSegmentSearchData,
  PostApiCampaignStepSearchData,
  PostApiCampaignStatisticSearchData,
  SearchCampaignResponse,
  GetAllCampaignResponse,
  GetAllCampaignChannelResponse,
  GetAllCampaignSegmentResponse,
  GetAllCampaignStepResponse,
  GetAllCampaignStatisticResponse,
  SearchCampaignSegmentRequest,
  BaseDeleteResponse,
  BaseCreateResponse,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import type { PaginatedDataList } from "@/shared/types/api";
import {
  getApiCampaignById,
  getApiCampaignDetailById,
  getApiCampaignDropdown,
  postApiCampaignSearch,
  postApiCampaign,
  putApiCampaign,
  deleteApiCampaignById,
  getApiCampaignChannelById,
  getApiCampaignChannelDetailById,
  getApiCampaignChannelDropdown,
  postApiCampaignChannelSearch,
  postApiCampaignChannel,
  putApiCampaignChannel,
  deleteApiCampaignChannelById,
  getApiCampaignSegmentById,
  getApiCampaignSegmentDetailById,
  getApiCampaignSegmentDropdown,
  postApiCampaignSegmentSearch,
  postApiCampaignSegment,
  putApiCampaignSegment,
  deleteApiCampaignSegmentById,
  getApiCampaignStepById,
  getApiCampaignStepDetailById,
  getApiCampaignStepDropdown,
  postApiCampaignStepSearch,
  postApiCampaignStep,
  putApiCampaignStep,
  deleteApiCampaignStepById,
  getApiCampaignStatisticById,
  getApiCampaignStatisticDetailById,
  getApiCampaignStatisticDropdown,
  postApiCampaignStatisticSearch,
} from "@/shared/api/generated/sdk.gen";

export const CampaignService = {
  getById: (id: string) =>
    handleRequest<CampaignDto>(getApiCampaignById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<SearchCampaignResponse>(
      getApiCampaignDetailById({ path: { id } }),
    ),

  getDropdown: () =>
    handleRequest<any>(getApiCampaignDropdown() as any),

  search: (body: PostApiCampaignSearchData["body"]) =>
    handleRequest<any>(
      postApiCampaignSearch({ body }) as any,
    ),

  create: (body: Partial<CampaignDto>) =>
    handleRequest<BaseCreateResponse>(postApiCampaign({ body: body as any })),

  update: (body: Partial<CampaignDto>) =>
    handleRequest<CampaignDto>(putApiCampaign({ body: body as any })),

  delete: (id: string) =>
    handleRequest<BaseDeleteResponse>(deleteApiCampaignById({ path: { id } })),
};

export const CampaignChannelService = {
  getById: (id: string) =>
    handleRequest<CampaignChannelDto>(
      getApiCampaignChannelById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<GetAllCampaignChannelResponse>(
      getApiCampaignChannelDetailById({ path: { id } }),
    ),

  getDropdown: () =>
    handleRequest<any>(
      getApiCampaignChannelDropdown() as any,
    ),

  search: (body: PostApiCampaignChannelSearchData["body"]) =>
    handleRequest<any>(
      postApiCampaignChannelSearch({ body }) as any,
    ),

  create: (body: Partial<CampaignChannelDto>) =>
    handleRequest<BaseCreateResponse>(
      postApiCampaignChannel({ body: body as any }),
    ),

  update: (body: Partial<CampaignChannelDto>) =>
    handleRequest<CampaignChannelDto>(
      putApiCampaignChannel({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<BaseDeleteResponse>(
      deleteApiCampaignChannelById({ path: { id } }),
    ),
};

export const CampaignSegmentService = {
  getById: (id: string) =>
    handleRequest<CampaignSegmentDto>(
      getApiCampaignSegmentById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<GetAllCampaignSegmentResponse>(
      getApiCampaignSegmentDetailById({ path: { id } }),
    ),

  getDropdown: () =>
    handleRequest<any>(
      getApiCampaignSegmentDropdown() as any,
    ),

  search: (body: PostApiCampaignSegmentSearchData["body"]) =>
    handleRequest<any>(
      postApiCampaignSegmentSearch({ body }) as any,
    ),

  create: (body: Partial<CampaignSegmentDto>) =>
    handleRequest<BaseCreateResponse>(
      postApiCampaignSegment({ body: body as any }),
    ),

  update: (body: Partial<CampaignSegmentDto>) =>
    handleRequest<CampaignSegmentDto>(
      putApiCampaignSegment({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<BaseDeleteResponse>(
      deleteApiCampaignSegmentById({ path: { id } }),
    ),
};

export const CampaignStepService = {
  getById: (id: string) =>
    handleRequest<CampaignStepDto>(getApiCampaignStepById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<GetAllCampaignStepResponse>(
      getApiCampaignStepDetailById({ path: { id } }),
    ),

  getDropdown: () =>
    handleRequest<any>(getApiCampaignStepDropdown() as any),

  search: (body: PostApiCampaignStepSearchData["body"]) =>
    handleRequest<any>(
      postApiCampaignStepSearch({ body }) as any,
    ),

  create: (body: Partial<CampaignStepDto>) =>
    handleRequest<BaseCreateResponse>(
      postApiCampaignStep({ body: body as any }),
    ),

  update: (body: Partial<CampaignStepDto>) =>
    handleRequest<CampaignStepDto>(putApiCampaignStep({ body: body as any })),

  delete: (id: string) =>
    handleRequest<BaseDeleteResponse>(
      deleteApiCampaignStepById({ path: { id } }),
    ),
};

export const CampaignStatisticService = {
  getById: (id: string) =>
    handleRequest<CampaignStatisticDto>(
      getApiCampaignStatisticById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<GetAllCampaignStatisticResponse>(
      getApiCampaignStatisticDetailById({ path: { id } }),
    ),

  getDropdown: () => handleRequest<any>(getApiCampaignStatisticDropdown() as any),

  search: (body: PostApiCampaignStatisticSearchData["body"]) =>
    handleRequest<any>(
      postApiCampaignStatisticSearch({ body }) as any,
    ),
};
