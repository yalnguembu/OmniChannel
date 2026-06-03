import * as SDK from "@/shared/api/generated/sdk.gen";
import type {
  CompanyDto,
  CompanyChannelDto,
  CompanyApiKeyDto,
  CompanyVerificationDto,
  CompanySettingDto,
  UserDto,
  UserProfileDto,
  CreateCompanyUserRequest,
  CreateSystemUserRequest,
  ChangeUserStatusRequest,
  AuditLogDto,
  SysLogDto,
  CountryDto,
  CurrencyDto,
  PricingDto,
  SettingDto,
  JobDto,
  EntityTagDto,
  FileDto,
  IntegrationDto,
  IntegrationSyncLogDto,
  TagDto,
  BlocklistDto,
  PostApiCompanySearchData,
  PostApiCompanyChannelSearchData,
  PostApiCompanyApiKeySearchData,
  PostApiCompanyVerificationSearchData,
  PostApiCompanySettingSearchData,
  PostApiUserSearchData,
  PostApiUserProfileSearchData,
  PostApiAuditLogSearchData,
  PostApiSysLogSearchData,
  PostApiCountrySearchData,
  PostApiCurrencySearchData,
  PostApiPricingSearchData,
  PostApiSettingSearchData,
  PostApiJobSearchData,
  PostApiEntityTagSearchData,
  PostApiFileSearchData,
  PostApiIntegrationSearchData,
  PostApiIntegrationSyncLogSearchData,
  PostApiTagSearchData,
  PostApiBlocklistSearchData,
} from "@/shared/api/generated/types.gen";
import { handleRequest } from "../setup";
import { client } from "@/shared/api/generated/client.gen";
import type { ApiResponse } from "@/shared/types/api";

// --- Company ---
export const CompanyService = {
  getById: (id: string) =>
    handleRequest<CompanyDto>(SDK.getApiCompanyById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiCompanyDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCompanyDropdown() as any),
  search: (body: PostApiCompanySearchData["body"]) =>
    handleRequest<any>(SDK.postApiCompanySearch({ body }) as any),
  create: (body: Partial<CompanyDto>) =>
    handleRequest<CompanyDto>(SDK.postApiCompany({ body: body as any })),
  update: (body: Partial<CompanyDto>) =>
    handleRequest<CompanyDto>(SDK.putApiCompany({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCompanyById({ path: { id } })),
};

export const CompanyChannelService = {
  getById: (id: string) =>
    handleRequest<CompanyChannelDto>(
      SDK.getApiCompanyChannelById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiCompanyChannelDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCompanyChannelDropdown() as any),
  search: (body: PostApiCompanyChannelSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiCompanyChannelSearch({ body }) as any,
    ),
  create: (body: Partial<CompanyChannelDto>) =>
    handleRequest<CompanyChannelDto>(
      SDK.postApiCompanyChannel({ body: body as any }),
    ),
  update: (body: Partial<CompanyChannelDto>) =>
    handleRequest<CompanyChannelDto>(
      SDK.putApiCompanyChannel({ body: body as any }),
    ),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCompanyChannelById({ path: { id } })),
};

export const CompanyApiKeyService = {
  getById: (id: string) =>
    handleRequest<CompanyApiKeyDto>(
      SDK.getApiCompanyApiKeyById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiCompanyApiKeyDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCompanyApiKeyDropdown() as any),
  search: (body: PostApiCompanyApiKeySearchData["body"]) =>
    handleRequest<any>(SDK.postApiCompanyApiKeySearch({ body }) as any),
  create: (body: Partial<CompanyApiKeyDto>) =>
    handleRequest<CompanyApiKeyDto>(
      SDK.postApiCompanyApiKey({ body: body as any }),
    ),
  update: (body: Partial<CompanyApiKeyDto>) =>
    handleRequest<CompanyApiKeyDto>(
      SDK.putApiCompanyApiKey({ body: body as any }),
    ),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCompanyApiKeyById({ path: { id } })),
};

export const CompanyVerificationService = {
  getById: (id: string) =>
    handleRequest<CompanyVerificationDto>(
      SDK.getApiCompanyVerificationById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(
      SDK.getApiCompanyVerificationDetailById({ path: { id } }),
    ),
  getDropdown: () =>
    handleRequest<any>(SDK.getApiCompanyVerificationDropdown() as any),
  search: (body: PostApiCompanyVerificationSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiCompanyVerificationSearch({ body }) as any,
    ),
  create: (body: Partial<CompanyVerificationDto>) =>
    handleRequest<CompanyVerificationDto>(
      SDK.postApiCompanyVerification({ body: body as any }),
    ),
  update: (body: Partial<CompanyVerificationDto>) =>
    handleRequest<CompanyVerificationDto>(
      SDK.putApiCompanyVerification({ body: body as any }),
    ),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCompanyVerificationById({ path: { id } })),
};

