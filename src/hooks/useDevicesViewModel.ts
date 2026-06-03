import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiAuthDevicesOptions,
  getApiAuthDevicesQueryKey,
  deleteApiAuthDevicesByDeviceIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { UserDeviceDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the connected devices / active sessions page.
 */
export function useDevicesViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const query = useQuery({
    ...getApiAuthDevicesOptions(),
    select: (res: any) => (res?.data ?? []) as UserDeviceDto[],
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const revokeMutation = useMutation({
    ...deleteApiAuthDevicesByDeviceIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getApiAuthDevicesQueryKey() });
      toast.success("Appareil déconnecté");
    },
    onError: createMutationErrorHandler(),
  });

  return {
    devices: query.data ?? [],
    isLoading: query.isLoading,
    revoke: (deviceId: string) =>
      revokeMutation.mutate({ path: { deviceId } }),
    isRevoking: revokeMutation.isPending,
  };
}
