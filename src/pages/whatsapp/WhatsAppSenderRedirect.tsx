import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getApiSenderDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { PageLoader } from "@/components/feedback/PageLoader";

/**
 * Bare `/wa` resolver: WhatsApp is always scoped to a sender via the URL
 * (`/wa/$senderId`). When no sender is in the URL we redirect to the first
 * available one, or show an empty state if none is configured.
 */
export function WhatsAppSenderRedirect() {
  const navigate = useNavigate();

  const { data: senders = [], isLoading } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as Array<{ id: string }>,
  });

  useEffect(() => {
    if (senders.length > 0) {
      navigate({
        to: "/wa/$senderId",
        params: { senderId: senders[0].id },
        replace: true,
      });
    }
  }, [senders, navigate]);

  if (!isLoading && senders.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center text-center px-6">
        <p className="text-[14px] text-[#8BAFC0]">
          Aucun expéditeur WhatsApp configuré.
        </p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex items-center justify-center">
      <PageLoader />
    </div>
  );
}
