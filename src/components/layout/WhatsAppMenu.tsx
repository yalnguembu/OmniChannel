import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ChevronDown, Check, Inbox } from "lucide-react";
import { getApiSenderDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { cn } from "@/lib/utils";

/**
 * WhatsApp entry for the portal sidebar.
 *
 * Renders as a collapsible dropdown: opening it lists the registered WhatsApp
 * senders. Picking one sets it as the active sender in the WhatsApp store and
 * navigates to the inbox (`/wa`) — the conversation list and outgoing messages
 * are then automatically scoped to that sender.
 */
export function WhatsAppMenu({ active }: { active: boolean }) {
  const navigate = useNavigate();
  const { senders, selectedSenderId, setSenders, setSelectedSenderId } =
    useWhatsAppStore();
  const [open, setOpen] = useState(active);

  // Load the sender dropdown and hydrate the WhatsApp store so the inbox is
  // ready with the same list the moment we navigate to it.
  const { data: senderItems = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    staleTime: 5 * 60_000,
    select: (res: any) =>
      ((res?.data ?? []) as any[]).map((s) => ({
        id: s.id as string,
        senderName: s.displayName || s.address || s.id,
      })),
  });

  useEffect(() => {
    if (senderItems.length) setSenders(senderItems);
  }, [senderItems, setSenders]);

  const list = senders.length ? senders : senderItems;

  const goTo = (senderId: string) => {
    // The sender lives in the URL so multiple inboxes can stay open at once;
    // set it eagerly too to avoid a flash before the page syncs from the route.
    setSelectedSenderId(senderId);
    navigate({ to: "/wa/$senderId", params: { senderId } });
  };

  const selectedName = list.find((s) => s.id === selectedSenderId)?.senderName;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-sm cursor-pointer transition-all duration-150 relative group",
          active ? "bg-[#E8F4F8]" : "hover:bg-[#F0F2F4]",
        )}
        style={{ width: "calc(100% - 0.75rem)" }}
      >
        {active && (
          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#2E8FAD] rounded-r-[2px]" />
        )}
        <MessageCircle
          size={15}
          className={cn("shrink-0", active ? "text-[#2E8FAD]" : "text-[#8BAFC0]")}
          strokeWidth={1.2}
        />
        <span className="flex-1 min-w-0 text-left">
          <span
            className={cn(
              "block text-[13px] leading-tight",
              active ? "text-[#1B5E82] font-medium" : "text-[#4A7A94]",
            )}
          >
            WhatsApp
          </span>
          {selectedName && (
            <span className="block text-[10.5px] text-[#8BAFC0] truncate leading-tight">
              {selectedName}
            </span>
          )}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "shrink-0 text-[#B8CDD8] transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-0.5 ml-6 mr-2 border-l border-[#E5E7EB] pl-1.5 py-0.5 space-y-0.5">
          {list.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[11.5px] text-[#B8CDD8] italic">
              Aucun expéditeur
            </p>
          ) : (
            list.map((s) => {
              const isSelected = selectedSenderId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => goTo(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] cursor-pointer transition-colors text-left",
                    isSelected && active
                      ? "bg-[#E8F4F8]"
                      : "hover:bg-[#F0F2F4]",
                  )}
                >
                  <Inbox
                    size={13}
                    className={cn(
                      "shrink-0",
                      isSelected ? "text-[#2E8FAD]" : "text-[#B8CDD8]",
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate text-[12.5px]",
                      isSelected
                        ? "text-[#1B5E82] font-medium"
                        : "text-[#4A7A94]",
                    )}
                  >
                    {s.senderName}
                  </span>
                  {isSelected && (
                    <Check size={12} className="shrink-0 text-[#2E8FAD]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
