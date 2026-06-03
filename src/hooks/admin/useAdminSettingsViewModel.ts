import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiSettingSearchOptions,
  postApiSettingSearchQueryKey,
  postApiSecureSettingSearchOptions,
  postApiSecureSettingSearchQueryKey,
  postApiCountrySearchOptions,
  postApiCountrySearchQueryKey,
  postApiCurrencySearchOptions,
  postApiCurrencySearchQueryKey,
  postApiUserProfileSearchOptions,
  postApiUserProfileSearchQueryKey,
  postApiSettingMutation,
  putApiSettingMutation,
  deleteApiSettingByIdMutation,
  postApiCountryMutation,
  putApiCountryMutation,
  postApiCurrencyMutation,
  putApiCurrencyMutation,
  postApiUserProfileMutation,
  putApiUserProfileMutation,
  deleteApiUserProfileByIdMutation,
  deleteApiSecureSettingByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SettingDto,
  SearchSecureSettingResponse,
  CountryDto,
  CurrencyDto,
  UserProfileDto,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

export type SettingsModal =
  | "setting"
  | "country"
  | "currency"
  | "profile"
  | null;

/**
 * ViewModel for the admin Settings page (system settings).
 *
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by dumb section components.
 * Each section gets its own slice of data + the shared modal/edit state.
 */