export const CompanySettingService = {
  getById: (id: string) =>
    handleRequest<CompanySettingDto>(
      SDK.getApiCompanySettingById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiCompanySettingDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCompanySettingDropdown() as any),
  search: (body: PostApiCompanySettingSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiCompanySettingSearch({ body }) as any,
    ),
  create: (body: Partial<CompanySettingDto>) =>
    handleRequest<CompanySettingDto>(
      SDK.postApiCompanySetting({ body: body as any }),
    ),
  update: (body: Partial<CompanySettingDto>) =>
    handleRequest<CompanySettingDto>(
      SDK.putApiCompanySetting({ body: body as any }),
    ),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCompanySettingById({ path: { id } })),
};

// --- User ---
export const UserService = {
  getById: (id: string) =>
    handleRequest<UserDto>(SDK.getApiUserById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiUserDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiUserDropdown() as any),
  search: (body: PostApiUserSearchData["body"]) =>
    handleRequest<any>(SDK.postApiUserSearch({ body }) as any),
  inviteCompanyUser: (body: CreateCompanyUserRequest) =>
    handleRequest<UserDto>(SDK.postApiUserCompanyUsers({ body })),
  inviteSystemUser: (body: CreateSystemUserRequest) =>
    handleRequest<UserDto>(SDK.postApiUserSystemUsers({ body })),
  changeStatus: (id: string, body: ChangeUserStatusRequest) =>
    handleRequest<UserDto>(SDK.putApiUserByIdStatus({ path: { id }, body })),
};

export const UserProfileService = {
  getById: (id: string) =>
    handleRequest<UserProfileDto>(SDK.getApiUserProfileById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiUserProfileDropdown() as any),
  search: (body: PostApiUserProfileSearchData["body"]) =>
    handleRequest<any>(SDK.postApiUserProfileSearch({ body }) as any),
  create: (body: Partial<UserProfileDto>) =>
    handleRequest<UserProfileDto>(
      SDK.postApiUserProfile({ body: body as any }),
    ),
  update: (body: Partial<UserProfileDto>) =>
    handleRequest<UserProfileDto>(SDK.putApiUserProfile({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiUserProfileById({ path: { id } })),
};

// --- Logs & Audit ---
export const AuditLogService = {
  getById: (id: string) =>
    handleRequest<AuditLogDto>(SDK.getApiAuditLogById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiAuditLogDetailById({ path: { id } })),
  search: (body: PostApiAuditLogSearchData["body"]) =>
    handleRequest<any>(SDK.postApiAuditLogSearch({ body }) as any),
};

export const SysLogService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiSysLogById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiSysLogDropdown() as any),
  search: (body: PostApiSysLogSearchData["body"]) =>
    handleRequest<any>(SDK.postApiSysLogSearch({ body }) as any),
};

