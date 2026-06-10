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
  CreateSettingRequest,
  UpdateSettingRequest,
  SearchSettingResponse,
  SearchSecureSettingResponse,
  CreateCountryRequest,
  UpdateCountryRequest,
  SearchCountryResponse,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  SearchCurrencyResponse,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  SearchUserProfileResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

export type SettingsModal =
  | "setting"
  | "secureSetting"
  | "country"
  | "currency"
  | "profile"
  | null;

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
      body: { pageNumber: 1, pageSize: 200 },
    }),
    enabled: activeTab === "settings",
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchSettingResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const secureQuery = useQuery({
    ...postApiSecureSettingSearchOptions({
      body: { pageNumber: 1, pageSize: 100 },
    }),
    enabled: activeTab === "secure",
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchSecureSettingResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const countriesQuery = useQuery({
    ...postApiCountrySearchOptions({
      body: { pageNumber: 1, pageSize: 300 },
    }),
    enabled: activeTab === "countries",
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchCountryResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const currenciesQuery = useQuery({
    ...postApiCurrencySearchOptions({
      body: { pageNumber: 1, pageSize: 100 },
    }),
    enabled: activeTab === "currencies",
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchCurrencyResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const profilesQuery = useQuery({
    ...postApiUserProfileSearchOptions({
      body: { pageNumber: 1, pageSize: 50 },
    }),
    enabled: activeTab === "profiles",
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchUserProfileResponse[],
      total: res?.data?.totalCount ?? 0,
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
  const handleOpenSettingCreate = useCallback(() => {
    setEditItem(null);
    setModal("setting");
  }, []);

  const handleOpenSettingEdit = useCallback((s: SearchSettingResponse) => {
    setEditItem(s);
    setModal("setting");
  }, []);

  const handleOpenSecureSettingCreate = useCallback(() => {
    setEditItem(null);
    setModal("secureSetting");
  }, []);

  const handleSubmitSecureSetting = useCallback(
    (data: any) => {
      if (editItem) {
        // Update - would need putApiSecureSettingMutation if available
        console.warn("Secure setting update not yet implemented");
      } else {
        // Create - would need postApiSecureSettingMutation if available
        console.warn("Secure setting create not yet implemented");
      }
    },
    [editItem],
  );

  const handleOpenCountryCreate = useCallback(() => {
    setEditItem(null);
    setCountryActive(true);
    setModal("country");
  }, []);
  const handleOpenCountryEdit = useCallback((c: SearchCountryResponse) => {
    setEditItem(c);
    setCountryActive(c.isActive ?? true);
    setModal("country");
  }, []);

  const handleOpenCurrencyCreate = useCallback(() => {
    setEditItem(null);
    setCurrencyActive(true);
    setModal("currency");
  }, []);
  const handleOpenCurrencyEdit = useCallback((c: SearchCurrencyResponse) => {
    setEditItem(c);
    setCurrencyActive(c.isActive ?? true);
    setModal("currency");
  }, []);

  const handleOpenProfileCreate = useCallback(() => {
    setEditItem(null);
    setProfileActive(true);
    setModal("profile");
  }, []);
  const handleOpenProfileEdit = useCallback((p: SearchUserProfileResponse) => {
    setEditItem(p);
    setProfileActive(p.isActive ?? true);
    setModal("profile");
  }, []);

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleSubmitSetting = useCallback(
    (data: CreateSettingRequest) => {
      if (editItem) {
        const body: UpdateSettingRequest = { ...data, id: editItem.id };
        updateSettingMutation.mutate({ body });
      } else {
        createSettingMutation.mutate({ body: data });
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
    (data: CreateCountryRequest) => {
      if (editItem) {
        const body: UpdateCountryRequest = {
          ...data,
          isActive: countryActive,
          id: editItem.id,
        };
        updateCountryMutation.mutate({ body });
      } else {
        const body: CreateCountryRequest = { ...data, isActive: countryActive };
        createCountryMutation.mutate({ body });
      }
    },
    [editItem, countryActive, updateCountryMutation, createCountryMutation],
  );

  const handleSubmitCurrency = useCallback(
    (data: CreateCurrencyRequest) => {
      if (editItem) {
        const body: UpdateCurrencyRequest = {
          ...data,
          isActive: currencyActive,
          id: editItem.id,
        };
        updateCurrencyMutation.mutate({ body });
      } else {
        const body: CreateCurrencyRequest = {
          ...data,
          isActive: currencyActive,
        };
        createCurrencyMutation.mutate({ body });
      }
    },
    [editItem, currencyActive, updateCurrencyMutation, createCurrencyMutation],
  );

  const handleSubmitProfile = useCallback(
    (data: CreateUserProfileRequest) => {
      const perms = data.permissions
        ? data.permissions
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
            .join(",")
        : "";
      if (editItem) {
        const body: UpdateUserProfileRequest = {
          ...data,
          permissions: perms,
          isActive: profileActive,
          id: editItem.id,
        };
        updateProfileMutation.mutate({ body });
      } else {
        const body: CreateUserProfileRequest = {
          ...data,
          permissions: perms,
          isActive: profileActive,
        };
        createProfileMutation.mutate({ body });
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
    handleOpenSettingCreate,
    handleOpenSettingEdit,
    handleSubmitSetting,
    handleDeleteSetting,
    isSettingPending:
      createSettingMutation.isPending || updateSettingMutation.isPending,

    // secure settings
    secureSettings,
    isLoadingSecure: secureQuery.isLoading,
    handleOpenSecureSettingCreate,
    handleSubmitSecureSetting,
    handleDeleteSecure,
    isSecureSettingPending: false, // Update when mutations are available
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
