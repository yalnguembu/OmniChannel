import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiContactChannelStatusesOptions,
  patchApiContactChannelStatusMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Available contact-channel statuses — GET /api/ContactChannel/statuses.
 * The backend owns the vocabulary; consumers receive the raw string list.
 */
export function useContactChannelStatuses() {
  const query = useQuery({
    ...getApiContactChannelStatusesOptions(),
    select: (res: any) => (res?.data ?? []) as string[],
  });
  return {
    statuses: query.data ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Change the deliverability status of a contact channel, keyed by phone number
 * — PATCH /api/ContactChannel/status.
 */
export function useChangeContactChannelStatus(onDone?: () => void) {
  const { createMutationErrorHandler } = useErrorHandling();
  const mutation = useMutation({
    ...patchApiContactChannelStatusMutation(),
    onSuccess: () => {
      toast.success("Statut du canal mis à jour");
      onDone?.();
    },
    onError: createMutationErrorHandler(),
  });

  return {
    changeStatus: (phoneNumber: string, status: string) =>
      mutation.mutate({ body: { phoneNumber, status } }),
    isPending: mutation.isPending,
  };
}