// --- Localization ---
export const CountryService = {
  getById: (id: string) =>
    handleRequest<CountryDto>(SDK.getApiCountryById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCountryDropdown() as any),
  search: (body: PostApiCountrySearchData["body"]) =>
    handleRequest<any>(SDK.postApiCountrySearch({ body }) as any),
  create: (body: Partial<CountryDto>) =>
    handleRequest<CountryDto>(SDK.postApiCountry({ body: body as any })),
  update: (body: Partial<CountryDto>) =>
    handleRequest<CountryDto>(SDK.putApiCountry({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCountryById({ path: { id } })),
};

export const CurrencyService = {
  getById: (id: string) =>
    handleRequest<CurrencyDto>(SDK.getApiCurrencyById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiCurrencyDropdown() as any),
  search: (body: PostApiCurrencySearchData["body"]) =>
    handleRequest<any>(SDK.postApiCurrencySearch({ body }) as any),
  create: (body: Partial<CurrencyDto>) =>
    handleRequest<CurrencyDto>(SDK.postApiCurrency({ body: body as any })),
  update: (body: Partial<CurrencyDto>) =>
    handleRequest<CurrencyDto>(SDK.putApiCurrency({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiCurrencyById({ path: { id } })),
};

// --- Infrastructure ---
export const JobService = {
  getById: (id: string) =>
    handleRequest<JobDto>(SDK.getApiJobById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiJobDropdown() as any),
  search: (body: PostApiJobSearchData["body"]) =>
    handleRequest<any>(SDK.postApiJobSearch({ body }) as any),
  create: (body: Partial<JobDto>) =>
    handleRequest<JobDto>(SDK.postApiJob({ body: body as any })),
  update: (body: Partial<JobDto>) =>
    handleRequest<JobDto>(SDK.putApiJob({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiJobById({ path: { id } })),
};

export const FileService = {
  getById: (id: string) =>
    handleRequest<FileDto>(SDK.getApiFileById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiFileDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiFileDropdown() as any),
  search: (body: PostApiFileSearchData["body"]) =>
    handleRequest<any>(SDK.postApiFileSearch({ body }) as any),
  create: (body: Partial<FileDto>) =>
    handleRequest<FileDto>(SDK.postApiFile({ body: body as any })),
  update: (body: Partial<FileDto>) =>
    handleRequest<FileDto>(SDK.putApiFile({ body: body as any })),
  // Binary upload: the /api/File endpoint accepts a multipart form. The
  // generated SDK only models the JSON metadata variant, so we post the
  // multipart payload directly through the configured client instance.
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.instance.post("/api/File", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiFileById({ path: { id } })),
};

// --- Others ---
export const IntegrationService = {
  getById: (id: string) =>
    handleRequest<IntegrationDto>(SDK.getApiIntegrationById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiIntegrationDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiIntegrationDropdown() as any),
  search: (body: PostApiIntegrationSearchData["body"]) =>
    handleRequest<any>(SDK.postApiIntegrationSearch({ body }) as any),
  create: (body: Partial<IntegrationDto>) =>
    handleRequest<IntegrationDto>(
      SDK.postApiIntegration({ body: body as any }),
    ),
  update: (body: Partial<IntegrationDto>) =>
    handleRequest<IntegrationDto>(SDK.putApiIntegration({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiIntegrationById({ path: { id } })),
};

export const IntegrationSyncLogService = {
  getById: (id: string) =>
    handleRequest<IntegrationSyncLogDto>(
      SDK.getApiIntegrationSyncLogById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(
      SDK.getApiIntegrationSyncLogDetailById({ path: { id } }),
    ),
  getDropdown: () => handleRequest<any>(SDK.getApiIntegrationSyncLogDropdown() as any),
  search: (body: PostApiIntegrationSyncLogSearchData["body"]) =>
    handleRequest<any>(
      SDK.postApiIntegrationSyncLogSearch({ body }) as any,
    ),
};

export const TagService = {
  getById: (id: string) =>
    handleRequest<TagDto>(SDK.getApiTagById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiTagDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiTagDropdown() as any),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiTagSearch({ body }) as any),
  create: (body: Partial<TagDto>) =>
    handleRequest<TagDto>(SDK.postApiTag({ body: body as any })),
  update: (body: Partial<TagDto>) =>
    handleRequest<TagDto>(SDK.putApiTag({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiTagById({ path: { id } })),
};

export const EntityTagService = {
  getById: (id: string) =>
    handleRequest<EntityTagDto>(SDK.getApiEntityTagById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiEntityTagDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiEntityTagDropdown() as any),
  search: (body: PostApiEntityTagSearchData["body"]) =>
    handleRequest<any>(SDK.postApiEntityTagSearch({ body }) as any),
  create: (body: Partial<EntityTagDto>) =>
    handleRequest<EntityTagDto>(SDK.postApiEntityTag({ body: body as any })),
  update: (body: Partial<EntityTagDto>) =>
    handleRequest<EntityTagDto>(SDK.putApiEntityTag({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiEntityTagById({ path: { id } })),
};

export const PricingService = {
  getById: (id: string) =>
    handleRequest<PricingDto>(SDK.getApiPricingById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiPricingDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiPricingDropdown() as any),
  search: (body: PostApiPricingSearchData["body"]) =>
    handleRequest<any>(SDK.postApiPricingSearch({ body }) as any),
  create: (body: Partial<PricingDto>) =>
    handleRequest<PricingDto>(SDK.postApiPricing({ body: body as any })),
  update: (body: Partial<PricingDto>) =>
    handleRequest<PricingDto>(SDK.putApiPricing({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiPricingById({ path: { id } })),
};

export const SettingService = {
  getById: (id: string) =>
    handleRequest<SettingDto>(SDK.getApiSettingById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiSettingDropdown() as any),
  search: (body: PostApiSettingSearchData["body"]) =>
    handleRequest<any>(SDK.postApiSettingSearch({ body }) as any),
  create: (body: Partial<SettingDto>) =>
    handleRequest<SettingDto>(SDK.postApiSetting({ body: body as any })),
  update: (body: Partial<SettingDto>) =>
    handleRequest<SettingDto>(SDK.putApiSetting({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiSettingById({ path: { id } })),
};

export const SecureSettingService = {
  search: (body: any) =>
    handleRequest<any>(SDK.postApiSecureSettingSearch({ body }) as any),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiSecureSettingById({ path: { id } })),
};

export const BlocklistService = {
  getById: (id: string) =>
    handleRequest<BlocklistDto>(SDK.getApiBlocklistById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiBlocklistDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiBlocklistDropdown() as any),
  search: (body: PostApiBlocklistSearchData["body"]) =>
    handleRequest<any>(SDK.postApiBlocklistSearch({ body }) as any),
  create: (body: Partial<BlocklistDto>) =>
    handleRequest<BlocklistDto>(SDK.postApiBlocklist({ body: body as any })),
  update: (body: Partial<BlocklistDto>) =>
    handleRequest<BlocklistDto>(SDK.putApiBlocklist({ body: body as any })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiBlocklistById({ path: { id } })),
};
