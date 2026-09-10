import React, { useEffect, useState } from "react";
import { ConversationList } from "@/components/whatsapp/sidebar/ConversationList";
import { ChatArea } from "@/components/whatsapp/chat/ChatArea";
import { TemplateBroadcastModal } from "@/components/whatsapp/chat/TemplateBroadcastModal";
import { useSignalR } from "@/hooks/useSignalR";
import { useWhatsappUrlState } from "@/hooks/useWhatsappUrlState";
import { useWhatsAppStore } from "@/store/useWhatsappStore";

interface WhatsAppPageProps {
  senderId?: string;
}

export const WhatsAppPage: React.FC<WhatsAppPageProps> = ({ senderId }) => {
  const activeConversationId = useWhatsAppStore((s) => s.activeConversationId);
  const isMobileChatOpen = useWhatsAppStore((s) => s.isMobileChatOpen);
  const setSelectedSenderId = useWhatsAppStore((s) => s.setSelectedSenderId);
  const [tplOpen, setTplOpen] = useState(false);

  useEffect(() => {
    setSelectedSenderId(senderId ?? null);
  }, [senderId, setSelectedSenderId]);

  // Keeps `?c=<conversation>` and the sidebar filters in the URL, so a reload
  // (or a shared link) reopens the same discussion with the same filters.
  useWhatsappUrlState();

  useSignalR();

  return (
    <>
      <div
        className="flex h-dvh max-w-450 mx-auto bg-white shadow-[0_0_20px_rgba(0,0,0,0.12)] relative overflow-hidden"
        style={{ background: "#dfe5e7" }}
      >
        {/* Sidebar — hidden on mobile when chat is open */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0 min-w-0
            transition-transform duration-300 ease-in-out
            ${isMobileChatOpen && activeConversationId ? "-translate-x-full" : "translate-x-0"}
          `}
        >
          <ConversationList onTemplateBroadcast={() => setTplOpen(true)} />
        </div>

        {/* Chat area — slides in on mobile */}
        <div
          className={`
            absolute inset-0 md:relative md:inset-auto md:translate-x-0 flex-1 min-w-0 bg-wa-chat-bg
            transition-transform duration-300 ease-in-out flex flex-col
            ${isMobileChatOpen && activeConversationId ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
        >
          <ChatArea />
        </div>
      </div>

      {tplOpen && (
        <TemplateBroadcastModal open={tplOpen} onClose={() => setTplOpen(false)} />
      )}
    </>
  );
};
