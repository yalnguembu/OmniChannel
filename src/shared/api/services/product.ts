import * as SDK from "@/shared/api/generated/sdk.gen";
import type {
  ProductDto,
  ProductChannelDto,
  ProductChannelStatisticDto,
  PostApiProductSearchData,
  PostApiProductChannelSearchData,
  PostApiProductChannelStatisticSearchData,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import type { ApiResponse } from "@/shared/types/api";

export const ProductService = {
  getById: (id: string) =>
    handleRequest<ProductDto>(SDK.getApiProductById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiProductDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiProductDropdown() as any),

  search: (body: PostApiProductSearchData["body"]) =>
    handleRequest<any>(SDK.postApiProductSearch({ body }) as any),

  create: (body: Partial<ProductDto>) =>
    handleRequest<ProductDto>(SDK.postApiProduct({ body: body as any })),

  update: (body: Partial<ProductDto>) =>
    handleRequest<ProductDto>(SDK.putApiProduct({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiProductById({ path: { id } })),
};

export const ProductChannelService = {
  getById: (id: string) =>
    handleRequest<ProductChannelDto>(
      SDK.getApiProductChannelById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiProductChannelDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiProductChannelDropdown() as any),

  search: (body: PostApiProductChannelSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiProductChannelSearch({ body }) as any,
    ),

  create: (body: Partial<ProductChannelDto>) =>
    handleRequest<ProductChannelDto>(
      SDK.postApiProductChannel({ body: body as any }),
    ),

  update: (body: Partial<ProductChannelDto>) =>
    handleRequest<ProductChannelDto>(
      SDK.putApiProductChannel({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiProductChannelById({ path: { id } })),
};

export const ProductChannelStatisticService = {
  getById: (id: string) =>
    handleRequest<ProductChannelStatisticDto>(
      SDK.getApiProductChannelStatisticById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(
      SDK.getApiProductChannelStatisticDetailById({ path: { id } }),
    ),

  search: (body: PostApiProductChannelStatisticSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiProductChannelStatisticSearch({ body }) as any,
    ),
};
