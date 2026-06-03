import { AxiosError, AxiosResponse } from "axios";
import { ObjectOmniChannelApiResponse } from "../api/generated/types.gen";

export interface PaginatedDataList<T> {
  readonly items: T[];
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  readonly count: number;
  readonly isEmpty: boolean;
}

export interface SuccessResponse<T> {
  data: T;
  success: true;
}

export interface FailedResponse {
  title: string;
  status: number;
  traceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  success: false;
  detail: string;
  errorCode: string;
  validationErrors?: Record<string, string[]>;
  /**
   * Always absent on failures. Declared so callers can read `res.data?.…`
   * on the union without first narrowing on `success`.
   */
  data?: undefined;
}

export type ApiResponse<T> = SuccessResponse<T> | FailedResponse;

interface BaseApiRequestResponse<T> {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  data?: T;
  success?: boolean;
  errorCode?: string | null;
  traceId?: string | null;
  timestamp?: string;
  validationErrors?: {
    [key: string]: Array<string>;
  } | null;
  metadata?: {
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export type ApiRequest<T> = Promise<
  | (AxiosResponse<BaseApiRequestResponse<T>, any, {}> & {
      error: undefined;
    })
  | (AxiosError<ObjectOmniChannelApiResponse, any> & {
      data: undefined;
      error: ObjectOmniChannelApiResponse;
    })
>;

// export interface SearchRequest {
//   pageNumber?: number
//   pageSize?: number
//   searchTerm?: string
//   sortBy?: string
//   sortDirection?: 'asc' | 'desc'
//   [key: string]: unknown
// }

// export type Status = 'active' | 'inactive' | 'paused' | 'draft' | 'blocked'
// export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent'
