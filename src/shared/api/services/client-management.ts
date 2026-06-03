import * as SDK from "@/shared/api/generated/sdk.gen";
import { handleRequest } from "../setup";

// --- Client ---
export const ClientService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiClientById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiClientDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiClientDropdown()),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiClientSearch({ body })),
  create: (body: any) =>
    handleRequest<any>(SDK.postApiClient({ body })),
  update: (body: any) =>
    handleRequest<any>(SDK.putApiClient({ body })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiClientById({ path: { id } })),
};

// --- Client Segment ---
export const ClientSegmentService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiClientSegmentById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiClientSegmentDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiClientSegmentDropdown()),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiClientSegmentSearch({ body })),
  create: (body: any) =>
    handleRequest<any>(SDK.postApiClientSegment({ body })),
  update: (body: any) =>
    handleRequest<any>(SDK.putApiClientSegment({ body })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiClientSegmentById({ path: { id } })),
};

// --- Client Segment Member ---
export const ClientSegmentMemberService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiClientSegmentMemberById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(
      SDK.getApiClientSegmentMemberDetailById({ path: { id } }),
    ),
  getDropdown: () =>
    handleRequest<any>(SDK.getApiClientSegmentMemberDropdown()),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiClientSegmentMemberSearch({ body })),
  create: (body: any) =>
    handleRequest<any>(SDK.postApiClientSegmentMember({ body })),
  update: (body: any) =>
    handleRequest<any>(SDK.putApiClientSegmentMember({ body })),
  delete: (id: string) =>
    handleRequest<any>(
      SDK.deleteApiClientSegmentMemberById({ path: { id } }),
    ),
};

// --- Client Channel Preference ---
export const ClientChannelPreferenceService = {
  getById: (id: string) =>
    handleRequest<any>(
      SDK.getApiClientChannelPreferenceById({ path: { id } }),
    ),
  getDetail: (id: string) =>
    handleRequest<any>(
      SDK.getApiClientChannelPreferenceDetailById({ path: { id } }),
    ),
  getDropdown: () =>
    handleRequest<any>(SDK.getApiClientChannelPreferenceDropdown()),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiClientChannelPreferenceSearch({ body })),
  create: (body: any) =>
    handleRequest<any>(SDK.postApiClientChannelPreference({ body })),
  update: (body: any) =>
    handleRequest<any>(SDK.putApiClientChannelPreference({ body })),
  delete: (id: string) =>
    handleRequest<any>(
      SDK.deleteApiClientChannelPreferenceById({ path: { id } }),
    ),
};

// --- Client Import ---
export const ClientImportService = {
  getById: (id: string) =>
    handleRequest<any>(SDK.getApiClientImportById({ path: { id } })),
  getDetail: (id: string) =>
    handleRequest<any>(SDK.getApiClientImportDetailById({ path: { id } })),
  getDropdown: () => handleRequest<any>(SDK.getApiClientImportDropdown()),
  search: (body: any) =>
    handleRequest<any>(SDK.postApiClientImportSearch({ body })),
  create: (body: any) =>
    handleRequest<any>(SDK.postApiClientImport({ body })),
  update: (body: any) =>
    handleRequest<any>(SDK.putApiClientImport({ body })),
  delete: (id: string) =>
    handleRequest<any>(SDK.deleteApiClientImportById({ path: { id } })),
};
