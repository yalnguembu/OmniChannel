import * as SDK from "@/shared/api/generated/sdk.gen";
import type {
  WalletDto,
  WalletTransactionDto,
  InvoiceDto,
  PaymentDto,
  PaymentMethodDto,
  SubscriptionDto,
  SubscriptionPlanDto,
  PostApiWalletSearchData,
  PostApiWalletTransactionSearchData,
  PostApiInvoiceSearchData,
  PostApiPaymentSearchData,
  PostApiPaymentMethodSearchData,
  PostApiSubscriptionSearchData,
  PostApiSubscriptionPlanSearchData,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import type { ApiResponse } from "@/shared/types/api";

export const WalletService = {
  getById: (id: string) =>
    handleRequest<WalletDto>(SDK.getApiWalletById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiWalletDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiWalletDropdown() as any),

  search: (body: PostApiWalletSearchData["body"]) =>
    handleRequest<any>(SDK.postApiWalletSearch({ body }) as any),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiWalletById({ path: { id } })),
};

export const WalletTransactionService = {
  getById: (id: string) =>
    handleRequest<WalletTransactionDto>(
      SDK.getApiWalletTransactionById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiWalletTransactionDetailById({ path: { id } })),

  search: (body: PostApiWalletTransactionSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiWalletTransactionSearch({ body }) as any,
    ),
};

export const InvoiceService = {
  getById: (id: string) =>
    handleRequest<InvoiceDto>(SDK.getApiInvoiceById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiInvoiceDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiInvoiceDropdown() as any),

  search: (body: PostApiInvoiceSearchData["body"]) =>
    handleRequest<any>(SDK.postApiInvoiceSearch({ body }) as any),

  create: (body: Partial<InvoiceDto>) =>
    handleRequest<InvoiceDto>(SDK.postApiInvoice({ body: body as any })),

  update: (body: Partial<InvoiceDto>) =>
    handleRequest<InvoiceDto>(SDK.putApiInvoice({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiInvoiceById({ path: { id } })),
};

export const PaymentService = {
  getById: (id: string) =>
    handleRequest<PaymentDto>(SDK.getApiPaymentById({ path: { id } })),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiPaymentDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiPaymentDropdown() as any),

  search: (body: PostApiPaymentSearchData["body"]) =>
    handleRequest<any>(SDK.postApiPaymentSearch({ body }) as any),

  create: (body: Partial<PaymentDto>) =>
    handleRequest<PaymentDto>(SDK.postApiPayment({ body: body as any })),

  update: (body: Partial<PaymentDto>) =>
    handleRequest<PaymentDto>(SDK.putApiPayment({ body: body as any })),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiPaymentById({ path: { id } })),
};

export const PaymentMethodService = {
  getById: (id: string) =>
    handleRequest<PaymentMethodDto>(
      SDK.getApiPaymentMethodById({ path: { id } }),
    ),

  getDropdown: () => handleRequest<any>(SDK.getApiPaymentMethodDropdown() as any),

  search: (body: PostApiPaymentMethodSearchData["body"]) =>
    handleRequest<any>(SDK.postApiPaymentMethodSearch({ body }) as any),

  create: (body: Partial<PaymentMethodDto>) =>
    handleRequest<PaymentMethodDto>(
      SDK.postApiPaymentMethod({ body: body as any }),
    ),

  update: (body: Partial<PaymentMethodDto>) =>
    handleRequest<PaymentMethodDto>(
      SDK.putApiPaymentMethod({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiPaymentMethodById({ path: { id } })),
};

export const SubscriptionService = {
  getById: (id: string) =>
    handleRequest<SubscriptionDto>(
      SDK.getApiSubscriptionById({ path: { id } }),
    ),

  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiSubscriptionDetailById({ path: { id } })),

  getDropdown: () => handleRequest<any>(SDK.getApiSubscriptionDropdown() as any),

  search: (body: PostApiSubscriptionSearchData["body"]) =>
    handleRequest<any>(SDK.postApiSubscriptionSearch({ body }) as any),

  create: (body: Partial<SubscriptionDto>) =>
    handleRequest<SubscriptionDto>(
      SDK.postApiSubscription({ body: body as any }),
    ),

  update: (body: Partial<SubscriptionDto>) =>
    handleRequest<SubscriptionDto>(
      SDK.putApiSubscription({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiSubscriptionById({ path: { id } })),
};

export const SubscriptionPlanService = {
  getById: (id: string) =>
    handleRequest<SubscriptionPlanDto>(
      SDK.getApiSubscriptionPlanById({ path: { id } }),
    ),

  getDropdown: () => handleRequest<any>(SDK.getApiSubscriptionPlanDropdown() as any),

  search: (body: PostApiSubscriptionPlanSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiSubscriptionPlanSearch({ body }) as any,
    ),

  create: (body: Partial<SubscriptionPlanDto>) =>
    handleRequest<SubscriptionPlanDto>(
      SDK.postApiSubscriptionPlan({ body: body as any }),
    ),

  update: (body: Partial<SubscriptionPlanDto>) =>
    handleRequest<SubscriptionPlanDto>(
      SDK.putApiSubscriptionPlan({ body: body as any }),
    ),

  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiSubscriptionPlanById({ path: { id } })),
};