export function useAdminSettingsViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [activeTab, setActiveTab] = useState("settings");
  const [modal, setModal] = useState<SettingsModal>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [profileActive, setProfileActive] = useState(true);
  const [countryActive, setCountryActive] = useState(true);
  const [currencyActive, setCurrencyActive] = useState(true);

  // ── Queries ──────────────────────────────────────────────────────────────
  const settingsQuery = useQuery({
    ...postApiSettingSearchOptions({
      body: { pageNumber: 1, pageSize: 200 } as any,
    }),
    enabled: activeTab === "settings",
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as SettingDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const secureQuery = useQuery({
    ...postApiSecureSettingSearchOptions({
      body: { pageNumber: 1, pageSize: 100 } as any,
    }),
    enabled: activeTab === "secure",
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as SearchSecureSettingResponse[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const countriesQuery = useQuery({
    ...postApiCountrySearchOptions({
      body: { pageNumber: 1, pageSize: 300 } as any,
    }),
    enabled: activeTab === "countries",
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as CountryDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const currenciesQuery = useQuery({
    ...postApiCurrencySearchOptions({
      body: { pageNumber: 1, pageSize: 100 } as any,
    }),
    enabled: activeTab === "currencies",
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as CurrencyDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const profilesQuery = useQuery({
    ...postApiUserProfileSearchOptions({
      body: { pageNumber: 1, pageSize: 50 } as any,
    }),
    enabled: activeTab === "profiles",
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as UserProfileDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (settingsQuery.isError && settingsQuery.error)
      handleRequestError(settingsQuery.error);
  }, [settingsQuery.isError, settingsQuery.error, handleRequestError]);

  useEffect(() => {
    if (secureQuery.isError && secureQuery.error)
      handleRequestError(secureQuery.error);
  }, [secureQuery.isError, secureQuery.error, handleRequestError]);

  useEffect(() => {
    if (countriesQuery.isError && countriesQuery.error)
      handleRequestError(countriesQuery.error);
  }, [countriesQuery.isError, countriesQuery.error, handleRequestError]);

  useEffect(() => {
    if (currenciesQuery.isError && currenciesQuery.error)
      handleRequestError(currenciesQuery.error);
  }, [currenciesQuery.isError, currenciesQuery.error, handleRequestError]);

  useEffect(() => {
    if (profilesQuery.isError && profilesQuery.error)
      handleRequestError(profilesQuery.error);
  }, [profilesQuery.isError, profilesQuery.error, handleRequestError]);

  const settings = settingsQuery.data?.items ?? [];
  const secureSettings = secureQuery.data?.items ?? [];
  const countries = countriesQuery.data?.items ?? [];
  const currencies = currenciesQuery.data?.items ?? [];
  const profiles = profilesQuery.data?.items ?? [];

  // ── Invalidation (per resource SearchQueryKey) ─────────────────────────────
  const invalidateSettings = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiSettingSearchQueryKey(),
      }),
    [queryClient],
  );
  const invalidateSecure = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiSecureSettingSearchQueryKey(),
      }),
    [queryClient],
  );
  const invalidateCountries = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiCountrySearchQueryKey(),
      }),
    [queryClient],
  );
  const invalidateCurrencies = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiCurrencySearchQueryKey(),
      }),
    [queryClient],
  );
  const invalidateProfiles = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiUserProfileSearchQueryKey(),
      }),
    [queryClient],
  );

  const handleCloseModal = useCallback(() => {
    setModal(null);
    setEditItem(null);
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const settingMutationOnSuccess = useCallback(() => {
    invalidateSettings();
    handleCloseModal();
    toast.success(editItem ? "Modifié" : "Créé");
  }, [invalidateSettings, handleCloseModal, editItem]);

  const createSettingMutation = useMutation({
    ...postApiSettingMutation(),
    onSuccess: settingMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const updateSettingMutation = useMutation({
    ...putApiSettingMutation(),
    onSuccess: settingMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const deleteSettingMutation = useMutation({
    ...deleteApiSettingByIdMutation(),
    onSuccess: () => {
      invalidateSettings();
      toast.success("Supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  const deleteSecureMutation = useMutation({
    ...deleteApiSecureSettingByIdMutation(),
    onSuccess: () => {
      invalidateSecure();
      toast.success("Supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  const countryMutationOnSuccess = useCallback(() => {
    invalidateCountries();
    handleCloseModal();
    toast.success(editItem ? "Modifié" : "Pays créé");
  }, [invalidateCountries, handleCloseModal, editItem]);

  const createCountryMutation = useMutation({
    ...postApiCountryMutation(),
    onSuccess: countryMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const updateCountryMutation = useMutation({
    ...putApiCountryMutation(),
    onSuccess: countryMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });

  const currencyMutationOnSuccess = useCallback(() => {
    invalidateCurrencies();
    handleCloseModal();
    toast.success(editItem ? "Modifié" : "Devise créée");
  }, [invalidateCurrencies, handleCloseModal, editItem]);

  const createCurrencyMutation = useMutation({
    ...postApiCurrencyMutation(),
    onSuccess: currencyMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const updateCurrencyMutation = useMutation({
    ...putApiCurrencyMutation(),
    onSuccess: currencyMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });

  const profileMutationOnSuccess = useCallback(() => {
    invalidateProfiles();
    handleCloseModal();
    toast.success(editItem ? "Modifié" : "Profil créé");
  }, [invalidateProfiles, handleCloseModal, editItem]);

  const createProfileMutation = useMutation({
    ...postApiUserProfileMutation(),
    onSuccess: profileMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const updateProfileMutation = useMutation({
    ...putApiUserProfileMutation(),
    onSuccess: profileMutationOnSuccess,
    onError: createMutationErrorHandler(),
  });
  const deleteProfileMutation = useMutation({
    ...deleteApiUserProfileByIdMutation(),
    onSuccess: () => {
      invalidateProfiles();
      toast.success("Supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  // ── Open handlers ────────────────────────────────────────────────────────
  const handleOpenSettingEdit = useCallback((s: SettingDto) => {
    setEditItem(s);
    setModal("setting");
  }, []);

  const handleOpenCountryCreate = useCallback(() => {
    setEditItem(null);
    setCountryActive(true);
    setModal("country");
  }, []);
  const handleOpenCountryEdit = useCallback((c: CountryDto) => {
    setEditItem(c);
    setCountryActive(c.isActive ?? true);
    setModal("country");
  }, []);

  const handleOpenCurrencyCreate = useCallback(() => {
    setEditItem(null);
    setCurrencyActive(true);
    setModal("currency");
  }, []);
  const handleOpenCurrencyEdit = useCallback((c: CurrencyDto) => {
    setEditItem(c);
    setCurrencyActive(c.isActive ?? true);
    setModal("currency");
  }, []);

  const handleOpenProfileCreate = useCallback(() => {
    setEditItem(null);
    setProfileActive(true);
    setModal("profile");
  }, []);
  const handleOpenProfileEdit = useCallback((p: UserProfileDto) => {
    setEditItem(p);
    setProfileActive(p.isActive ?? true);
    setModal("profile");
  }, []);

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleSubmitSetting = useCallback(
    (data: Partial<SettingDto>) => {
      if (editItem) {
        updateSettingMutation.mutate({
          body: { ...editItem, ...data } as any,
        });
      } else {
        createSettingMutation.mutate({ body: data as any });
      }
    },
    [editItem, updateSettingMutation, createSettingMutation],
  );

  const handleDeleteSetting = useCallback(
    (id: string) => deleteSettingMutation.mutate({ path: { id } }),
    [deleteSettingMutation],
  );

  const handleDeleteSecure = useCallback(
    (id: string) => deleteSecureMutation.mutate({ path: { id } }),
    [deleteSecureMutation],
  );

  const handleSubmitCountry = useCallback(
    (data: Partial<CountryDto>) => {
      const body = { ...data, isActive: countryActive };
      if (editItem) {
        updateCountryMutation.mutate({ body: { ...editItem, ...body } as any });
      } else {
        createCountryMutation.mutate({ body: body as any });
      }
    },
    [editItem, countryActive, updateCountryMutation, createCountryMutation],
  );

  const handleSubmitCurrency = useCallback(
    (data: Partial<CurrencyDto>) => {
      const body = { ...data, isActive: currencyActive };
      if (editItem) {
        updateCurrencyMutation.mutate({
          body: { ...editItem, ...body } as any,
        });
      } else {
        createCurrencyMutation.mutate({ body: body as any });
      }
    },
    [editItem, currencyActive, updateCurrencyMutation, createCurrencyMutation],
  );

  const handleSubmitProfile = useCallback(
    (data: { name?: string; description?: string; permissions?: string }) => {
      const perms = data.permissions
        ? data.permissions
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
            .join(",")
        : "";
      const body = { ...data, permissions: perms, isActive: profileActive };
      if (editItem) {
        updateProfileMutation.mutate({ body: { ...editItem, ...body } as any });
      } else {
        createProfileMutation.mutate({ body: body as any });
      }
    },
    [editItem, profileActive, updateProfileMutation, createProfileMutation],
  );

  const handleDeleteProfile = useCallback(
    (id: string) => deleteProfileMutation.mutate({ path: { id } }),
    [deleteProfileMutation],
  );

  return {
    // tab state
    activeTab,
    setActiveTab,

    // shared modal/edit state
    modal,
    editItem,
    handleCloseModal,

    // settings
    settings,
    isLoadingSettings: settingsQuery.isLoading,
    handleOpenSettingEdit,
    handleSubmitSetting,
    handleDeleteSetting,
    isSettingPending:
      createSettingMutation.isPending || updateSettingMutation.isPending,

    // secure settings
    secureSettings,
    isLoadingSecure: secureQuery.isLoading,
    handleDeleteSecure,
    isSecureDeletePending: deleteSecureMutation.isPending,

    // countries
    countries,
    isLoadingCountries: countriesQuery.isLoading,
    countryActive,
    setCountryActive,
    handleOpenCountryCreate,
    handleOpenCountryEdit,
    handleSubmitCountry,
    isCountryPending:
      createCountryMutation.isPending || updateCountryMutation.isPending,

    // currencies
    currencies,
    isLoadingCurrencies: currenciesQuery.isLoading,
    currencyActive,
    setCurrencyActive,
    handleOpenCurrencyCreate,
    handleOpenCurrencyEdit,
    handleSubmitCurrency,
    isCurrencyPending:
      createCurrencyMutation.isPending || updateCurrencyMutation.isPending,

    // profiles
    profiles,
    isLoadingProfiles: profilesQuery.isLoading,
    profileActive,
    setProfileActive,
    handleOpenProfileCreate,
    handleOpenProfileEdit,
    handleSubmitProfile,
    handleDeleteProfile,
    isProfilePending:
      createProfileMutation.isPending || updateProfileMutation.isPending,
    isProfileDeletePending: deleteProfileMutation.isPending,
  };
}
